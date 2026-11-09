/**
 * Fachada de video de YouTube: la página solo carga una imagen; el iframe de
 * youtube-nocookie.com se crea cuando la persona pulsa "reproducir".
 */
export function initVideos(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>('.wsg-video-facade').forEach((overlay) => {
    const play = () => {
      const src = overlay.dataset.video;
      const wrapper = overlay.closest<HTMLElement>('.elementor-wrapper');
      const target = wrapper?.querySelector<HTMLElement>('.elementor-video') ?? wrapper;
      if (!src || !target) return;
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = 'Video de YouTube';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      target.replaceChildren(iframe);
      target.classList.add('is-playing');
      overlay.remove();
    };
    overlay.addEventListener('click', play);
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        play();
      }
    });
  });
}
