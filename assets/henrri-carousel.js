// Carrossel por scroll-snap: setas, bolinhas e autoplay opcional.
// Uso: <henrri-carousel data-autoplay="5"> com [data-track], [data-prev], [data-next], [data-dots]
if (!customElements.get('henrri-carousel')) {
  customElements.define(
    'henrri-carousel',
    class HenrriCarousel extends HTMLElement {
      connectedCallback() {
        this.track = this.querySelector('[data-track]');
        if (!this.track) return;
        this.prev = this.querySelector('[data-prev]');
        this.next = this.querySelector('[data-next]');
        this.dots = this.querySelector('[data-dots]');
        this.slides = Array.from(this.track.children);
        this.autoplay = Number(this.dataset.autoplay || 0);

        this.prev?.addEventListener('click', () => this.go(-1));
        this.next?.addEventListener('click', () => this.go(1));
        this.track.addEventListener('scroll', () => this.update(), { passive: true });

        if (this.dots) this.renderDots();
        this.update();

        if (this.autoplay > 0 && this.slides.length > 1) {
          this.start();
          this.addEventListener('mouseenter', () => this.stop());
          this.addEventListener('mouseleave', () => this.start());
          this.addEventListener('focusin', () => this.stop());
        }
      }

      disconnectedCallback() {
        this.stop();
      }

      get step() {
        const first = this.slides[0];
        if (!first) return this.track.clientWidth;
        const gap = parseFloat(getComputedStyle(this.track).columnGap) || 0;
        return first.getBoundingClientRect().width + gap;
      }

      get index() {
        return Math.round(this.track.scrollLeft / this.step);
      }

      get atEnd() {
        return this.track.scrollLeft + this.track.clientWidth >= this.track.scrollWidth - 2;
      }

      go(direction) {
        if (direction > 0 && this.atEnd) {
          this.track.scrollTo({ left: 0, behavior: 'smooth' });
          return;
        }
        this.track.scrollBy({ left: direction * this.step, behavior: 'smooth' });
      }

      goTo(index) {
        this.track.scrollTo({ left: index * this.step, behavior: 'smooth' });
      }

      renderDots() {
        this.dots.innerHTML = '';
        this.slides.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'henrri-dot';
          dot.setAttribute('aria-label', `${i + 1} / ${this.slides.length}`);
          dot.addEventListener('click', () => this.goTo(i));
          this.dots.appendChild(dot);
        });
      }

      update() {
        if (this.prev) this.prev.disabled = this.track.scrollLeft <= 2 && !this.autoplay;
        if (this.next) this.next.disabled = this.atEnd && !this.autoplay;
        if (this.dots) {
          const current = this.index;
          Array.from(this.dots.children).forEach((dot, i) => {
            dot.setAttribute('aria-current', i === current ? 'true' : 'false');
          });
        }
      }

      start() {
        this.stop();
        this.timer = setInterval(() => this.go(1), this.autoplay * 1000);
      }

      stop() {
        clearInterval(this.timer);
      }
    }
  );
}
