import { useMemo } from 'react'
import { useLocale, type V2Locale } from '../../lib/localeContext'
import styles from './LanguageSwitcher.module.css'

const LOCALES: { value: V2Locale; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
]

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const isEs = locale === 'es'
  const ariaLabel = isEs ? 'Selector de idioma' : 'Language selector'
  const srOnlyLabel = isEs ? 'Idioma' : 'Language'
  const selectAria = isEs ? 'Selecciona el idioma' : 'Select language'

  const options = useMemo(() => {
    return LOCALES.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))
  }, [])

  return (
    <div className={styles.wrap} aria-label={ariaLabel}>
      <label className={styles.label} htmlFor="v2-language">
        <span className={styles.srOnly}>{srOnlyLabel}</span>
        <select
          id="v2-language"
          className={styles.select}
          value={locale}
          onChange={(e) => setLocale(e.target.value as V2Locale)}
          aria-label={selectAria}
        >
          {options}
        </select>
      </label>
    </div>
  )
}

