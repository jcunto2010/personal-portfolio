import { Resend } from 'resend'

type VercelRequest = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
  socket?: {
    remoteAddress?: string
  }
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  json: (body: unknown) => void
  setHeader: (name: string, value: string) => void
}

type ContactPayload = {
  name?: unknown
  email?: unknown
  message?: unknown
  company?: unknown
  locale?: unknown
}

const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 3
const requestsByIp = new Map<string, { count: number; resetAt: number }>()

function getClientIp(req: VercelRequest) {
  const forwardedFor = req.headers['x-forwarded-for']
  if (typeof forwardedFor === 'string') return forwardedFor.split(',')[0]?.trim() || 'unknown'
  return req.socket?.remoteAddress ?? 'unknown'
}

function isRateLimited(ip: string) {
  const now = Date.now()
  const current = requestsByIp.get(ip)

  if (!current || current.resetAt < now) {
    requestsByIp.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  current.count += 1
  return current.count > MAX_REQUESTS_PER_WINDOW
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function sanitize(value: string) {
  return value.trim().replace(/[<>]/g, '')
}

function getPayload(req: VercelRequest): ContactPayload {
  if (typeof req.body === 'string') return JSON.parse(req.body) as ContactPayload
  return (req.body ?? {}) as ContactPayload
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).json({})
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_TO_EMAIL
  const from = process.env.CONTACT_FROM_EMAIL

  if (!apiKey || !to || !from) {
    res.status(500).json({ error: 'Contact email is not configured' })
    return
  }

  const ip = getClientIp(req)
  if (isRateLimited(ip)) {
    res.status(429).json({ error: 'Too many requests' })
    return
  }

  let payload: ContactPayload
  try {
    payload = getPayload(req)
  } catch {
    res.status(400).json({ error: 'Invalid JSON payload' })
    return
  }

  if (typeof payload.company === 'string' && payload.company.trim().length > 0) {
    res.status(200).json({ ok: true })
    return
  }

  if (
    typeof payload.name !== 'string' ||
    typeof payload.email !== 'string' ||
    typeof payload.message !== 'string'
  ) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }

  const name = sanitize(payload.name)
  const email = sanitize(payload.email).toLowerCase()
  const message = sanitize(payload.message)
  const locale = typeof payload.locale === 'string' ? sanitize(payload.locale) : 'unknown'

  if (name.length < 2 || name.length > 120) {
    res.status(400).json({ error: 'Invalid name' })
    return
  }

  if (!isValidEmail(email) || email.length > 160) {
    res.status(400).json({ error: 'Invalid email' })
    return
  }

  if (message.length < 10 || message.length > 2_000) {
    res.status(400).json({ error: 'Invalid message' })
    return
  }

  const resend = new Resend(apiKey)

  try {
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Portfolio contact from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Locale: ${locale}`,
        '',
        'Message:',
        message,
      ].join('\n'),
    })

    res.status(200).json({ ok: true })
  } catch {
    res.status(502).json({ error: 'Email provider failed' })
  }
}
