// Compre o look: pontos na foto abrem o produto, e o botão leva todas as peças para o carrinho.
if (!customElements.get('henrri-look')) {
  customElements.define(
    'henrri-look',
    class HenrriLook extends HTMLElement {
      connectedCallback() {
        this.products = JSON.parse(this.querySelector('[data-look-products]')?.textContent || '{}');
        this.strings = window.henrriLookStrings || {};
        this.moneyFormat = this.dataset.moneyFormat || 'R$ {{amount_with_comma_separator}}';

        this.querySelectorAll('[data-look-spot]').forEach((spot) => {
          spot.addEventListener('click', (event) => {
            event.stopPropagation();
            this.toggle(spot.dataset.lookSpot);
          });
        });
        this.querySelectorAll('[data-look-close]').forEach((button) =>
          button.addEventListener('click', () => this.close())
        );
        this.querySelectorAll('[data-look-pop]').forEach((pop) =>
          pop.addEventListener('click', (event) => event.stopPropagation())
        );
        document.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (event) => event.key === 'Escape' && this.close());

        // O tamanho escolhido no cartão do ponto e na lista é o mesmo
        this.querySelectorAll('[data-look-size]').forEach((select) => {
          select.addEventListener('change', () => {
            this.querySelectorAll(`[data-look-size="${select.dataset.lookSize}"]`).forEach((other) => {
              other.value = select.value;
            });
            this.hideError();
            this.updateTotal();
          });
        });

        this.querySelectorAll('[data-look-add]').forEach((button) =>
          button.addEventListener('click', () => this.addOne(button))
        );
        this.querySelector('[data-look-buy]')?.addEventListener('click', (event) => this.addAll(event.currentTarget));

        this.updateTotal();
      }

      toggle(index) {
        const pop = this.querySelector(`[data-look-pop="${index}"]`);
        const open = pop && pop.hidden;
        this.close();
        if (!open) return;
        pop.hidden = false;
        this.querySelector(`[data-look-spot="${index}"]`).setAttribute('aria-expanded', 'true');
      }

      close() {
        this.querySelectorAll('[data-look-pop]').forEach((pop) => (pop.hidden = true));
        this.querySelectorAll('[data-look-spot]').forEach((spot) => spot.setAttribute('aria-expanded', 'false'));
      }

      // Variante escolhida: a única do produto, ou a do seletor de tamanho
      variantFor(index) {
        const product = this.products[index];
        if (!product || !product.available) return null;
        if (product.variants.length === 1) return product.variants[0];
        const select = this.querySelector(`[data-look-size="${index}"]`);
        return product.variants.find((variant) => String(variant.id) === select?.value) || null;
      }

      updateTotal() {
        const total = Object.entries(this.products).reduce((sum, [index, product]) => {
          if (!product.available) return sum;
          const variant = this.variantFor(index) || product.variants.find((v) => v.available) || product.variants[0];
          return sum + variant.price;
        }, 0);
        const target = this.querySelector('[data-look-total]');
        if (target) target.textContent = this.formatMoney(total);
      }

      addOne(button) {
        const index = button.dataset.lookAdd;
        const variant = this.variantFor(index);
        if (!variant) {
          this.querySelector(`[data-look-pop="${index}"] [data-look-size]`)?.focus();
          button.dataset.label ||= button.textContent;
          button.textContent = this.strings.choose_one || 'Escolha o tamanho.';
          setTimeout(() => (button.textContent = button.dataset.label), 1800);
          return;
        }
        this.add([{ id: variant.id, quantity: 1 }], button).then((ok) => ok && this.close());
      }

      addAll(button) {
        const indexes = Object.keys(this.products).filter((index) => this.products[index].available);
        const missing = indexes.find((index) => !this.variantFor(index));
        if (missing !== undefined) {
          this.showError(this.strings.choose_size || 'Escolha o tamanho de todas as peças.');
          this.querySelector(`[data-look-item="${missing}"] [data-look-size]`)?.focus();
          return;
        }
        this.add(
          indexes.map((index) => ({ id: this.variantFor(index).id, quantity: 1 })),
          button
        );
      }

      async add(items, button) {
        if (!items.length) return false;
        const label = button.textContent;
        button.disabled = true;
        button.textContent = this.strings.adding || 'Adicionando...';

        const drawer = document.querySelector('cart-drawer');
        const body = { items };
        if (drawer) {
          body.sections = drawer.getSectionsToRender().map((section) => section.id);
          body.sections_url = window.location.pathname;
        }

        try {
          const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await response.json();
          if (!response.ok || data.status) throw new Error(data.description || data.message);

          if (drawer) {
            data.id = items[0].id;
            drawer.classList.remove('is-empty');
            drawer.renderContents(data);
          } else {
            window.location.href = window.routes?.cart_url || '/cart';
          }
          return true;
        } catch (error) {
          this.showError(error.message || this.strings.error || 'Não foi possível adicionar ao carrinho.');
          return false;
        } finally {
          button.disabled = false;
          button.textContent = label;
        }
      }

      showError(message) {
        const error = this.querySelector('[data-look-error]');
        if (!error) return;
        error.textContent = message;
        error.hidden = false;
      }

      hideError() {
        const error = this.querySelector('[data-look-error]');
        if (error) error.hidden = true;
      }

      formatMoney(cents) {
        const value = (cents / 100).toFixed(2);
        const [int, dec] = value.split('.');
        const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        const formatted = this.moneyFormat
          .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, `${withDots},${dec}`)
          .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/, withDots)
          .replace(/\{\{\s*amount\s*\}\}/, `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${dec}`)
          .replace(/\{\{\s*amount_no_decimals\s*\}\}/, int);
        const tmp = document.createElement('span');
        tmp.innerHTML = formatted;
        return tmp.textContent;
      }
    }
  );
}
