import { LetsWorkTogether } from '../../../components/ui/lets-work-section'
import { buildContactMailtoHref, contactV2 } from '../../data/contact.v2'
import { useLocale } from '../../lib/localeContext'

export function ContactSection() {
  const { locale } = useLocale()
  const isEs = locale === 'es'

  return (
    <section id="contact" aria-label="Contact">
      <main className="w-full">
        <LetsWorkTogether
          locale={locale}
          bookCallHref="https://calendly.com/cnto-jnthn-97/30min"
          discussHref={buildContactMailtoHref(locale)}
          githubHref={contactV2.github}
          linkedinHref={contactV2.linkedin}
          copy={
            isEs
              ? {
                  successLabel: 'Perfecto',
                  successTitle: 'Conversemos',
                  bookCallLabel: 'Agendar llamada',
                  discussLabel: 'Vamos a discutir',
                  githubLabel: 'Ver en GitHub',
                  linkedinLabel: 'Conectemos',
                  introCallLabel: 'Llamada inicial de 15 min',
                  availabilityLabel: 'Disponible para proyectos',
                  headingLine1: 'Trabajemos',
                  headingLine2: 'juntos',
                  description:
                    'Si tienes una idea o proyecto en mente, me encantaria escucharla. Construyamos algo excepcional juntos.',
                  email: 'jcunto2010@gmail.com',
                  formTitle: 'Cuentame sobre tu proyecto',
                  nameLabel: 'Nombre',
                  emailLabel: 'Correo',
                  messageLabel: 'Mensaje',
                  sendLabel: 'Enviar mensaje',
                  sendingLabel: 'Enviando...',
                  formSuccessLabel: 'Mensaje enviado. Te respondere pronto.',
                  formErrorLabel: 'Algo salio mal. Intentalo nuevamente.',
                }
              : {
                  successLabel: 'Perfect',
                  successTitle: "Let's talk",
                  bookCallLabel: 'Book a call',
                  discussLabel: "Let's discuss",
                  githubLabel: 'See my GitHub work',
                  linkedinLabel: "Let's Connect",
                  introCallLabel: '15 min intro call',
                  availabilityLabel: 'Available for projects',
                  headingLine1: "Let's work",
                  headingLine2: 'together',
                  description:
                    "If you have a project in mind, I'd love to hear about it. Let's build something exceptional together.",
                  email: 'jcunto2010@gmail.com',
                  formTitle: 'Tell me about your project',
                  nameLabel: 'Name',
                  emailLabel: 'Email',
                  messageLabel: 'Message',
                  sendLabel: 'Send message',
                  sendingLabel: 'Sending...',
                  formSuccessLabel: 'Message sent. I will get back to you soon.',
                  formErrorLabel: 'Something went wrong. Please try again.',
                }
          }
        />
      </main>
    </section>
  )
}
