// Mega menu abre ao passar o mouse no desktop
(() => {
  const desktop = window.matchMedia('(min-width: 990px) and (hover: hover)');
  const timers = new WeakMap();

  const bind = (details) => {
    if (details.dataset.henrriHover) return;
    details.dataset.henrriHover = 'true';
    const li = details.closest('li') || details;
    const summary = details.querySelector('summary');

    summary?.addEventListener('click', (event) => {
      if (!desktop.matches || details.dataset.henrriHovered !== 'true') return;
      event.preventDefault();
    });

    li.addEventListener('mouseenter', () => {
      if (!desktop.matches) return;
      clearTimeout(timers.get(details));
      document.querySelectorAll('.header__inline-menu details.mega-menu[open]').forEach((other) => {
        if (other !== details) other.removeAttribute('open');
      });
      details.setAttribute('open', '');
      details.dataset.henrriHovered = 'true';
      details.querySelector('summary')?.setAttribute('aria-expanded', 'true');
    });

    li.addEventListener('mouseleave', () => {
      if (!desktop.matches) return;
      timers.set(
        details,
        setTimeout(() => {
          details.removeAttribute('open');
          details.dataset.henrriHovered = 'false';
          details.querySelector('summary')?.setAttribute('aria-expanded', 'false');
        }, 150)
      );
    });
  };

  const init = () => document.querySelectorAll('.header__inline-menu details.mega-menu').forEach(bind);
  init();
  document.addEventListener('shopify:section:load', init);
})();
