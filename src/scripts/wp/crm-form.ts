/**
 * Formulario del CRM (iframe de access.welcomestudentsgroup.com).
 *
 * En WordPress, el script del CRM (form_embed.js, basado en iframe-resizer) ajustaba la
 * altura del iframe a la del formulario. Aquí se reproduce solo el protocolo de mensajes
 * (postMessage), sin cargar ningún script de terceros:
 *   1. al cargar, se envía al iframe el mensaje de inicio "[iFrameSizer]id:…" con las
 *      mismas opciones que usaba el CRM;
 *   2. el formulario responde con "[iFrameSizer]id:alto:ancho:tipo" y se aplica el alto.
 * Si el navegador no ejecuta JavaScript, quedan las alturas fijas de site.css.
 */
const CRM_ORIGIN = 'https://access.welcomestudentsgroup.com';
const PREFIX = '[iFrameSizer]';
// id:bodyMarginV1:sizeWidth:log:interval:enablePublicMethods:autoResize:bodyMargin:heightCalculationMethod:bodyBackground:bodyPadding:tolerance
const INIT_OPTIONS = '8:false:false:32:true:true:null:offset:null:null:0';
// El embed del CRM añade 5 px al alto que informa el formulario.
const EXTRA = 5;

export function initCrmForms(root: ParentNode = document) {
  const frames = Array.from(root.querySelectorAll<HTMLIFrameElement>('.wsg-crm-form iframe'));
  if (!frames.length) return;
  for (const frame of frames) {
    const formId = frame.src.split('/').pop() || 'form';
    if (!frame.id) frame.id = `inline-${formId}`;
    const send = () => frame.contentWindow?.postMessage(`${PREFIX}${frame.id}:${INIT_OPTIONS}`, CRM_ORIGIN);
    frame.addEventListener('load', send);
    send();
  }
  window.addEventListener('message', (e) => {
    if (e.origin !== CRM_ORIGIN || typeof e.data !== 'string' || !e.data.startsWith(PREFIX)) return;
    const [id, height] = e.data.slice(PREFIX.length).split(':');
    const frame = frames.find((f) => f.id === id);
    const h = Number(height);
    if (frame && h > 0) frame.style.height = `${h + EXTRA}px`;
  });
}
