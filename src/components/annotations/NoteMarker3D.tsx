import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { NoteAnnotation } from '../../types'

interface NoteMarker3DProps {
  note: NoteAnnotation
  /** เปิดโหมดย้ายหมุด (ลากได้) */
  isMoving?: boolean
  onPositionChange?: (position: { x: number; y: number; z: number }) => void
  onMoveEnd?: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

const NOTE_COLOR = '#ef4444'

export default function NoteMarker3D({
  note,
  isMoving = false,
  onPositionChange,
  onMoveEnd,
  onDragStart,
  onDragEnd,
}: NoteMarker3DProps) {
  const markerRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const { camera, gl } = useThree()
  const isDraggingRef = useRef(false)
  const dragPosRef = useRef({ x: 0, y: 0, z: 0 })
  const planeRef = useRef(new THREE.Plane())
  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const intersectRef = useRef(new THREE.Vector3())

  // ตำแหน่งหมุด = จุดที่คลิกบนโมเดล (offsetY ใช้เฉพาะเมื่อต้องการเลื่อนหมุดขึ้นจากจุดนั้น)
  const position: [number, number, number] = [
    note.positionX,
    note.positionY + (note.offsetY ?? 0),
    note.positionZ,
  ]

  useFrame(() => {
    if (markerRef.current && !isDraggingRef.current) {
      const vector = new THREE.Vector3(...position)
      vector.project(camera)
      const x = (vector.x * 0.5 + 0.5) * gl.domElement.clientWidth
      const y = (-(vector.y * 0.5) + 0.5) * gl.domElement.clientHeight
      window.dispatchEvent(
        new CustomEvent('noteScreenPosition', {
          detail: { id: note.id, screenPos: { x, y } },
        })
      )
    }
  })

  const handlePointerDown = (e: { stopPropagation: () => void; pointerId?: number; nativeEvent?: { pointerId?: number } }) => {
    if (!isMoving || !onPositionChange || !onDragStart) return
    e.stopPropagation()
    isDraggingRef.current = true
    dragPosRef.current = { x: position[0], y: position[1], z: position[2] }
    onDragStart()
    const el = gl.domElement
    const pid = e.nativeEvent?.pointerId ?? e.pointerId ?? 0
    el.setPointerCapture?.(pid)

    const onPointerMove = (ev: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      mouseRef.current.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1
      raycasterRef.current.setFromCamera(mouseRef.current, camera)
      planeRef.current.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(new THREE.Vector3()),
        new THREE.Vector3(dragPosRef.current.x, dragPosRef.current.y, dragPosRef.current.z)
      )
      const hit = raycasterRef.current.ray.intersectPlane(planeRef.current, intersectRef.current)
      if (hit) {
        dragPosRef.current = { x: hit.x, y: hit.y, z: hit.z }
        onPositionChange({ x: hit.x, y: hit.y, z: hit.z })
      }
    }
    const onPointerUp = () => {
      isDraggingRef.current = false
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.releasePointerCapture?.(pid)
      onMoveEnd?.()
      onDragEnd?.()
    }
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp, { once: true })
  }

  return (
    <group ref={groupRef} position={position}>
      <mesh ref={markerRef} onPointerDown={handlePointerDown}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color={NOTE_COLOR}
          emissive={NOTE_COLOR}
          emissiveIntensity={isMoving ? 0.8 : 0.5}
        />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.1, 32]} />
        <meshBasicMaterial color={NOTE_COLOR} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
