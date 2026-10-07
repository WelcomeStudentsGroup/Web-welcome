/**
 * Manejo de formularios (validación + envío).
 *
 * Envía un POST JSON a PUBLIC_FORM_ENDPOINT (ver .env.example). Es compatible
 * con Formspree, Web3Forms, funciones serverless o un CRM propio.
 * Si no hay endpoint configurado, NO finge éxito: muestra los datos de contacto
 * directo para que ningún lead se pierda.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form: HTMLFormElement): boolean {
  let valid = true;
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[required]').forEach((el) => {
    let ok: boolean;
    if (el instanceof HTMLInputElement && el.type === 'checkbox') ok = el.checked;
    else if (el instanceof HTMLInputElement && el.type === 'email') ok = EMAIL_RE.test(el.value.trim());
    else ok = el.value.trim() !== '';
    el.closest('.field')?.classList.toggle('has-error', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    if (!ok) valid = false;
  });
  if (!valid) form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  return valid;
}

function show(form: HTMLFormElement, kind: 'success' | 'error', html: string) {
  const ok = form.querySelector<HTMLElement>('.form-alert--success');
  const err = form.querySelector<HTMLElement>('.form-alert--error');
  ok?.classList.remove('is-visible');
  err?.classList.remove('is-visible');
  const target = kind === 'success' ? ok : err;
  if (!target) return;
  target.innerHTML = html;
  target.classList.add('is-visible');
}

function setLoading(form: HTMLFormElement, loading: boolean) {
  const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle('is-loading', loading);
}

export function initForms(root: ParentNode = document) {
  root.querySelectorAll<HTMLFormElement>('form[data-form]').forEach((form) => {
    if (form.dataset.bound) return;
    form.dataset.bound = 'true';

    form.addEventListener('input', (e) => {
      const field = (e.target as HTMLElement).closest('.field');
      if (field?.classList.contains('has-error')) field.classList.remove('has-error');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fallback = form.dataset.fallback ?? '';
      if (!validate(form)) {
        show(form, 'error', 'Please check the highlighted fields and try again.');
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());
      // Honeypot: si un bot lo completó, se descarta en silencio.
      if (data._gotcha) {
        show(form, 'success', form.dataset.success ?? 'Thanks!');
        form.reset();
        return;
      }
      delete data._gotcha;

      const endpoint = form.dataset.endpoint;
      if (!endpoint) {
        show(form, 'error', `Our online form is being set up. Please contact us directly: ${fallback}`);
        return;
      }

      setLoading(form, true);
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...data, form: form.dataset.form, page: location.pathname }),
        });
        if (!res.ok) throw new Error(String(res.status));
        show(form, 'success', form.dataset.success ?? 'Thanks!');
        form.reset();
      } catch {
        show(form, 'error', `Sorry, something went wrong sending your message. Please contact us directly: ${fallback}`);
      } finally {
        setLoading(form, false);
      }
    });
  });
}
