import React, { useEffect, useRef, useCallback, useState } from 'react'
import { FaRobot, FaCalendarCheck, FaBell, FaFingerprint } from 'react-icons/fa'
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

    const elements = ref.current?.querySelectorAll('.animate-on-scroll, .animate-fade-up, .animate-scale-up, .animate-slide-left, .animate-slide-right, .animate-blur-in, .animate-title-reveal')
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

const stars = generateStars(80)

// Custom Node Component for React Flow - Rounded Rectangle Style
const CustomNode = ({ data }: { data: { label: string; isPrimary?: boolean } }) => {
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
      <Handle type="source" position="right" className="!bg-gray-400/50 !border-gray-400 !w-2 !h-2" />
      <Handle type="target" position="left" className="!bg-gray-400/50 !border-gray-400 !w-2 !h-2" />
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

// User Flow Diagram Component - Clean Horizontal Layout
const UserFlowDiagram: React.FC = () => {
  const initialNodes: Node[] = [
    // Column 1: Authentication Flow (Left - X: 0)
    { id: '1', type: 'custom', position: { x: 0, y: 0 }, data: { label: 'Splash Screen', isPrimary: true }, draggable: false },
    { id: '2', type: 'custom', position: { x: 0, y: 120 }, data: { label: 'SignUp', isPrimary: true }, draggable: false },
    { id: '3', type: 'custom', position: { x: 0, y: 240 }, data: { label: 'Login', isPrimary: false }, draggable: false },
    { id: '4', type: 'custom', position: { x: 0, y: 360 }, data: { label: 'Main Nav', isPrimary: true }, draggable: false },
    
    // Column 2: Main Navigation Column (Center - X: 500) - All in same column
    { id: '5', type: 'custom', position: { x: 500, y: 0 }, data: { label: 'Home', isPrimary: false }, draggable: false },
    { id: '6', type: 'custom', position: { x: 500, y: 120 }, data: { label: 'Calendar\n(View/Delete Appointments)', isPrimary: false }, draggable: false },
    { id: '7', type: 'custom', position: { x: 500, y: 240 }, data: { label: 'Chat\n(Talk with Shops/AI)', isPrimary: false }, draggable: false },
    { id: '8', type: 'custom', position: { x: 500, y: 360 }, data: { label: 'AI Assistant\n(Book, Suggest Appointments/Shops)', isPrimary: true }, draggable: false },
    { id: '9', type: 'custom', position: { x: 500, y: 480 }, data: { label: 'Profile\n(Change Password)', isPrimary: false }, draggable: false },
    { id: '10', type: 'custom', position: { x: 500, y: 600 }, data: { label: 'Settings', isPrimary: false }, draggable: false },
    
    // Column 3: Booking Flow (Right - X: 1000+) - Horizontal flow
    { id: '11', type: 'custom', position: { x: 1000, y: 0 }, data: { label: 'Search', isPrimary: false }, draggable: false },
    { id: '12', type: 'custom', position: { x: 1200, y: 0 }, data: { label: 'Select Service', isPrimary: false }, draggable: false },
    { id: '13', type: 'custom', position: { x: 1400, y: 0 }, data: { label: 'Select Time', isPrimary: false }, draggable: false },
    { id: '14', type: 'custom', position: { x: 1600, y: 0 }, data: { label: 'Review', isPrimary: false }, draggable: false },
    { id: '15', type: 'custom', position: { x: 1800, y: 0 }, data: { label: 'Confirm', isPrimary: true }, draggable: false },
    { id: '16', type: 'custom', position: { x: 2000, y: 0 }, data: { label: 'Booking Details', isPrimary: true }, draggable: false },
  ]

  const initialEdges: Edge[] = [
    // Authentication Flow
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e3-4', source: '3', target: '4', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Main Nav to Home
    { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Home to Core Features (all in same column)
    { id: 'e5-6', source: '5', target: '6', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e5-7', source: '5', target: '7', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e5-8', source: '5', target: '8', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e5-9', source: '5', target: '9', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Profile to Settings
    { id: 'e9-10', source: '9', target: '10', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Home to Booking Flow (Schedule Appointment)
    { id: 'e5-11', source: '5', target: '11', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // AI Assistant can initiate booking
    { id: 'e8-11', source: '8', target: '11', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Booking Flow (horizontal)
    { id: 'e11-12', source: '11', target: '12', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e12-13', source: '12', target: '13', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e13-14', source: '13', target: '14', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e14-15', source: '14', target: '15', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    { id: 'e15-16', source: '15', target: '16', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
    
    // Calendar can view Booking Details
    { id: 'e6-16', source: '6', target: '16', type: 'smoothstep', style: { stroke: 'rgba(200, 200, 200, 0.4)', strokeWidth: 1.5 } },
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
        reactFlowInstance.fitView({ padding: 0.1, duration: 400 })
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
        nodeTypes={nodeTypes}
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

// Starry background component to reuse across sections
const StarryBackground: React.FC<{ shootingStars?: boolean }> = ({ shootingStars = true }) => (
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

const ProjectReservo: React.FC = () => {
  const sectionRef = useScrollAnimation()

  return (
    <section id="project-reservo" className="relative overflow-hidden" ref={sectionRef}>
      {/* Hero Section with gradient background */}
      <div className="relative min-h-screen flex items-center justify-center py-24">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#0f0f2a]" />
        
        {/* Starry background */}
        <StarryBackground />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-violet-900/20 via-transparent to-fuchsia-900/10" />
        
        {/* Decorative elements with animation */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-glow-pulse-subtle" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[128px] animate-glow-pulse-subtle" style={{ animationDelay: '2s' }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Project Title - Large and Bold with animations */}
            <div className="text-center mb-16">
              <p className="animate-fade-in-up text-violet-400 text-sm uppercase tracking-[0.3em] mb-4 font-medium" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                Mobile Application
              </p>
              <h2 className="animate-fade-in-up text-6xl md:text-8xl lg:text-9xl font-bold font-heading tracking-tight" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
                <span className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
                  Reservo.AI
                </span>
              </h2>
              <p className="animate-fade-in-up text-gray-400 text-lg md:text-xl mt-6 max-w-2xl mx-auto font-body" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                AI-powered appointment booking platform with conversational interface
              </p>
            </div>

            {/* Phone Mockups - Hero Display with floating feature badges */}
            <div className="relative flex justify-center items-end gap-4 md:gap-8 pb-8">
              
              {/* Floating Badge - Top Left */}
              <div 
                className="animate-fade-in-up absolute -left-4 md:left-[5%] lg:left-[10%] top-[10%] z-20 hidden sm:block"
                style={{ animationDelay: '0.9s', animationFillMode: 'both' }}
              >
                <div className="animate-float-slow flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-violet-500/10">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <FaRobot className="text-sm text-violet-400" />
                  </div>
                  <span className="text-white text-sm font-medium">AI Assistant</span>
                </div>
              </div>

              {/* Floating Badge - Top Right */}
              <div 
                className="animate-fade-in-up absolute -right-4 md:right-[5%] lg:right-[10%] top-[15%] z-20 hidden sm:block"
                style={{ animationDelay: '1.1s', animationFillMode: 'both' }}
              >
                <div className="animate-float-delayed flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-fuchsia-500/10">
                  <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                    <FaCalendarCheck className="text-sm text-fuchsia-400" />
                  </div>
                  <span className="text-white text-sm font-medium">Smart Booking</span>
                </div>
              </div>

              {/* Floating Badge - Bottom Left */}
              <div 
                className="animate-fade-in-up absolute -left-4 md:left-[8%] lg:left-[12%] bottom-[25%] z-20 hidden sm:block"
                style={{ animationDelay: '1.3s', animationFillMode: 'both' }}
              >
                <div className="animate-float flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-cyan-500/10">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <FaBell className="text-sm text-cyan-400" />
                  </div>
                  <span className="text-white text-sm font-medium">Notifications</span>
                </div>
              </div>

              {/* Floating Badge - Bottom Right */}
              <div 
                className="animate-fade-in-up absolute -right-4 md:right-[8%] lg:right-[12%] bottom-[30%] z-20 hidden sm:block"
                style={{ animationDelay: '1.5s', animationFillMode: 'both' }}
              >
                <div className="animate-float-delayed flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15] shadow-lg shadow-emerald-500/10">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <FaFingerprint className="text-sm text-emerald-400" />
                  </div>
                  <span className="text-white text-sm font-medium">Biometric</span>
                </div>
              </div>

              {/* Left Phone - Tilted */}
              <div 
                className="animate-fade-in-up relative w-36 md:w-52 lg:w-64 transform -rotate-6 translate-y-8 hidden sm:block"
                style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
              >
                <div className="relative animate-phone-float-delayed">
                  <div className="absolute -inset-2 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-[2rem] blur-xl opacity-60" />
                  <div className="relative bg-black rounded-[2rem] p-2 border border-white/10 shadow-2xl">
                    <div className="bg-[#111] rounded-[1.75rem] overflow-hidden aspect-[9/19.5]">
                      <img 
                        src="/assets/projects/reservo/calendar.png" 
                        alt="Reservo.AI Calendar View"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Phone - Main */}
              <div className="animate-fade-in-up relative w-52 md:w-72 lg:w-80 z-10" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
                <div className="relative animate-phone-float">
                  <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/40 via-fuchsia-500/40 to-cyan-500/40 rounded-[3rem] blur-2xl" />
                  <div className="relative bg-black rounded-[3rem] p-3 border border-white/20 shadow-2xl shadow-violet-500/20">
                    {/* Notch */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20" />
                    <div className="bg-[#111] rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
                      <img 
                        src="/assets/projects/reservo/main screen.png" 
                        alt="Reservo.AI Main Screen"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Phone - Tilted */}
              <div 
                className="animate-fade-in-up relative w-36 md:w-52 lg:w-64 transform rotate-6 translate-y-8 hidden sm:block"
                style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
              >
                <div className="relative animate-phone-float-delayed-2">
                  <div className="absolute -inset-2 bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30 rounded-[2rem] blur-xl opacity-60" />
                  <div className="relative bg-black rounded-[2rem] p-2 border border-white/10 shadow-2xl">
                    <div className="bg-[#111] rounded-[1.75rem] overflow-hidden aspect-[9/19.5]">
                      <img 
                        src="/assets/projects/reservo/shop.png" 
                        alt="Reservo.AI Shop Selection"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-only feature badges (shown below phones on small screens) */}
              <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-3 sm:hidden">
                {[
                  { icon: FaRobot, label: 'AI', color: 'violet' },
                  { icon: FaCalendarCheck, label: 'Booking', color: 'fuchsia' },
                  { icon: FaBell, label: 'Alerts', color: 'cyan' },
                  { icon: FaFingerprint, label: 'Secure', color: 'emerald' },
                ].map((item, index) => (
                  <div 
                    key={index}
                    className="animate-fade-in-up flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.15]"
                    style={{ animationDelay: `${0.9 + index * 0.1}s`, animationFillMode: 'both' }}
                  >
                    <item.icon className={`text-xs text-${item.color}-400`} />
                    <span className="text-white text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section - Editorial Style */}
      <div className="relative py-24 bg-gradient-to-b from-[#0f0f2a] to-[#0a0a1a]">
        {/* Starry background - behind content */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {stars.map((star) => (
            <div
              key={`details-${star.id}`}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: star.left,
                top: star.top,
                width: `${star.size}px`,
                height: `${star.size}px`,
                animationDelay: `${star.delay}s`,
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
                Reservo.AI is a multiplatform <span className="text-violet-400 font-medium">Flutter application</span> designed 
                to revolutionize appointment booking. Powered by <span className="text-fuchsia-400 font-medium">Google Gemini</span>, 
                it enables conversational booking, intelligent suggestions, and personalized reminders.
              </p>
            </div>

            {/* Tech Stack - Clean centered line */}
            <div className="mb-16">
              <p className="text-gray-500 text-sm mb-4">
                Flutter · Firebase · Gemini AI · Riverpod · Rive
              </p>
              <p className="text-white/60 text-sm">
                iOS & Android · Booking App
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

            {/* Role Description */}
            <div className="mb-16">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">My Role</p>
              <h4 className="text-violet-400 text-lg font-semibold mb-3">Mobile Development Manager & Founder</h4>
              <p className="text-gray-300 text-lg leading-relaxed font-body max-w-2xl mx-auto">
                Founded and lead mobile development for AI-powered appointment booking app. Integrated Google Gemini 
                for conversational interface and implemented biometric authentication with Rive animations.
              </p>
            </div>

            {/* Key Capabilities - Centered */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-4">Key Capabilities</p>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-gray-400">
                {[
                  'Real-time AI chat',
                  'Biometric authentication',
                  'Smart notifications',
                  'Cross-platform',
                  'Rive animations',
                  'Lottie animated onboarding'
                ].map((item, index) => (
                  <span key={index} className="flex items-center gap-2 group">
                    <span className="w-1 h-1 rounded-full bg-violet-500 group-hover:scale-150 transition-transform" />
                    <span className="group-hover:text-white transition-colors">{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* GitHub Link */}
            <div className="flex justify-center">
              <a 
                href="https://github.com/jcunto2010/reservo_ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-400 hover:text-violet-300 transition-all font-medium"
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

      {/* Additional Screenshots Section */}
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
                animationDelay: `${star.delay + 1}s`,
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
                { name: 'Home', image: 'home.png' },
                { name: 'Shop Selection', image: 'shop.png' },
                { name: 'Calendar', image: 'calendar.png' },
                { name: 'Booking Summary', image: 'book summary.png' }
              ].map((screen, index) => (
                <div 
                  key={index} 
                  className="group"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative bg-black rounded-3xl p-3 md:p-4 border border-white/10 group-hover:border-violet-500/30 transition-colors hover-lift">
                      <div className="bg-[#111] rounded-[1.5rem] overflow-hidden min-h-[400px] md:min-h-[500px] flex items-center justify-center">
                        <img 
                          src={`/assets/projects/reservo/${screen.image}`}
                          alt={`Reservo.AI ${screen.name}`}
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
      <div className="relative py-32 bg-gradient-to-b from-[#0a0a1a] to-[#0a0a0f]">
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
              <p className="text-violet-400 text-xs uppercase tracking-[0.3em] mb-3">User Experience</p>
              <h3 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4">
                Reservo.AI <span className="text-violet-400">UserFlow</span>
              </h3>
              <p className="text-gray-400 text-base max-w-3xl font-body leading-relaxed">
                A user flow outlines the steps a user takes to complete a task on a website or app, from entry to goal completion. 
                Analyzing these flows helps designers create intuitive and efficient user experiences.
              </p>
            </div>

            {/* User Flow Diagram */}
            <div className="relative py-16" style={{ height: '800px' }}>
              <UserFlowDiagram />
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default ProjectReservo
