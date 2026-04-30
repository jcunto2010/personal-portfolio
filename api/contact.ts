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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildContactEmailHtml({
  name,
  email,
  message,
}: {
  name: string
  email: string
  message: string
}) {
  const safeName = escapeHtml(name)
  const safeEmail = escapeHtml(email)
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />')

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nuevo contacto desde el portafolio</title>
  </head>
  <body style="margin:0;padding:0;background:#070B1A;">
    <div style="margin:0;padding:0;background:#070B1A;font-family:Arial,Helvetica,sans-serif;color:#F5F7FF;">
      <div style="max-width:640px;margin:0 auto;padding:40px 24px;">
        <div style="border:1px solid rgba(255,255,255,0.14);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04));padding:32px;box-shadow:0 24px 80px rgba(0,0,0,0.35);">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#A5B4FC;">
            Nuevo contacto desde el portafolio
          </p>

          <h1 style="margin:0 0 24px;font-size:28px;line-height:1.2;color:#FFFFFF;">
            Tienes un nuevo mensaje
          </h1>

          <div style="margin-bottom:24px;padding:20px;border-radius:18px;background:rgba(255,255,255,0.08);">
            <p style="margin:0 0 8px;font-size:14px;color:#CBD5E1;">
              <strong style="color:#FFFFFF;">Nombre:</strong> ${safeName}
            </p>
            <p style="margin:0;font-size:14px;color:#CBD5E1;">
              <strong style="color:#FFFFFF;">Correo:</strong>
              <a href="mailto:${safeEmail}" style="color:#67E8F9;text-decoration:none;">
                ${safeEmail}
              </a>
            </p>
          </div>

          <div style="margin-bottom:28px;">
            <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#94A3B8;">
              Mensaje
            </p>
            <div style="padding:20px;border-left:3px solid #67E8F9;background:rgba(103,232,249,0.08);border-radius:0 16px 16px 0;">
              <p style="margin:0;font-size:16px;line-height:1.7;color:#E2E8F0;">
                ${safeMessage}
              </p>
            </div>
          </div>

          <a href="mailto:${safeEmail}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#F5F7FF;color:#070B1A;text-decoration:none;font-size:14px;font-weight:700;">
            Responder correo
          </a>

          <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#64748B;">
            Este mensaje fue enviado desde el formulario de contacto de jonathancuntodiaz.com.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>`
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
      html: buildContactEmailHtml({ name, email, message }),
    })

    res.status(200).json({ ok: true })
  } catch {
    res.status(502).json({ error: 'Email provider failed' })
  }
}
