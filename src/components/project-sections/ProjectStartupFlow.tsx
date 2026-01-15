import React, { useEffect, useState, Suspense, useCallback, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { FaUsers, FaRocket, FaComments, FaHandshake } from 'react-icons/fa'
import { SiReact, SiTypescript, SiSpringboot, SiPostgresql, SiTailwindcss } from 'react-icons/si'
import ReactFlow, { Node, Edge, Background, useNodesState, useEdgesState, addEdge, Connection, Handle, Position } from 'reactflow'
import 'reactflow/dist/style.css'

// Custom hook for scroll-triggered animations
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const elements = ref.current?.querySelectorAll('.animate-on-scroll, .animate-fade-up, .animate-scale-up, .animate-slide-left, .animate-slide-right, .animate-blur-in')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return ref
}

// Generate random stars
const generateStars = (count: number) => {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3,
      duration: Math.random() * 2 + 2,
      opacity: Math.random() * 0.5 + 0.3,
    })
  }
  return stars
}

// Custom Node Component for React Flow - Rounded Rectangle Style (Blue theme for StartupConnect)
const CustomNodeBlue = ({ data }: { data: { label: string; isPrimary?: boolean } }) => {
  const isPrimary = data.isPrimary || false
  return (
    <div className={`px-6 py-4 rounded-xl shadow-lg transition-all hover:scale-105 relative min-w-[120px] ${
      isPrimary 
        ? 'bg-blue-400/20 border-2 border-blue-400' 
        : 'bg-gray-800/80 border border-gray-600/50'
    }`}>
      <div className={`text-base font-medium text-center whitespace-nowrap ${
        isPrimary ? 'text-white' : 'text-white'
      }`}>
        {data.label}
      </div>
      {/* Handles for connections */}
      <Handle type="source" position={Position.Right} className="!bg-gray-400/50 !border-gray-400 !w-2 !h-2" />
      <Handle type="target" position={Position.Left} className="!bg-gray-400/50 !border-gray-400 !w-2 !h-2" />
    </div>
  )
}

const nodeTypesBlue = {
  custom: CustomNodeBlue,
}

// User Flow Diagram Component for StartupConnect - Clean Horizontal Layout
const UserFlowDiagramStartup: React.FC = () => {
  const initialNodes: Node[] = [
    // Row 1: Authentication Flow (Top - Y: 0)
    { id: '1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Splash Screen', isPrimary: true } },
    { id: '2', type: 'custom', position: { x: 250, y: 0 }, data: { label: 'SignUp', isPrimary: true } },
    { id: '3', type: 'custom', position: { x: 250, y: 300 }, data: { label: 'Login', isPrimary: false } },
    { id: '4', type: 'custom', position: { x: 500, y: 150 }, data: { label: 'Main Nav', isPrimary: true } },
    
    // Row 2: Discover & Match Flow (Y: 300)
    { id: '5', type: 'custom', position: { x: 750, y: 300 }, data: { label: 'Discover', isPrimary: false } },
    { id: '6', type: 'custom', position: { x: 1000, y: 300 }, data: { label: 'Swipe', isPrimary: false } },
    { id: '7', type: 'custom', position: { x: 1250, y: 300 }, data: { label: 'View Profile', isPrimary: false } },
    { id: '8', type: 'custom', position: { x: 1500, y: 300 }, data: { label: 'Match', isPrimary: true } },
    
    // Row 3: Feed Flow (Y: 600)
    { id: '9', type: 'custom', position: { x: 750, y: 600 }, data: { label: 'Feed', isPrimary: false } },
    { id: '10', type: 'custom', position: { x: 1000, y: 600 }, data: { label: 'View Post', isPrimary: false } },
    { id: '11', type: 'custom', position: { x: 1250, y: 600 }, data: { label: 'Create Post', isPrimary: false } },
    { id: '12', type: 'custom', position: { x: 1500, y: 600 }, data: { label: 'Like/Comment', isPrimary: false } },
    
    // Row 4: Chat Flow (Y: 900)
    { id: '13', type: 'custom', position: { x: 750, y: 900 }, data: { label: 'Chat List', isPrimary: false } },
    { id: '14', type: 'custom', position: { x: 1000, y: 900 }, data: { label: 'Individual Chat', isPrimary: true } },
    { id: '15', type: 'custom', position: { x: 1250, y: 900 }, data: { label: 'Group Chat', isPrimary: false } },
    
    // Row 5: Profile & Settings (Y: 1200)
    { id: '16', type: 'custom', position: { x: 750, y: 1200 }, data: { label: 'Profile', isPrimary: false } },
    { id: '17', type: 'custom', position: { x: 1000, y: 1200 }, data: { label: 'Edit Profile', isPrimary: false } },
    { id: '18', type: 'custom', position: { x: 1250, y: 1200 }, data: { label: 'My Connections', isPrimary: false } },
    { id: '19', type: 'custom', position: { x: 1500, y: 1200 }, data: { label: 'Settings', isPrimary: false } },
  ]

  const initialEdges: Edge[] = [
    // Authentication Flow
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Main Nav to all sections
    { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e4-9', source: '4', target: '9', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e4-13', source: '4', target: '13', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e4-16', source: '4', target: '16', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Discover & Match Flow (Row 2)
    { id: 'e5-6', source: '5', target: '6', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e6-7', source: '6', target: '7', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e7-8', source: '7', target: '8', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Feed Flow (Row 3)
    { id: 'e9-10', source: '9', target: '10', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e9-11', source: '9', target: '11', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e10-12', source: '10', target: '12', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e11-12', source: '11', target: '12', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Match to Chat
    { id: 'e8-13', source: '8', target: '13', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Chat Flow (Row 4)
    { id: 'e13-14', source: '13', target: '14', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e13-15', source: '13', target: '15', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Profile Flow (Row 5)
    { id: 'e16-17', source: '16', target: '17', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e16-18', source: '16', target: '18', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e4-19', source: '4', target: '19', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
  ]

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Prevent node dragging by filtering out position changes
  const handleNodesChange = useCallback((changes: any) => {
    const filteredChanges = changes.filter((change: any) => change.type !== 'position')
    onNodesChange(filteredChanges)
  }, [onNodesChange])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  useEffect(() => {
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.15, duration: 400 })
      }, 100)
    }
  }, [nodes, edges, reactFlowInstance])

  return (
    <div className="w-full h-full rounded-lg overflow-hidden" style={{ background: 'transparent' }}>
      <ReactFlow
        onInit={setReactFlowInstance}
        nodes={nodes.map(node => ({ ...node, draggable: false }))}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypesBlue}
        fitView
        fitViewOptions={{ padding: 0.3, duration: 400 }}
        minZoom={0.15}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
        style={{ background: 'transparent' }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
      >
        <Background color="transparent" />
      </ReactFlow>
    </div>
  )
}

// Starry background component
const StarryBackground: React.FC<{ shootingStars?: boolean; stars: Array<{ id: number; left: string; top: string; size: number; delay: number; duration: number; opacity: number }> }> = ({ shootingStars = true, stars }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {stars.map((star) => (
      <div
        key={star.id}
        className="absolute rounded-full bg-white animate-twinkle"
        style={{
          left: star.left,
          top: star.top,
          width: `${star.size}px`,
          height: `${star.size}px`,
          animationDelay: `${star.delay}s`,
          animationDuration: `${star.duration}s`,
          opacity: star.opacity,
        }}
      />
    ))}
    {shootingStars && (
      <>
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-shooting-star" style={{ animationDelay: '0s' }} />
        <div className="absolute top-1/3 left-2/3 w-1 h-1 bg-white rounded-full animate-shooting-star" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white rounded-full animate-shooting-star" style={{ animationDelay: '8s' }} />
      </>
    )}
  </div>
)

// Matching criteria data with explanations
const matchingCriteria = [
  { id: 'types', label: 'User Types', explanation: 'Matches entrepreneurs with investors, mentors with startups, creating complementary connections.' },
  { id: 'industry', label: 'Industry', explanation: 'Aligns users by sector expertise — fintech founders meet fintech investors.' },
  { id: 'location', label: 'Location', explanation: 'Prioritizes local connections while enabling global networking opportunities.' },
  { id: 'investment', label: 'Investment', explanation: 'Matches startups with investors whose ticket size fits their funding needs.' },
  { id: 'expertise', label: 'Expertise', explanation: 'Connects founders with mentors who have relevant domain knowledge.' },
  { id: 'availability', label: 'Availability', explanation: 'Considers time zones and mentoring capacity for scheduling compatibility.' },
]

// Unified color scheme
const ELEMENT_COLOR = '#3b82f6' // Blue
const SUN_COLOR = '#fbbf24' // Amber/Gold

// 3D Orbiting Node Component - Static position, parent rotates
interface OrbitingNodeProps {
  angle: number
  radius: number
  label: string
  onClick: () => void
  isSelected: boolean
}

const OrbitingNode: React.FC<OrbitingNodeProps> = ({ angle, radius, label, onClick, isSelected }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Direct scale - no lerp for instant response
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(isSelected ? 1.3 : 1.05)
    }
  })

  // Calculate static position based on angle
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius

  return (
    <group position={[x, 0, z]}>
      <mesh ref={meshRef} onClick={onClick}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial 
          color={ELEMENT_COLOR} 
          emissive={ELEMENT_COLOR}
          emissiveIntensity={isSelected ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <Billboard>
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.22}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </Billboard>
    </group>
  )
}

// Orbit container - rotates parent group for ultra-smooth animation
interface OrbitContainerProps {
  selectedCriteria: string | null
  setSelectedCriteria: (id: string | null) => void
}

const OrbitContainer: React.FC<OrbitContainerProps> = ({ selectedCriteria, setSelectedCriteria }) => {
  const orbitRef = useRef<THREE.Group>(null)
  const radius = 2.5
  
  useFrame((_state, delta) => {
    if (orbitRef.current) {
      // Direct delta-based rotation for smooth, consistent motion
      orbitRef.current.rotation.y += delta * 0.25
    }
  })

  return (
    <group ref={orbitRef}>
      {matchingCriteria.map((item, index) => {
        const angle = (index / matchingCriteria.length) * Math.PI * 2
        return (
          <OrbitingNode
            key={item.id}
            angle={angle}
            radius={radius}
            label={item.label}
            onClick={() => setSelectedCriteria(selectedCriteria === item.id ? null : item.id)}
            isSelected={selectedCriteria === item.id}
          />
        )
      })}
    </group>
  )
}

// Sun component with rays - optimized
const Sun: React.FC = () => {
  const sunRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const pulseTime = useRef(0)
  
  useFrame((_state, delta) => {
    if (sunRef.current) {
      // Frame-rate independent rotation
      sunRef.current.rotation.z += delta * 0.1
    }
    if (coreRef.current) {
      // Smooth pulsing using delta time
      pulseTime.current += delta * 2
      const pulse = 1 + Math.sin(pulseTime.current) * 0.05
      coreRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group ref={sunRef}>
      {/* Sun rays - optimized count */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} rotation={[0, 0, angle]} position={[0, 0, 0]}>
            <boxGeometry args={[0.15, 1.2, 0.15]} />
            <meshStandardMaterial 
              color={SUN_COLOR} 
              emissive={SUN_COLOR}
              emissiveIntensity={0.8}
            />
          </mesh>
        )
      })}
      {/* Sun core - smooth sphere */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color={SUN_COLOR}
          emissive={SUN_COLOR}
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      {/* Central glow light */}
      <pointLight color={SUN_COLOR} intensity={2.5} distance={8} decay={2} />
    </group>
  )
}

// Orbital ring component - optimized
const OrbitalRing: React.FC<{ radius: number; opacity: number }> = ({ radius, opacity }) => {
  const ringRef = useRef<THREE.Mesh>(null)
  
  useFrame((_state, delta) => {
    if (ringRef.current) {
      // Frame-rate independent rotation
      ringRef.current.rotation.z += delta * 0.08
    }
  })

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 6, 32]} />
      <meshStandardMaterial 
        color={ELEMENT_COLOR} 
        transparent 
        opacity={opacity} 
        emissive={ELEMENT_COLOR} 
        emissiveIntensity={0.5} 
      />
    </mesh>
  )
}

// Main 3D Scene
interface MatchingScene3DProps {
  selectedCriteria: string | null
  setSelectedCriteria: (id: string | null) => void
}

const MatchingScene3D: React.FC<MatchingScene3DProps> = ({ selectedCriteria, setSelectedCriteria }) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      
      {/* Central Sun */}
      <Sun />
      
      {/* Orbital rings */}
      <OrbitalRing radius={2.5} opacity={0.3} />
      <OrbitalRing radius={3.2} opacity={0.15} />
      
      {/* Optimized orbit container - single rotation for all nodes */}
      <OrbitContainer 
        selectedCriteria={selectedCriteria}
        setSelectedCriteria={setSelectedCriteria}
      />
      
      {/* Camera controls - optimized for smooth rotation */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

const ProjectStartupFlow: React.FC = () => {
  const sectionRef = useScrollAnimation()
  const [selectedCriteria, setSelectedCriteria] = useState<string | null>(null)
  const [stars] = useState(() => generateStars(80))

  return (
    <div ref={sectionRef} className="relative">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#0f1629] to-[#0a0f1a]">
        <StarryBackground stars={stars} />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          {/* Project Title */}
          <div className="text-center mb-16">
            <p className="animate-fade-in-up text-blue-400 text-sm uppercase tracking-[0.3em] mb-4 font-medium" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              Professional Networking Platform
            </p>
            <h2 className="animate-fade-in-up text-6xl md:text-8xl lg:text-9xl font-bold font-heading tracking-tight mb-6" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                StartupConnect
              </span>
            </h2>
            <p className="animate-fade-in-up text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-body" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
              LinkedIn meets Tinder — a social network for the startup ecosystem with swipe-based matching and community collaboration
            </p>
          </div>

          {/* Phone Mockups - Similar to Reservo */}
          <div className="relative flex justify-center items-end gap-4 md:gap-8 pb-8">
            
            {/* Floating Badge - Top Left */}
            <div 
              className="animate-fade-in-up absolute -left-4 md:left-[5%] lg:left-[10%] top-[10%] z-20 hidden sm:block"
              style={{ animationDelay: '0.9s', animationFillMode: 'both' }}
            >
              <div className="animate-float-slow flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-blue-500/10">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <FaHandshake className="text-sm text-blue-400" />
                </div>
                <span className="text-white text-sm font-medium">Smart Match</span>
              </div>
            </div>

            {/* Floating Badge - Top Right */}
            <div 
              className="animate-fade-in-up absolute -right-4 md:right-[5%] lg:right-[10%] top-[15%] z-20 hidden sm:block"
              style={{ animationDelay: '1.1s', animationFillMode: 'both' }}
            >
              <div className="animate-float-delayed flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-indigo-500/10">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <FaRocket className="text-sm text-indigo-400" />
                </div>
                <span className="text-white text-sm font-medium">Social Feed</span>
              </div>
            </div>

            {/* Floating Badge - Bottom Left */}
            <div 
              className="animate-fade-in-up absolute -left-4 md:left-[8%] lg:left-[12%] bottom-[25%] z-20 hidden sm:block"
              style={{ animationDelay: '1.3s', animationFillMode: 'both' }}
            >
              <div className="animate-float flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-purple-500/10">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <FaUsers className="text-sm text-purple-400" />
                </div>
                <span className="text-white text-sm font-medium">Rooms</span>
              </div>
            </div>

            {/* Floating Badge - Bottom Right */}
            <div 
              className="animate-fade-in-up absolute -right-4 md:right-[8%] lg:right-[12%] bottom-[30%] z-20 hidden sm:block"
              style={{ animationDelay: '1.5s', animationFillMode: 'both' }}
            >
              <div className="animate-float-delayed flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-cyan-500/10">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <FaComments className="text-sm text-cyan-400" />
                </div>
                <span className="text-white text-sm font-medium">Real-time Chat</span>
              </div>
            </div>

            {/* Left Phone - Tilted */}
            <div 
              className="animate-fade-in-up relative w-44 md:w-64 lg:w-80 transform -rotate-6 translate-y-8 hidden sm:block"
              style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
            >
              <div className="relative animate-phone-float-delayed">
                <div className="absolute -inset-2 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-[2rem] blur-xl opacity-60" />
                <div className="relative bg-black rounded-[2rem] p-3 md:p-4 border border-white/10 shadow-2xl">
                  <div className="bg-[#111] rounded-[1.75rem] overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center justify-center">
                    <img 
                      src="/assets/projects/startupconnect/matching.png" 
                      alt="StartupConnect Match View"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Center Phone - Main */}
            <div className="animate-fade-in-up relative w-64 md:w-80 lg:w-96 z-10" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <div className="relative animate-phone-float">
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/40 via-indigo-500/40 to-purple-500/40 rounded-[3rem] blur-2xl" />
                <div className="relative bg-black rounded-[3rem] p-4 md:p-5 border border-white/20 shadow-2xl shadow-blue-500/20">
                  {/* Notch */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
                  <div className="bg-[#111] rounded-[2.5rem] overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center justify-center">
                    <img 
                      src="/assets/projects/startupconnect/feed.png" 
                      alt="StartupConnect Home Feed"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Phone - Tilted */}
            <div 
              className="animate-fade-in-up relative w-44 md:w-64 lg:w-80 transform rotate-6 translate-y-8 hidden sm:block"
              style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
            >
              <div className="relative animate-phone-float-delayed-2">
                <div className="absolute -inset-2 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-[2rem] blur-xl opacity-60" />
                <div className="relative bg-black rounded-[2rem] p-3 md:p-4 border border-white/10 shadow-2xl">
                  <div className="bg-[#111] rounded-[1.75rem] overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center justify-center">
                    <img 
                      src="/assets/projects/startupconnect/dashboard.png" 
                      alt="StartupConnect Dashboard"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-only feature badges */}
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-3 sm:hidden">
              {(() => {
                const colorClassMap: Record<string, string> = {
                  blue: 'text-blue-400',
                  indigo: 'text-indigo-400',
                  purple: 'text-purple-400',
                  cyan: 'text-cyan-400',
                }
                return [
                  { icon: FaHandshake, label: 'Match', color: 'blue' },
                  { icon: FaRocket, label: 'Feed', color: 'indigo' },
                  { icon: FaUsers, label: 'Rooms', color: 'purple' },
                  { icon: FaComments, label: 'Chat', color: 'cyan' },
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="animate-fade-in-up flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15]"
                    style={{ animationDelay: `${0.9 + index * 0.1}s`, animationFillMode: 'both' }}
                  >
                    <item.icon className={`text-xs ${colorClassMap[item.color]}`} />
                    <span className="text-white text-xs font-medium">{item.label}</span>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-scroll"></div>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="relative py-32 bg-gradient-to-b from-[#0a0f1a] to-[#0a0a0f]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`overview-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay + 0.5}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Main Description */}
            <div className="mb-16">
              <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 font-light leading-relaxed font-body">
                StartupConnect combines <span className="text-blue-400 font-medium">LinkedIn-style professional networking</span> with 
                <span className="text-indigo-400 font-medium"> Tinder-inspired swipe mechanics</span> to create meaningful 
                connections between entrepreneurs, investors, and mentors.
              </p>
            </div>

            {/* Tech Stack */}
            <div className="mb-16">
              <p className="text-gray-500 text-sm tracking-wide">
                React · TypeScript · Spring Boot · PostgreSQL · Tailwind CSS
              </p>
              <p className="text-white/50 text-sm mt-3">
                Mobile-First Web App · REST API · Session Authentication
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent mb-16" />

            {/* Role Description */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">My Role</p>
              <h4 className="text-blue-400 text-lg font-semibold mb-3">Founder & Front-End Developer</h4>
              <p className="text-gray-300 text-lg leading-relaxed font-body max-w-2xl mx-auto">
                Led the product vision and built the React frontend with swipe mechanics, 
                responsive design, and real-time features for the startup networking platform.
              </p>
            </div>

            {/* GitHub Link */}
            <div className="flex justify-center">
              <a 
                href="https://github.com/jcunto2010/Entrepeneur_app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 transition-all font-medium"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>View on GitHub</span>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* Core Features - Clean editorial layout */}
      <div className="relative py-32 bg-[#0a0a0f]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`features-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay + 1}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            
            {/* Section Title */}
            <div className="mb-20">
              <p className="text-blue-400 text-xs uppercase tracking-[0.3em] mb-4">Core Features</p>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight">
                Network smarter,<br />
                <span className="text-gray-500">connect faster.</span>
              </h3>
            </div>

            {/* Features - Simple staggered list */}
            <div className="space-y-12">
              <div className="flex items-start gap-8">
                <span className="text-5xl font-bold text-blue-500/20 font-heading">01</span>
                <div>
                  <h4 className="text-2xl font-semibold text-white mb-2">Swipe to Match</h4>
                  <p className="text-gray-400 text-lg">Tinder-style cards let you quickly discover and connect with relevant startups, investors, and mentors.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-8">
                <span className="text-5xl font-bold text-indigo-500/20 font-heading">02</span>
                <div>
                  <h4 className="text-2xl font-semibold text-white mb-2">Social Feed</h4>
                  <p className="text-gray-400 text-lg">Share milestones, celebrate wins, and stay updated on the startups you follow — LinkedIn-style.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-8">
                <span className="text-5xl font-bold text-purple-500/20 font-heading">03</span>
                <div>
                  <h4 className="text-2xl font-semibold text-white mb-2">Community Rooms</h4>
                  <p className="text-gray-400 text-lg">Public and private spaces for collaboration, Q&A, and networking within your industry vertical.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-8">
                <span className="text-5xl font-bold text-cyan-500/20 font-heading">04</span>
                <div>
                  <h4 className="text-2xl font-semibold text-white mb-2">Real-time Messaging</h4>
                  <p className="text-gray-400 text-lg">Instant chat within rooms and direct messages to keep conversations flowing.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Smart Matching - 3D Orbital with click interaction */}
      <div className="relative py-32 bg-gradient-to-b from-[#0a0a0f] to-[#0a0f1a]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`matching-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay + 1.5}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            
            {/* Section Title */}
            <div className="mb-16 text-center">
              <p className="text-indigo-400 text-xs uppercase tracking-[0.3em] mb-4">Smart Matching</p>
              <h3 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4">
                The algorithm considers
              </h3>
              <p className="text-gray-500">Click any element to learn more</p>
            </div>

            {/* 3D Orbital Layout - Three.js Canvas */}
            <div className="relative h-[400px] md:h-[500px] w-full">
              <Canvas 
                camera={{ position: [0, 3, 6], fov: 50 }}
                dpr={[1, 2]}
                frameloop="always"
                gl={{ 
                  antialias: true, 
                  alpha: true, 
                  powerPreference: "high-performance",
                  stencil: false,
                  depth: true
                }}
              >
                <Suspense fallback={null}>
                  <MatchingScene3D 
                    selectedCriteria={selectedCriteria} 
                    setSelectedCriteria={setSelectedCriteria} 
                  />
                </Suspense>
              </Canvas>
              
              {/* Gradient overlay at bottom for blend */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0f1a] to-transparent pointer-events-none" />
            </div>

            {/* Explanation panel */}
            <div className={`mt-8 transition-all duration-300 ${selectedCriteria ? 'opacity-100' : 'opacity-0'}`}>
              {selectedCriteria && (
                <div className="max-w-xl mx-auto text-center p-6 rounded-xl bg-white/5 border border-white/10">
                  <h4 className="text-blue-400 font-semibold mb-2">
                    {matchingCriteria.find(c => c.id === selectedCriteria)?.label}
                  </h4>
                  <p className="text-gray-400">
                    {matchingCriteria.find(c => c.id === selectedCriteria)?.explanation}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* App Screens Section */}
      <div className="relative py-24 bg-[#0a0a1a]">
        {/* Starry background - behind content */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`screens-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay + 1.8}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-white font-heading mb-2">
                App Screens
              </h3>
              <p className="text-gray-500 font-body">Key interfaces and user flows</p>
            </div>

            {/* Screenshots Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { name: 'Login', image: 'login.png' },
                { name: 'Create Post', image: 'create post.png' },
                { name: 'Chats', image: 'chats.png' },
                { name: 'Community Rooms', image: 'community rooms.png' }
              ].map((screen, index) => (
                <div 
                  key={index} 
                  className="group"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-black rounded-3xl p-3 md:p-4 border border-white/10 group-hover:border-blue-500/30 transition-colors hover-lift">
                      <div className="bg-[#111] rounded-[1.5rem] overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center justify-center">
                        <img 
                          src={`/assets/projects/startupconnect/${screen.image}`}
                          alt={`StartupConnect ${screen.name}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-gray-500 text-sm mt-4 font-body">{screen.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Flow Section */}
      <div className="relative py-32 bg-gradient-to-b from-[#0a0f1a] to-[#0a0a0f]">
        {/* Starry background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`flow-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay + 1.5}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.3,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <p className="text-blue-400 text-xs uppercase tracking-[0.3em] mb-3">User Experience</p>
              <h3 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4">
                StartupConnect <span className="text-blue-400">UserFlow</span>
              </h3>
              <p className="text-gray-400 text-base max-w-3xl font-body leading-relaxed">
                A user flow outlines the steps a user takes to complete a task on a website or app, from entry to goal completion. 
                Analyzing these flows helps designers create intuitive and efficient user experiences.
              </p>
            </div>

            {/* User Flow Diagram */}
            <div className="relative py-16" style={{ height: '1400px' }}>
              <UserFlowDiagramStartup />
            </div>

          </div>
        </div>
      </div>

      {/* Tech Stack Footer */}
      <div className="relative py-20 bg-gradient-to-b from-[#0a0f1a] to-[#0a0a1a]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`tech-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay + 2}s`,
                animationDuration: `${star.duration}s`,
                opacity: 0.4,
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <div className="flex flex-col items-center gap-2 group">
              <SiReact className="text-3xl text-[#61DAFB] opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs text-gray-500">React</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
              <SiTypescript className="text-3xl text-[#3178C6] opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs text-gray-500">TypeScript</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
              <SiSpringboot className="text-3xl text-[#6DB33F] opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs text-gray-500">Spring Boot</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
              <SiPostgresql className="text-3xl text-[#4169E1] opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs text-gray-500">PostgreSQL</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
              <SiTailwindcss className="text-3xl text-[#06B6D4] opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-xs text-gray-500">Tailwind</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectStartupFlow
