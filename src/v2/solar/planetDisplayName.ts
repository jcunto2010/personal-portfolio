import type { PlanetId } from './planetRegistry'
import type { V2Locale } from '../lib/localeContext'

/**
 * Locale-aware astronomical name for UI (cards, overlays, aria).
 * English strings follow `PLANET_REGISTRY` labels (except “Black hole” spacing).
 */
export function getPlanetDisplayName(planetId: PlanetId, locale: V2Locale): string {
  if (locale === 'es') {
    switch (planetId) {
      case 'sun':
        return 'Sol'
      case 'mercury':
        return 'Mercurio'
      case 'venus':
        return 'Venus'
      case 'earth':
        return 'Tierra'
      case 'moon':
        return 'Luna'
      case 'mars':
        return 'Marte'
      case 'neptune':
        return 'Urano'
      case 'uranus':
        return 'Neptuno'
      case 'blackhole':
        return 'Agujero negro'
    }
  }

  switch (planetId) {
    case 'sun':
      return 'Sun'
    case 'mercury':
      return 'Mercury'
    case 'venus':
      return 'Venus'
    case 'earth':
      return 'Earth'
    case 'moon':
      return 'Moon'
    case 'mars':
      return 'Mars'
    case 'neptune':
      return 'Uranus'
    case 'uranus':
      return 'Neptune'
    case 'blackhole':
      return 'Black hole'
  }
}
