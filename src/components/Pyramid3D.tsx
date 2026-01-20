import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const PyramidMesh: React.FC = () => {
  // Create pyramid geometry (4-sided cone = square pyramid)
  // openEnded: false includes the base cap
  // 30% bigger: 0.7 * 1.3 = 0.91, 1.2 * 1.3 = 1.56
  const pyramidGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(0.91, 1.56, 4, 1, false)
    
    // Create array of colors for each face (matching cube style)
    const colors = [
      new THREE.Color(0x60a5fa), // Blue - front
      new THREE.Color(0xa78bfa), // Purple - right
      new THREE.Color(0x60a5fa), // Blue - back
      new THREE.Color(0xa78bfa), // Purple - left
      new THREE.Color(0xec4899), // Pink - base
    ]
    
    // Apply colors to faces using vertex colors
    const colorArray = new Float32Array(geometry.attributes.position.count * 3)
    
    // ConeGeometry structure: 4 side faces (each with 2 triangles = 6 vertices)
    // Then base face (4 triangles = 12 vertices)
    let vertexIndex = 0
    
    // Side faces (4 faces, each with 6 vertices)
    for (let face = 0; face < 4; face++) {
      const color = colors[face]
      for (let v = 0; v < 6; v++) {
        colorArray[vertexIndex * 3] = color.r
        colorArray[vertexIndex * 3 + 1] = color.g
        colorArray[vertexIndex * 3 + 2] = color.b
        vertexIndex++
      }
    }
    
    // Base face (pink)
    const baseColor = colors[4]
    const remainingVertices = geometry.attributes.position.count - vertexIndex
    for (let v = 0; v < remainingVertices; v++) {
      colorArray[vertexIndex * 3] = baseColor.r
      colorArray[vertexIndex * 3 + 1] = baseColor.g
      colorArray[vertexIndex * 3 + 2] = baseColor.b
      vertexIndex++
    }
    
    geometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))
    
    return geometry
  }, [])
  
  return (
    <group rotation={[-0.5, 0, 0]}>
      {/* Complete pyramid with built-in base and gradient colors */}
      <mesh geometry={pyramidGeometry}>
        <meshStandardMaterial
          vertexColors
          opacity={0.15}
          transparent
          side={THREE.DoubleSide}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}

const Pyramid3D: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      style={{ width: '234px', height: '234px', background: 'transparent' }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      frameloop="always"
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.4} />
      <PyramidMesh />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.8}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </Canvas>
  )
}

export default Pyramid3D
