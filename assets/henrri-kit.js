// Montador de kit: o cliente escolhe uma sugestão de cores e os tamanhos;
// as peças vão para o carrinho como produtos separados (o produto "kit" em si não é adicionado).
if (!customElements.get('henrri-kit-builder')) {
  customElements.define(
    'henrri-kit-builder',
    class HenrriKitBuilder extends HTMLElement {
      connectedCallback() {
        this.count = Number(this.dataset.count);
        this.discount = Number(this.dataset.discount) || 0;
        this.moneyFormat = this.dataset.moneyFormat || 'R$ {{amount_with_comma_separator}}';
        this.strings = window.henrriKitStrings || {};
        this.pieces = JSON.parse(this.querySelector('[data-kit-pieces]').textContent).filter(
          (piece) => piece.variants.some((variant) => variant.available)
        );
        if (!this.pieces.length) return;

        // Cada posição do kit: { piece: índice da peça (cor), size: tamanho escolhido }
        this.slots = Array.from({ length: this.count }, () => ({ piece: 0, size: null }));
        this.suggestion = 0;

        this.renderSuggestions();
        this.renderSizeAll();
        this.renderSlots();
        this.update();

        this.querySelector('[data-kit-add]').addEventListener('click', () => this.addToCart());
      }

      get suggestions() {
        const list = this.pieces.map((piece, index) => ({
          label: `${this.count}x ${piece.color}`,
          swatches: [piece.swatch],
          pieces: Array(this.count).fill(index),
        }));
        if (this.pieces.length > 1) {
          list.push({
            label: this.strings.mix || 'Mix de cores',
            swatches: this.pieces.slice(0, 4).map((piece) => piece.swatch),
            pieces: Array.from({ length: this.count }, (_, i) => i % this.pieces.length),
          });
        }
        return list;
      }

      renderSuggestions() {
        const container = this.querySelector('[data-kit-suggestions]');
        container.innerHTML = '';
        this.suggestions.forEach((suggestion, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'henrri-kit__suggestion';
          button.setAttribute('aria-pressed', index === this.suggestion);
          button.innerHTML = `<span class="henrri-kit__suggestion-swatches">${suggestion.swatches
            .map((swatch) => `<span style="--swatch-bg: ${swatch}"></span>`)
            .join('')}</span><span></span>`;
          button.lastElementChild.textContent = suggestion.label;
          button.addEventListener('click', () => this.applySuggestion(index));
          container.appendChild(button);
        });
      }

      applySuggestion(index) {
        this.suggestion = index;
        const suggestion = this.suggestions[index];
        this.slots.forEach((slot, i) => {
          slot.piece = suggestion.pieces[i];
          if (slot.size && !this.variantFor(slot)) slot.size = null;
        });
        this.querySelectorAll('.henrri-kit__suggestion').forEach((button, i) =>
          button.setAttribute('aria-pressed', i === index)
        );
        this.renderSlots();
        this.update();
      }

      get allSizes() {
        const sizes = [];
        this.pieces.forEach((piece) =>
          piece.variants.forEach((variant) => {
            if (!sizes.includes(variant.size)) sizes.push(variant.size);
          })
        );
        return sizes;
      }

      renderSizeAll() {
        const container = this.querySelector('[data-kit-size-all]');
        container.innerHTML = '';
        this.allSizes.forEach((size) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'henrri-kit__size';
          button.textContent = size;
          button.dataset.size = size;
          button.addEventListener('click', () => {
            this.slots.forEach((slot) => {
              const piece = this.pieces[slot.piece];
              const variant = piece.variants.find((v) => v.size === size);
              slot.size = variant && variant.available ? size : slot.size;
            });
            this.renderSlots();
            this.update();
          });
          container.appendChild(button);
        });
      }

      renderSlots() {
        const list = this.querySelector('[data-kit-slots]');
        list.innerHTML = '';
        this.slots.forEach((slot, slotIndex) => {
          const piece = this.pieces[slot.piece];
          const item = document.createElement('li');
          item.className = 'henrri-kit__slot';
          item.innerHTML = `
            <img class="henrri-kit__slot-image" src="${piece.image || ''}" alt="" loading="lazy" width="60" height="90">
            <div class="henrri-kit__slot-body">
              <p class="henrri-kit__slot-title"></p>
              <div class="henrri-kit__slot-colors"></div>
              <div class="henrri-kit__slot-sizes"></div>
            </div>`;
          item.querySelector('.henrri-kit__slot-title').textContent = `${this.strings.piece || 'Peça'} ${slotIndex + 1}: ${piece.color}`;

          const colors = item.querySelector('.henrri-kit__slot-colors');
          this.pieces.forEach((option, pieceIndex) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'henrri-kit__color';
            button.style.setProperty('--swatch-bg', option.swatch);
            button.title = option.color;
            button.setAttribute('aria-label', option.color);
            button.setAttribute('aria-pressed', pieceIndex === slot.piece);
            button.addEventListener('click', () => {
              slot.piece = pieceIndex;
              if (slot.size && !this.variantFor(slot)) slot.size = null;
              this.markCustom();
              this.renderSlots();
              this.update();
            });
            colors.appendChild(button);
          });

          const sizes = item.querySelector('.henrri-kit__slot-sizes');
          piece.variants.forEach((variant) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'henrri-kit__size henrri-kit__size--small';
            button.textContent = variant.size;
            button.disabled = !variant.available;
            button.setAttribute('aria-pressed', variant.size === slot.size);
            button.addEventListener('click', () => {
              slot.size = variant.size;
              this.renderSlots();
              this.update();
            });
            sizes.appendChild(button);
          });

          list.appendChild(item);
        });
      }

      markCustom() {
        this.suggestion = -1;
        this.querySelectorAll('.henrri-kit__suggestion').forEach((button) => button.setAttribute('aria-pressed', false));
      }

      variantFor(slot) {
        const variant = this.pieces[slot.piece].variants.find((v) => v.size === slot.size);
        return variant && variant.available ? variant : null;
      }

      update() {
        const variants = this.slots.map((slot) => this.variantFor(slot));
        const ready = variants.every(Boolean);

        // Tamanho para todas: marca quando todas as peças têm o mesmo tamanho
        const sameSize = this.slots.every((slot) => slot.size && slot.size === this.slots[0].size) ? this.slots[0].size : null;
        this.querySelectorAll('[data-kit-size-all] .henrri-kit__size').forEach((button) => {
          button.setAttribute('aria-pressed', button.dataset.size === sameSize);
          button.disabled = !this.slots.every((slot) =>
            this.pieces[slot.piece].variants.some((v) => v.size === button.dataset.size && v.available)
          );
        });

        // Resumo: "3x Branca (M), 2x Preta (G)"
        const groups = {};
        this.slots.forEach((slot) => {
          const key = `${this.pieces[slot.piece].color}${slot.size ? ` (${slot.size})` : ''}`;
          groups[key] = (groups[key] || 0) + 1;
        });
        this.querySelector('[data-kit-chosen]').textContent = Object.entries(groups)
          .map(([key, qty]) => `${qty}x ${key}`)
          .join(', ');

        const total = this.slots.reduce((sum, slot) => {
          const piece = this.pieces[slot.piece];
          const variant = this.variantFor(slot) || piece.variants.find((v) => v.available) || piece.variants[0];
          return sum + variant.price;
        }, 0);
        const compare = this.querySelector('[data-kit-compare]');
        if (this.discount > 0) {
          compare.hidden = false;
          compare.textContent = this.formatMoney(total);
          this.querySelector('[data-kit-total]').textContent = this.formatMoney(Math.round((total * (100 - this.discount)) / 100));
        } else {
          compare.hidden = true;
          this.querySelector('[data-kit-total]').textContent = this.formatMoney(total);
        }

        const add = this.querySelector('[data-kit-add]');
        add.classList.toggle('is-pending', !ready);
        this.querySelector('[data-kit-error]').hidden = true;
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

      showError(message) {
        const error = this.querySelector('[data-kit-error]');
        error.textContent = message;
        error.hidden = false;
      }

      async addToCart() {
        const variants = this.slots.map((slot) => this.variantFor(slot));
        if (!variants.every(Boolean)) {
          this.showError(this.strings.choose_sizes || 'Escolha o tamanho de todas as peças.');
          this.querySelector('[data-kit-size-all]').scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const quantities = {};
        variants.forEach((variant) => (quantities[variant.id] = (quantities[variant.id] || 0) + 1));
        const items = Object.entries(quantities).map(([id, quantity]) => ({ id: Number(id), quantity }));

        const button = this.querySelector('[data-kit-add]');
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
        } catch (error) {
          this.showError(error.message || this.strings.error || 'Não foi possível adicionar o kit.');
        } finally {
          button.disabled = false;
          button.textContent = label;
        }
      }
    }
  );
}
