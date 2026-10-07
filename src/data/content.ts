/**
 * Contenido editable del sitio (textos de secciones repetibles).
 * Editar aquí actualiza las páginas y, cuando aplica, los datos estructurados
 * (por ejemplo, las FAQ alimentan el schema FAQPage).
 */
import type { IconName } from '@/lib/icons';

export const pillars: { title: string; text: string; icon: IconName; tone: 'purple' | 'orange' | 'teal' }[] = [
  {
    title: 'Study',
    text: 'Free educational advisory and representation of premier institutions across English, vocational (VET) and higher education programs.',
    icon: 'cap',
    tone: 'purple',
  },
  {
    title: 'WelcomeHub — Community',
    text: 'A space to learn, connect and grow professionally: migration seminars, education fairs and networking events built for our students.',
    icon: 'hub',
    tone: 'orange',
  },
  {
    title: 'Migration',
    text: 'We work with experienced lawyers and registered migration agents who help you choose the migration pathway that fits your goals.',
    icon: 'passport',
    tone: 'teal',
  },
];

export const processSteps = [
  { title: 'Schedule your consultation', text: 'A free, no-obligation call with one of our advisers to understand your goals.' },
  { title: 'Choose your city', text: "From Brisbane's student life to Melbourne's art scene — we help you match a city to your goals." },
  { title: 'Select your course & institution', text: 'English, VET or higher education — matched to your objectives and budget.' },
  { title: 'Apply for your visa', text: 'Guidance through the visa application with our migration partners.' },
  { title: 'Prepare your trip', text: 'Airport pickup, accommodation guide, phone plan and bank account support.' },
  { title: 'Prepare your CV', text: 'CV tips and guidance to apply for your work permit once you arrive.' },
];

export const programs = [
  { tag: 'English', title: 'English programs', text: 'General & business English, English for academic purposes, and exam prep for IELTS, Cambridge & TOEFL.' },
  { tag: 'VET', title: 'Vocational courses', text: 'Certificates, diplomas and advanced diplomas across in-demand trades and industries.' },
  { tag: 'Higher Ed', title: 'Higher education', text: "Undergraduate degrees, master's and doctorate programs at partner universities." },
  { tag: 'Migration', title: 'Migration-ready courses', text: 'Programs selected to support a genuine, well-informed migration pathway.' },
];

export const partners = [
  'TAFE Queensland',
  'Southern Cross University',
  'Griffith University',
  'Langports',
  'Impact English College',
  'Lexis English',
  'Kaplan Business School',
  'Shafston College',
  'Greenwich College',
  'ILSC Education Group',
];

/** Testimonios reales compartidos por estudiantes (en su idioma original). */
export const testimonials = [
  { quote: 'Gracias a cada una de las personas de este equipo por el apoyo brindado…', name: 'Mary Alejandra', role: 'Student, Australia', lang: 'es' },
  { quote: 'Quiero expresar mi más sincero agradecimiento por el excelente servicio…', name: 'Sara Bedoya', role: 'Student, Australia', lang: 'es' },
  { quote: 'Excelente Agencia Welcome Students Group…', name: 'Eingy Pardo', role: 'Student, Australia', lang: 'es' },
];

export const values = [
  { title: 'Trust', text: 'We operate with transparency and responsibility in every interaction.' },
  { title: 'Passion', text: "We support our students' dreams with genuine enthusiasm and care." },
  { title: 'Community', text: 'We build a family-like environment for students far from home.' },
  { title: 'Personalisation', text: "Guidance tailored to each student's unique goals and circumstances." },
  { title: 'Integrity', text: 'High ethical standards and honest advice, always.' },
  { title: 'Belief', text: "We believe in our students' potential to achieve their goals." },
];

export const reasons = [
  { title: 'Attentive service', text: 'Excellent customer service delivered with care and close support.' },
  { title: '10+ years of trajectory', text: 'A decade of experience in international education, since 2015.' },
  { title: 'A trusted network', text: 'An extensive professional network that opens unique growth opportunities.' },
  { title: 'A diverse portfolio', text: 'Representation of a wide range of quality institutions.' },
  { title: 'Migration partnership', text: 'Migration services delivered with our trusted legal partners.' },
  { title: 'WelcomeHub community', text: 'A community built specifically for international students.' },
  { title: "Support that doesn't stop", text: 'Continuous support throughout your entire educational experience.' },
];

export const educationPrograms = [
  { title: 'English programs', text: 'General English, business English, English for academic purposes, exam prep (IELTS, Cambridge, TOEFL).' },
  { title: 'Vocational courses (VET)', text: 'Certificates, diplomas and advanced diplomas.' },
  { title: 'Higher education', text: "Undergraduate, master's and doctorate programs." },
];

export const visas: { title: string; text: string; icon: IconName }[] = [
  { title: 'Graduate visa', text: 'For students who complete a qualifying course in Australia.', icon: 'cap' },
  { title: 'Work visa', text: 'For candidates with an employer able to sponsor them.', icon: 'briefcase' },
  { title: 'Skills visa', text: 'Permanent-residency pathway based on your occupation.', icon: 'doc-check' },
  { title: 'Partner visa', text: 'For genuine relationships with an Australian/NZ citizen or resident.', icon: 'heart' },
  { title: 'Work & Holiday visa', text: 'Combine work and travel for eligible nationalities.', icon: 'globe' },
  { title: 'Tourist visa', text: 'Short-term visits — including to plan your move.', icon: 'plane' },
  { title: 'Family visa', text: 'Pathways to bring eligible family members with you.', icon: 'people' },
  { title: 'Cancellations & appeals', text: 'Representation for visa denials, including tribunal appeals.', icon: 'doc-check' },
];

export const hubEvents: { title: string; icon: IconName }[] = [
  { title: 'Migration seminars', icon: 'globe' },
  { title: 'Education fairs', icon: 'building' },
  { title: 'Networking events', icon: 'people' },
];

export const supportItems: { title: string; text: string; icon: IconName }[] = [
  { title: 'Personalised advisory', text: 'Excellent guidance to help you select the right program.', icon: 'message' },
  { title: 'Enrolment process', text: 'We handle your application to the institution of your choice.', icon: 'building' },
  { title: 'Visa process', text: 'Guidance throughout your visa application.', icon: 'passport' },
  { title: 'Ongoing support', text: "Guidance for the whole time you're in Australia.", icon: 'user-check' },
];

export const arrivalSupport = [
  'Airport pickup service',
  'Accommodation guide',
  'Phone plan support',
  'Bank account opening',
  'CV & work-permit guide',
  'TFN & ABN assistance',
];

/** Preguntas frecuentes. También generan el schema FAQPage en /services/. */
export const faqs = [
  {
    q: 'Is your educational advisory really free?',
    a: 'Yes — our educational advisory service is free for students; institutions cover our fee once you enrol.',
  },
  {
    q: 'Do you guarantee visa approval?',
    a: 'No agency can guarantee a visa outcome. We work with registered migration agents and lawyers to prepare the strongest possible application and reduce avoidable denials.',
  },
  {
    q: 'Can I study English first and a degree later?',
    a: 'Yes — many students start with an English program (with exam prep for IELTS, Cambridge or TOEFL) before progressing to VET or higher education.',
  },
  {
    q: 'Do you help with arrival — accommodation, bank account, phone?',
    a: 'Yes — airport pickup, an accommodation guide, help opening a bank account and getting a phone plan, plus TFN/ABN assistance once you arrive.',
  },
  {
    q: "I'm already in Australia — can you still help?",
    a: 'Yes — we also support people already in Australia who are exploring a study pathway toward migration.',
  },
];

export const destinations = [
  {
    id: 'australia',
    name: 'Australia',
    level: 'Primary destination',
    summary:
      'A world-class education system, unmatched quality of life, wide job opportunities and an enriching cultural diversity — our main hub, and where our team lives and studied too.',
    highlights: ['World-class education system', 'Unmatched quality of life', 'Wide job opportunities', 'Enriching cultural diversity'],
    photo: 'Australia — skyline / campus life',
  },
  {
    id: 'new-zealand',
    name: 'New Zealand',
    level: 'Secondary destination',
    summary: 'Welcoming, safe communities with internationally recognised study options and post-study work pathways.',
    highlights: ['Welcoming, safe communities', 'Internationally recognised study', 'Post-study work pathways'],
    photo: 'New Zealand — landscape / student life',
  },
  {
    id: 'dubai',
    name: 'Dubai',
    level: 'Secondary destination',
    summary: 'A global, multicultural hub with a growing international campus scene — a gateway between markets.',
    highlights: ['Global, multicultural hub', 'Growing international campuses', 'Gateway between markets'],
    photo: 'Dubai — skyline / campus life',
  },
];

export const australianCities = [
  { name: 'Brisbane', text: 'Olympic Games host city · student life · multicultural' },
  { name: 'Gold Coast', text: 'Beach · surf · regional area' },
  { name: 'Sydney', text: 'Business hub · multicultural · beach' },
  { name: 'Melbourne', text: 'Arts & culture · multicultural · student visa hub' },
  { name: 'Perth', text: 'Beach · surf · regional area' },
  { name: 'Adelaide', text: 'Festivals · regional area' },
  { name: 'Darwin', text: 'Beach · regional area' },
  { name: 'Hobart', text: 'History · regional area' },
];

export const interestOptions = [
  'English course',
  'Vocational (VET) course',
  'Undergraduate degree',
  'Postgraduate degree',
  'Migration / visa pathway',
  'Other',
];
