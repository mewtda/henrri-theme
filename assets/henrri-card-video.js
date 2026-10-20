(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target: video, isIntersecting }) => {
        if (isIntersecting) {
          video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      });
    },
    { threshold: 0.25 }
  );

  const observe = (root) => {
    root.querySelectorAll?.('video.henrri-card-video:not([data-henrri-observed])').forEach((video) => {
      video.dataset.henrriObserved = 'true';
      video.muted = true;
      video.playsInline = true;
      observer.observe(video);
    });
  };

  const init = () => observe(document);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => node.nodeType === 1 && observe(node)));
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
