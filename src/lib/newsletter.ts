/**
 * Formulario de newsletter con el marcado del widget Form de Elementor Pro (para que
 * aplique el CSS importado). Lo usan el footer y las páginas que incrustan el footer
 * (plantilla canvas de /eventos/). Lo envía src/scripts/forms.ts a PUBLIC_FORM_ENDPOINT.
 */
import { site } from '@/config/site';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

export function newsletterFormHtml(idSuffix = '') {
  const endpoint = import.meta.env.PUBLIC_FORM_ENDPOINT || '';
  const fallback = `<a href="${site.contact.emailHref}">${site.contact.email}</a>`;
  const id = `form-field-newsletter${idSuffix}`;
  return `<form class="elementor-form" method="post" name="Newsletter" aria-label="Newsletter" data-form="newsletter" data-endpoint="${esc(endpoint)}" data-success="¡Gracias por suscribirte!" data-fallback="${esc(fallback)}"${endpoint ? ` action="${esc(endpoint)}"` : ''} novalidate>
  <div class="elementor-form-fields-wrapper elementor-labels-above">
    <div class="elementor-field-type-email elementor-field-group elementor-column elementor-field-group-email elementor-col-100 elementor-field-required">
      <label class="elementor-screen-only" for="${id}">Correo electrónico</label>
      <input type="email" name="email" id="${id}" class="elementor-field elementor-size-sm elementor-field-textual" placeholder="e-mail" autocomplete="email" required>
    </div>
    <div class="elementor-field-group elementor-column elementor-field-type-submit elementor-col-30 e-form__buttons">
      <button class="elementor-button elementor-size-sm" type="submit"><span class="elementor-button-content-wrapper"><span class="elementor-button-text">Enviar</span></span></button>
    </div>
    <div class="hp-field" aria-hidden="true"><label for="${id}-web">No completar</label><input id="${id}-web" name="_gotcha" tabindex="-1" autocomplete="off"></div>
  </div>
  <div class="form-alert form-alert--success" role="status" aria-live="polite"></div>
  <div class="form-alert form-alert--error" role="alert"></div>
</form>`;
}
