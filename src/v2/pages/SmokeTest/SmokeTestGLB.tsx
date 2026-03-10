/**
 * SmokeTestGLB — Fase 0: Smoke test de assets GLB + audio MP3
 *
 * Ruta temporal: /smoke-test
 * NO forma parte del build de producción final.
 * Se activa únicamente con la flag ?smoke=1 o accediendo directamente a /smoke-test.
 *
 * Para cada GLB:
 *   - Carga el modelo en una escena R3F mínima
 *   - Calcula bounding box
 *   - Reporta OK / WARN / ERROR
 *
 * Para el MP3:
 *   - Verifica que NO se descarga hasta interacción explícita
 */
import { Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Center, Bounds } from '@react-three/drei'
import * as THREE from 'three'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type AssetStatus = 'PENDING' | 'LOADING' | 'OK' | 'WARN' | 'ERROR'

interface GLBResult {
  name: string
  path: string
  status: AssetStatus
  bbox: string
  notes: string
  errorMsg?: string
}

interface AudioResult {
  status: AssetStatus
  notes: string
  networkRequested: boolean
}

// ── Constantes ────────────────────────────────────────────────────────────────

const GLB_ASSETS: { name: string; path: string }[] = [
  { name: 'sun',       path: '/assets/solar/models/sun.glb'       },
  { name: 'mercury',   path: '/assets/solar/models/mercury.glb'   },
  { name: 'venus',     path: '/assets/solar/models/venus.glb'     },
  { name: 'earth',     path: '/assets/solar/models/earth.glb'     },
  { name: 'moon',      path: '/assets/solar/models/moon.glb'      },
  { name: 'mars',      path: '/assets/solar/models/mars.glb'      },
  { name: 'neptune',   path: '/assets/solar/models/neptune.glb'   },
  { name: 'uranus',    path: '/assets/solar/models/uranus.glb'    },
  { name: 'blackhole', path: '/assets/solar/models/blackhole.glb' },
]

const AUDIO_PATH = '/assets/audio/shona-theme.mp3'

// ── Utilidades ────────────────────────────────────────────────────────────────

function computeBBox(scene: THREE.Group | THREE.Object3D): {
  bbox: string
  notes: string
  status: 'OK' | 'WARN'
} {
  const box = new THREE.Box3().setFromObject(scene)
  const size = new THREE.Vector3()
  box.getSize(size)
  const center = new THREE.Vector3()
  box.getCenter(center)

  const maxDim = Math.max(size.x, size.y, size.z)
  const bboxStr = `${size.x.toFixed(2)} × ${size.y.toFixed(2)} × ${size.z.toFixed(2)}`

  const notes: string[] = []
  let status: 'OK' | 'WARN' = 'OK'

  // Escala: modelos con dimensión máxima > 100 o < 0.001 son sospechosos
  if (maxDim > 100) {
    notes.push(`escala muy grande (maxDim=${maxDim.toFixed(1)})`)
    status = 'WARN'
  } else if (maxDim < 0.001) {
    notes.push(`escala muy pequeña (maxDim=${maxDim.toFixed(5)})`)
    status = 'WARN'
  }

  // Orientación: si el centro está muy desplazado del origen
  const centerOffset = center.length()
  if (centerOffset > maxDim * 2) {
    notes.push(`centro desplazado del origen (offset=${centerOffset.toFixed(2)})`)
    status = 'WARN'
  }

  if (notes.length === 0) notes.push('escala y orientación correctas')

  return { bbox: bboxStr, notes: notes.join('; '), status }
}

// ── Componente interno del modelo GLB ─────────────────────────────────────────

interface ModelProbeProps {
  path: string
  onResult: (result: { bbox: string; notes: string; status: 'OK' | 'WARN' }) => void
}

function ModelProbe({ path, onResult }: ModelProbeProps) {
  const { scene } = useGLTF(path)
  const reported = useRef(false)

  useEffect(() => {
    if (reported.current) return
    reported.current = true
    const result = computeBBox(scene)
    onResult(result)
  }, [scene, onResult])

  return (
    <Bounds fit clip observe margin={1.2}>
      <Center>
        <primitive object={scene.clone()} />
      </Center>
    </Bounds>
  )
}

// ── Error boundary para capturar fallos de carga ──────────────────────────────

interface ProbeErrorBoundaryState {
  hasError: boolean
  errorMsg: string
}

import { Component, type ReactNode } from 'react'

class ProbeErrorBoundary extends Component<
  { children: ReactNode; onError: (msg: string) => void },
  ProbeErrorBoundaryState
> {
  constructor(props: { children: ReactNode; onError: (msg: string) => void }) {
    super(props)
    this.state = { hasError: false, errorMsg: '' }
  }

  static getDerivedStateFromError(error: Error): ProbeErrorBoundaryState {
    return { hasError: true, errorMsg: error.message }
  }

  componentDidCatch(error: Error) {
    this.props.onError(error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )
    }
    return this.props.children
  }
}

// ── Tarjeta de prueba individual ─────────────────────────────────────────────

interface GLBCardProps {
  asset: { name: string; path: string }
  onComplete: (result: GLBResult) => void
}

function GLBCard({ asset, onComplete }: GLBCardProps) {
  const [status, setStatus] = useState<AssetStatus>('LOADING')
  const [bbox, setBbox] = useState('—')
  const [notes, setNotes] = useState('cargando…')
  const reported = useRef(false)

  const handleResult = useCallback(
    (result: { bbox: string; notes: string; status: 'OK' | 'WARN' }) => {
      if (reported.current) return
      reported.current = true
      setStatus(result.status)
      setBbox(result.bbox)
      setNotes(result.notes)
      onComplete({
        name: asset.name,
        path: asset.path,
        status: result.status,
        bbox: result.bbox,
        notes: result.notes,
      })
    },
    [asset, onComplete],
  )

  const handleError = useCallback(
    (msg: string) => {
      if (reported.current) return
      reported.current = true
      setStatus('ERROR')
      setNotes(msg)
      onComplete({
        name: asset.name,
        path: asset.path,
        status: 'ERROR',
        bbox: '—',
        notes: '',
        errorMsg: msg,
      })
    },
    [asset, onComplete],
  )

  const statusColor: Record<AssetStatus, string> = {
    PENDING:  '#888',
    LOADING:  '#aaa',
    OK:       '#4ade80',
    WARN:     '#facc15',
    ERROR:    '#f87171',
  }

  return (
    <div style={{
      border: `1px solid ${statusColor[status]}44`,
      borderRadius: 8,
      padding: '12px',
      background: '#0d1117',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          background: statusColor[status],
          color: '#000',
          borderRadius: 4,
          padding: '2px 8px',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.05em',
          minWidth: 52,
          textAlign: 'center',
        }}>
          {status}
        </span>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>
          {asset.name}.glb
        </span>
      </div>

      {/* Mini canvas */}
      <div style={{ height: 160, borderRadius: 6, overflow: 'hidden', background: '#070B1A' }}>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{ antialias: false, powerPreference: 'low-power' }}
          style={{ width: '100%', height: '100%' }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <Suspense fallback={null}>
            <ProbeErrorBoundary onError={handleError}>
              <ModelProbe path={asset.path} onResult={handleResult} />
            </ProbeErrorBoundary>
          </Suspense>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
        </Canvas>
      </div>

      {/* Info */}
      <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
        <div><span style={{ color: '#64748b' }}>bbox: </span>{bbox}</div>
        <div><span style={{ color: '#64748b' }}>notas: </span>{notes}</div>
        <div style={{ color: '#475569', fontSize: 11 }}>{asset.path}</div>
      </div>
    </div>
  )
}

// ── Panel de audio ─────────────────────────────────────────────────────────────

interface AudioPanelProps {
  result: AudioResult
  onResult: (r: AudioResult) => void
}

function AudioPanel({ result, onResult }: AudioPanelProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  /**
   * El MP3 NO debe descargarse hasta que el usuario pulse el botón.
   * El elemento <audio> no tiene src hasta ese momento.
   */
  const handlePlay = () => {
    if (!audioRef.current) {
      const audio = new Audio()
      // Conectamos src SOLO aquí (on interaction)
      audio.src = AUDIO_PATH
      audio.volume = 0.15
      audioRef.current = audio

      audio.addEventListener('canplaythrough', () => {
        onResult({
          status: 'OK',
          notes: 'MP3 cargado correctamente tras interacción del usuario',
          networkRequested: true,
        })
        audio.play().catch(() => {
          onResult({
            status: 'WARN',
            notes: 'Archivo accesible pero autoplay bloqueado por el navegador (esperado)',
            networkRequested: true,
          })
        })
      }, { once: true })

      audio.addEventListener('error', () => {
        onResult({
          status: 'ERROR',
          notes: `No se pudo cargar el MP3 (código: ${audio.error?.code ?? '?'})`,
          networkRequested: true,
        })
      }, { once: true })

      onResult({ status: 'LOADING', notes: 'Solicitando descarga…', networkRequested: true })
      audio.load()
    } else {
      audioRef.current.play().catch(() => {/* browser blocked */})
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const statusColor: Record<AssetStatus, string> = {
    PENDING:  '#888',
    LOADING:  '#aaa',
    OK:       '#4ade80',
    WARN:     '#facc15',
    ERROR:    '#f87171',
  }

  return (
    <div style={{
      border: `1px solid ${statusColor[result.status]}44`,
      borderRadius: 8,
      padding: 16,
      background: '#0d1117',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          background: statusColor[result.status],
          color: '#000',
          borderRadius: 4,
          padding: '2px 8px',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.05em',
          minWidth: 52,
          textAlign: 'center',
        }}>
          {result.status}
        </span>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>
          shona-theme.mp3
        </span>
      </div>

      <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
        <div>
          <span style={{ color: '#64748b' }}>descargado: </span>
          <span style={{ color: result.networkRequested ? '#f87171' : '#4ade80' }}>
            {result.networkRequested ? 'SÍ (tras interacción)' : 'NO ✓ (lazy correcto)'}
          </span>
        </div>
        <div><span style={{ color: '#64748b' }}>notas: </span>{result.notes}</div>
        <div style={{ color: '#475569', fontSize: 11 }}>{AUDIO_PATH}</div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={handlePlay}
          style={{
            background: '#1e293b',
            color: '#e2e8f0',
            border: '1px solid #334155',
            borderRadius: 6,
            padding: '6px 16px',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          ▶ Play (fuerza descarga)
        </button>
        <button
          type="button"
          onClick={handleStop}
          style={{
            background: '#1e293b',
            color: '#94a3b8',
            border: '1px solid #334155',
            borderRadius: 6,
            padding: '6px 16px',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          ■ Stop
        </button>
      </div>
    </div>
  )
}

// ── Tabla de resumen ──────────────────────────────────────────────────────────

interface SummaryTableProps {
  results: GLBResult[]
  total: number
  audioResult: AudioResult
}

function SummaryTable({ results, total, audioResult }: SummaryTableProps) {
  const statusIcon: Record<AssetStatus, string> = {
    PENDING: '⏳',
    LOADING: '⏳',
    OK:      '✅',
    WARN:    '⚠️',
    ERROR:   '❌',
  }

  const done = results.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div style={{
      background: '#0d1117',
      border: '1px solid #1e293b',
      borderRadius: 8,
      padding: 16,
      fontSize: 13,
    }}>
      <h3 style={{ color: '#e2e8f0', margin: '0 0 12px', fontSize: 15 }}>
        Resumen — {done}/{total} modelos ({pct}%)
      </h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#94a3b8' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', textAlign: 'left' }}>
            <th style={{ padding: '4px 8px' }}>Asset</th>
            <th style={{ padding: '4px 8px' }}>Estado</th>
            <th style={{ padding: '4px 8px' }}>Bounding Box</th>
            <th style={{ padding: '4px 8px' }}>Notas</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.name} style={{ borderBottom: '1px solid #0f172a' }}>
              <td style={{ padding: '4px 8px', fontFamily: 'monospace' }}>{r.name}.glb</td>
              <td style={{ padding: '4px 8px' }}>{statusIcon[r.status]} {r.status}</td>
              <td style={{ padding: '4px 8px', fontFamily: 'monospace', fontSize: 11 }}>{r.bbox}</td>
              <td style={{ padding: '4px 8px', fontSize: 11 }}>{r.errorMsg ?? r.notes}</td>
            </tr>
          ))}
          {/* Fila audio */}
          <tr style={{ borderBottom: '1px solid #0f172a', background: '#0a0f18' }}>
            <td style={{ padding: '4px 8px', fontFamily: 'monospace' }}>shona-theme.mp3</td>
            <td style={{ padding: '4px 8px' }}>{statusIcon[audioResult.status]} {audioResult.status}</td>
            <td style={{ padding: '4px 8px', color: '#475569' }}>—</td>
            <td style={{ padding: '4px 8px', fontSize: 11 }}>{audioResult.notes}</td>
          </tr>
        </tbody>
      </table>

      {results.some(r => r.status === 'ERROR') && (
        <div style={{
          marginTop: 12,
          padding: '8px 12px',
          background: '#1a0a0a',
          border: '1px solid #7f1d1d',
          borderRadius: 6,
          color: '#fca5a5',
          fontSize: 12,
        }}>
          <strong>Recomendación:</strong> Los modelos en ERROR deben ser excluidos
          temporalmente del build solar. Reemplazar por una esfera placeholder
          (<code>THREE.SphereGeometry</code>) hasta que el asset sea reparado.
        </div>
      )}
    </div>
  )
}

// ── Página principal del smoke test ──────────────────────────────────────────

export default function SmokeTestGLB() {
  const [results, setResults] = useState<GLBResult[]>([])
  const [audioResult, setAudioResult] = useState<AudioResult>({
    status: 'PENDING',
    notes: 'No descargado — esperando interacción',
    networkRequested: false,
  })

  const handleGLBComplete = useCallback((result: GLBResult) => {
    setResults(prev => {
      // Evitar duplicados si el callback se llama dos veces
      if (prev.some(r => r.name === result.name)) return prev
      return [...prev, result]
    })
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#070B1A',
      color: '#e2e8f0',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '32px 24px',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-block',
          background: '#1a2744',
          border: '1px solid #2563eb44',
          borderRadius: 6,
          padding: '3px 10px',
          fontSize: 11,
          color: '#60a5fa',
          letterSpacing: '0.08em',
          marginBottom: 12,
        }}>
          FASE 0 — SMOKE TEST
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>
          Asset Validation: Solar GLB + Audio
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Carga cada modelo en una escena R3F mínima · Detecta fallos de render ·
          Valida lazy-loading del MP3
        </p>
      </div>

      {/* Tabla de resumen (arriba para visibilidad rápida) */}
      <div style={{ marginBottom: 32 }}>
        <SummaryTable
          results={results}
          total={GLB_ASSETS.length}
          audioResult={audioResult}
        />
      </div>

      {/* Panel de audio */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, color: '#94a3b8', marginBottom: 12, fontWeight: 600 }}>
          Audio
        </h2>
        <AudioPanel result={audioResult} onResult={setAudioResult} />
      </div>

      {/* Grid de modelos GLB */}
      <div>
        <h2 style={{ fontSize: 16, color: '#94a3b8', marginBottom: 16, fontWeight: 600 }}>
          Modelos GLB ({GLB_ASSETS.length})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          {GLB_ASSETS.map(asset => (
            <GLBCard
              key={asset.name}
              asset={asset}
              onComplete={handleGLBComplete}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 48,
        padding: '16px',
        borderTop: '1px solid #1e293b',
        color: '#334155',
        fontSize: 12,
        textAlign: 'center',
      }}>
        Smoke test temporal — Fase 0 · No incluir en producción final · Ruta: /smoke-test
      </div>
    </div>
  )
}
