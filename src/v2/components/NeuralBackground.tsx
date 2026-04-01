import { useEffect, useRef, type CSSProperties } from 'react'

interface NeuralBackgroundProps {
  className?: string
  color?: string
  trailOpacity?: number
  particleCount?: number
  speed?: number
  /** When true (e.g. prefers-reduced-motion), draw once — no animation or pointer-driven motion */
  reducedMotion?: boolean
}

interface NeuralParticleContext {
  width: number
  height: number
  mouse: { x: number; y: number }
}

class NeuralParticle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number

  constructor(
    private readonly ctx: NeuralParticleContext,
    private readonly color: string,
    private readonly speed: number,
  ) {
    this.x = 0
    this.y = 0
    this.vx = 0
    this.vy = 0
    this.age = 0
    this.life = 0
    this.reset()
  }

  update() {
    const { width, height, mouse } = this.ctx
    const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI
    this.vx += Math.cos(angle) * 0.2 * this.speed
    this.vy += Math.sin(angle) * 0.2 * this.speed

    const dx = mouse.x - this.x
    const dy = mouse.y - this.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const interactionRadius = 150

    if (distance < interactionRadius) {
      const force = (interactionRadius - distance) / interactionRadius
      this.vx -= dx * force * 0.05
      this.vy -= dy * force * 0.05
    }

    this.x += this.vx
    this.y += this.vy
    this.vx *= 0.95
    this.vy *= 0.95

    this.age++
    if (this.age > this.life) {
      this.reset()
    }

    if (this.x < 0) this.x = width
    if (this.x > width) this.x = 0
    if (this.y < 0) this.y = height
    if (this.y > height) this.y = 0
  }

  reset() {
    const { width, height } = this.ctx
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.vx = 0
    this.vy = 0
    this.age = 0
    this.life = Math.random() * 200 + 100
  }

  draw(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color
    const alpha = 1 - Math.abs((this.age / this.life) - 0.5) * 2
    context.globalAlpha = alpha
    context.fillRect(this.x, this.y, 2, 2)
  }
}

export default function NeuralBackground({
  className,
  color = '#6366f1',
  trailOpacity = 0.15,
  particleCount = 600,
  speed = 1,
  reducedMotion = false,
}: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let particles: NeuralParticle[] = []
    let animationFrameId: number
    const mouse = { x: -1000, y: -1000 }
    const particleCtx: NeuralParticleContext = { width: 0, height: 0, mouse }

    const init = () => {
      if (width < 1 || height < 1) return

      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push(new NeuralParticle(particleCtx, color, speed))
      }
    }

    const readSize = (): boolean => {
      let w = container.clientWidth
      let h = container.clientHeight
      if (w < 1 || h < 1) {
        const r = container.getBoundingClientRect()
        w = Math.max(0, Math.round(r.width))
        h = Math.max(0, Math.round(r.height))
      }
      if (w < 1 || h < 1) return false
      width = w
      height = h
      particleCtx.width = width
      particleCtx.height = height
      return true
    }

    const syncFromContainer = (): boolean => {
      if (!readSize()) return false
      init()
      return true
    }

    const paintStatic = (): void => {
      if (width < 1 || height < 1 || particles.length === 0) return
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)
      particles.forEach((p) => {
        p.draw(ctx)
      })
      ctx.globalAlpha = 1
    }

    const animate = () => {
      if (width >= 1 && height >= 1 && particles.length > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`
        ctx.fillRect(0, 0, width, height)

        particles.forEach((p) => {
          p.update()
          p.draw(ctx)
        })
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    const handleWindowResize = (): void => {
      if (syncFromContainer() && reducedMotion) paintStatic()
    }

    let lastObservedW = -1
    let lastObservedH = -1
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === lastObservedW && h === lastObservedH) return
      if (w < 1 || h < 1) return
      lastObservedW = w
      lastObservedH = h
      if (syncFromContainer() && reducedMotion) paintStatic()
    })
    resizeObserver.observe(container)

    const hadSize = syncFromContainer()
    if (reducedMotion && hadSize) paintStatic()

    let retries = 0
    const retryLayout = () => {
      if (syncFromContainer()) {
        if (reducedMotion) paintStatic()
        return
      }
      if (retries++ < 12) {
        requestAnimationFrame(retryLayout)
      }
    }
    if (!hadSize) {
      requestAnimationFrame(retryLayout)
    }

    if (!reducedMotion) {
      animate()
    }

    window.addEventListener('resize', handleWindowResize)

    /**
     * Underlay uses pointer-events: none so links/buttons in Contact stay clickable.
     * Track pointer on window and map to canvas coords so interaction works over content too.
     */
    const handlePointerMove = (e: PointerEvent): void => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const inside =
        x >= 0 &&
        y >= 0 &&
        x <= rect.width &&
        y <= rect.height
      if (!inside) {
        mouse.x = -1000
        mouse.y = -1000
        return
      }
      mouse.x = x
      mouse.y = y
    }

    if (!reducedMotion) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true })
    }

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleWindowResize)
      if (!reducedMotion) {
        window.removeEventListener('pointermove', handlePointerMove)
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [color, trailOpacity, particleCount, speed, reducedMotion])

  const wrapStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    background: '#000000',
  }

  const canvasStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'block',
    width: '100%',
    height: '100%',
  }

  return (
    <div ref={containerRef} style={wrapStyle} className={className}>
      <canvas ref={canvasRef} style={canvasStyle} />
    </div>
  )
}
