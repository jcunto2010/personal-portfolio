/**
 * Work experience entries for the editorial home page.
 */

export interface ExperienceV2 {
  id: string
  role: string
  company: string
  period: string
  description: string
  descriptionEs?: string
  technologies: string[]
  projectSlug?: string
}

export const experienceV2: ExperienceV2[] = [
  {
    id: '1',
    role: 'Mobile Development Lead & Co-Founder',
    company: 'SCI, C.A. · Reservo.AI',
    period: 'Jun 2024 – Present',
    description:
      'Led the full development cycle of Reservo.AI — a Flutter app for appointment booking in service businesses. Built from scratch: learned Flutter during the process, integrated Google Gemini for conversational AI, implemented biometric authentication (Face ID / fingerprint), connected a Firebase backend, and designed onboarding flows with Rive animations. Architecture, UI, and every integration were my responsibility.',
    descriptionEs:
      'Lideré el ciclo completo de desarrollo de Reservo.AI, una app Flutter para reserva de citas en negocios de servicios. Construida desde cero: aprendí Flutter durante el proceso, integré Google Gemini para IA conversacional, implementé autenticación biométrica (Face ID / huella), conecté el backend en Firebase y diseñé los flujos de onboarding con animaciones Rive. La arquitectura, la UI y todas las integraciones fueron responsabilidad mía.',
    technologies: ['Flutter', 'Dart', 'Firebase', 'Gemini AI', 'Riverpod', 'Rive', 'Biometrics'],
    projectSlug: 'reservo-ai',
  },
  {
    id: '2',
    role: 'Business Analysis Manager',
    company: 'DFW IT Partner',
    period: 'May 2025 – Present',
    description:
      'Lead end-to-end ERP implementations (Odoo) for clients: requirements elicitation, AS-IS/TO-BE process mapping, backlog prioritization, and go-live coordination. Developed custom Python modules, automated internal workflows reducing processing time by 30%, and managed multi-environment deployments via Odoo.sh. Built interactive dashboards for real-time KPI monitoring.',
    descriptionEs:
      'Lidero implementaciones end-to-end de ERP (Odoo) para clientes: elicitación de requisitos, mapeo de procesos AS-IS/TO-BE, priorización de backlog y coordinación del go-live. Desarrollé módulos personalizados en Python, automaticé flujos internos reduciendo tiempos un 30%, y gestioné despliegues multi-entorno en Odoo.sh. Construí dashboards interactivos para monitoreo de KPIs en tiempo real.',
    technologies: ['Python', 'Odoo', 'Odoo.sh', 'PostgreSQL', 'Agile', 'Scrum'],
  },
  {
    id: '3',
    role: 'Product Owner',
    company: 'Ridery LLC.',
    period: 'Nov 2024 – Feb 2025',
    description:
      'Owned the product strategy for the user unit (rides, services, payments) at a competitive mobility startup. Coordinated technical and business teams using Agile, monitored KPIs, gathered user feedback, and wrote user stories and roadmaps to keep cross-functional teams aligned.',
    descriptionEs:
      'Responsable de la estrategia de producto para la unidad de usuario (viajes, servicios, pagos) en una startup de movilidad. Coordiné equipos técnicos y de negocio con metodologías Ágiles, monitoreé KPIs, recopilé feedback de usuarios y redacté user stories y roadmaps para mantener los equipos multifuncionales alineados.',
    technologies: ['Agile', 'Scrum', 'Looker', 'Power BI', 'User Story Mapping', 'KPI Analysis'],
  },
  {
    id: '4',
    role: 'Product & Services Specialist',
    company: 'Banesco Banco Universal',
    period: 'Jan 2022 – Nov 2024',
    description:
      "Managed the full lifecycle of institutional products at Venezuela's largest private bank. Built automated ETL pipelines in Python (Pandas, Numpy) that cut manual operational load by 80%. Developed real-time data sync across three departments, reducing discrepancies by 70%. Delivered 80+ operational optimizations and executive dashboards that reduced reporting time by 40%.",
    descriptionEs:
      'Gestioné el ciclo de vida completo de productos institucionales en el banco privado más grande de Venezuela. Construí pipelines ETL automatizados en Python (Pandas, Numpy) que redujeron la carga operativa manual un 80%. Desarrollé sincronización de datos en tiempo real entre tres departamentos, reduciendo discrepancias un 70%. Entregué 80+ optimizaciones operativas y dashboards ejecutivos que bajaron el tiempo de reporte un 40%.',
    technologies: ['Python', 'Pandas', 'Numpy', 'Power BI', 'Looker Studio', 'SQL', 'Google Sheets', 'ETL'],
  },
]
