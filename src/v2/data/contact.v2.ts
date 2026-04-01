/**
 * V2 Contact data — used by ClassicRebuildPage and src/v2/components/Contact/Contact.tsx.
 */

import type { V2Locale } from '../lib/localeContext'

export const contactV2 = {
  email:    'cnto.jnthn.97@gmail.com',
  whatsapp: 'https://wa.me/584242572739',
  whatsappDisplay: '+58 424 257 2739',
  location: 'Caracas, Venezuela',
  github:   'https://github.com/jcunto2010',
  linkedin: 'https://www.linkedin.com/in/jonathan-cuntodiaz-41149a1bb',
}

/** Textos prellenados para mailto y WhatsApp según el idioma V2 (selector en EntryGate / shell). */
export const contactDraftByLocale = {
  en: {
    emailSubject: 'Contact from your portfolio',
    emailBody: `Hi Jonathan,

I'd like to reach out about...

Best,`,
    whatsappMessage: "Hi Jonathan, I'm reaching out from your portfolio. ",
  },
  es: {
    emailSubject: 'Contacto desde el portfolio',
    emailBody: `Hola Jonathan,

Me gustaría contactarte sobre...

Saludos,`,
    whatsappMessage: 'Hola Jonathan, te escribo desde tu portfolio. ',
  },
} as const satisfies Record<V2Locale, { emailSubject: string; emailBody: string; whatsappMessage: string }>

/** Abre el cliente de correo con asunto y cuerpo del borrador. */
export function buildContactMailtoHref(locale: V2Locale): string {
  const d = contactDraftByLocale[locale]
  const subject = encodeURIComponent(d.emailSubject)
  const body = encodeURIComponent(d.emailBody)
  return `mailto:${contactV2.email}?subject=${subject}&body=${body}`
}

/** Abre WhatsApp Web / app con mensaje prellenado al número del portfolio. */
export function buildContactWhatsAppHref(locale: V2Locale): string {
  const url = new URL(contactV2.whatsapp)
  url.searchParams.set('text', contactDraftByLocale[locale].whatsappMessage)
  return url.toString()
}
