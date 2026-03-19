import type { AppMode } from '../../lib/appModeContext'
import type { JourneyLoaderSnapshot } from '../../lib/useJourneyLoader'
import styles from './LoadingGate.module.css'

interface LoadingGateProps {
  mode: AppMode
  loader: JourneyLoaderSnapshot
  onBack?: () => void
}

export function LoadingGate({ mode, loader, onBack }: LoadingGateProps) {
  const isImmersive = mode === 'immersive'

  return (
    <div className={styles.overlay} role="status" aria-live="polite" aria-label="Cargando experiencia seleccionada">
      <div className={styles.card}>
        <div>
          <div
            className={`${styles.modeBadge} ${!isImmersive ? styles.modeBadgeClassic : ''}`}
            aria-hidden="true"
          >
            <span>{isImmersive ? 'Immersive' : 'Classic'}</span>
            <span>•</span>
            <span>{isImmersive ? '3D solar journey' : 'Editorial layout'}</span>
          </div>
        </div>

        <div>
          <h2 className={styles.title}>
            {isImmersive ? 'Preparando viaje inmersivo…' : 'Preparando modo clásico…'}
          </h2>
          <p className={styles.subtitle}>
            {isImmersive
              ? 'Esperando a que el motor 3D y la escena solar inicial estén listos antes de entrar.'
              : 'Ajustando el layout editorial para que todo esté listo al entrar.'}
          </p>
        </div>

        <div className={styles.progressShell}>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} />
          </div>
          <div className={styles.statusLine}>
            <span className={styles.statusLabel}>{loader.label}</span>
            <span>
              {loader.status === 'loading' && 'Cargando…'}
              {loader.status === 'ready' && 'Listo para entrar'}
              {loader.status === 'error' && 'Error al cargar'}
            </span>
          </div>
        </div>

        {loader.detail && (
          <p className={styles.detail}>
            {loader.detail}
          </p>
        )}

        {loader.error && (
          <p className={styles.error}>
            {loader.error}
          </p>
        )}

        <div className={styles.actions}>
          {onBack && (
            <button
              type="button"
              className={styles.backBtn}
              onClick={onBack}
            >
              ← Volver a la selección
            </button>
          )}
          <p className={styles.hint}>
            {isImmersive
              ? 'Puedes seguir ajustando volumen y fullscreen una vez dentro.'
              : 'Cuando esté listo, entrarás al portfolio clásico.'}
          </p>
        </div>
      </div>
    </div>
  )
}

