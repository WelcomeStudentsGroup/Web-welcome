/**
 * Punto de entrada del JavaScript del sitio. Cada módulo reemplaza, con código propio y
 * sin dependencias, una funcionalidad que en WordPress aportaba un plugin o Elementor.
 */
import { initForms } from '@/scripts/forms';
import { initCarousels } from './carousel';
import { initGalleries } from './gallery';
import { initNav } from './nav';
import { initPostGrids } from './posts';
import { initSearch } from './search';
import { initSlideshows } from './slideshow';
import { initTabs } from './tabs';
import { initVideos } from './video';

export function initSite() {
  initNav();
  initCarousels();
  initSlideshows();
  initTabs();
  initVideos();
  initGalleries();
  initPostGrids();
  initForms();
  void initSearch();
}
