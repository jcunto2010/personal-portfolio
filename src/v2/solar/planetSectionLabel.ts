import type { PlanetId } from './planetRegistry'
import type { V2Locale } from '../lib/localeContext'

export function getPlanetSectionLabel(planetId: PlanetId, locale: V2Locale): string {
  if (locale === 'es') {
    switch (planetId) {
      case 'sun':
        return 'Intro / Acerca de'
      case 'mercury':
        return 'Habilidades'
      case 'venus':
        return 'Cómo se hizo'
      case 'earth':
        return 'Centro de proyectos'
      case 'moon':
        return 'Reservo.AI'
      case 'mars':
        return 'StartupConnect'
      case 'neptune':
        return 'Experiencia'
      case 'uranus':
        return 'Contacto'
      case 'blackhole':
        return 'Gran final'
    }
  }

  // Default EN
  switch (planetId) {
    case 'sun':
      return 'Intro / About'
    case 'mercury':
      return 'Skills'
    case 'venus':
      return 'How It Was Made'
    case 'earth':
      return 'Projects Hub'
    case 'moon':
      return 'Reservo.AI'
    case 'mars':
      return 'StartupConnect'
    case 'neptune':
      return 'Experience'
    case 'uranus':
      return 'Contact'
    case 'blackhole':
      return 'Grand Finale'
  }
}

