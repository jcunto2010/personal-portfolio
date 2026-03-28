type ClassValue = string | number | boolean | null | undefined | ClassValue[]

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  const walk = (values: ClassValue[]) => {
    for (const v of values) {
      if (v == null || v === false) continue
      if (typeof v === 'string' || typeof v === 'number') out.push(String(v))
      else if (Array.isArray(v)) walk(v)
    }
  }
  walk(inputs)
  return out.join(' ')
}
