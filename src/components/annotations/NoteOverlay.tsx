import { useState, useEffect, useRef } from 'react'
import NoteCard from './NoteCard'
import type { NoteAnnotation } from '../../types'

interface NoteOverlayProps {
  notes: NoteAnnotation[]
  onNoteUpdate: (id: string, updates: Partial<NoteAnnotation>) => void
  onNoteDelete: (id: string) => void
  onNoteEdit?: (id: string) => void
}

const NOTE_COLOR = '#ef4444'

export default function NoteOverlay({
  notes,
  onNoteUpdate,
  onNoteDelete,
  onNoteEdit,
}: NoteOverlayProps) {
  const [cardPositions, setCardPositions] = useState<
    Record<string, { x: number; y: number }>
  >({})
  const [screenPositions, setScreenPositions] = useState<
    Record<string, { x: number; y: number }>
  >({})
  const canvasOffsetRef = useRef({ x: 0, y: 0 })

  // คืนตำแหน่งการ์ดจาก note ที่เคยบันทึก (หลังปิดแล้วเปิด Note Annotations)
  useEffect(() => {
    setCardPositions((prev) => {
      let next = { ...prev }
      for (const note of notes) {
        if (
          note.cardPositionX != null &&
          note.cardPositionY != null &&
          !(note.id in next)
        ) {
          next[note.id] = { x: note.cardPositionX, y: note.cardPositionY }
        }
      }
      return next
    })
  }, [notes])

  useEffect(() => {
    const handleCanvasInfo = (e: CustomEvent<{ left: number; top: number }>) => {
      canvasOffsetRef.current = {
        x: Math.round(e.detail.left),
        y: Math.round(e.detail.top),
      }
    }
    window.addEventListener('canvasInfo' as any, handleCanvasInfo)
    return () => window.removeEventListener('canvasInfo' as any, handleCanvasInfo)
  }, [])

  useEffect(() => {
    const handleScreenPosition = (event: Event) => {
      const customEvent = event as CustomEvent<{
        id: string
        screenPos: { x: number; y: number }
      }>
      const { id, screenPos } = customEvent.detail
      const canvas = canvasOffsetRef.current
      const newCardPos = {
        x: screenPos.x + canvas.x + 100,
        y: screenPos.y + canvas.y - 50,
      }
      setScreenPositions((prev) => ({ ...prev, [id]: screenPos }))
      setCardPositions((prev) => {
        if (prev[id]) return prev
        onNoteUpdate(id, { cardPositionX: newCardPos.x, cardPositionY: newCardPos.y })
        return { ...prev, [id]: newCardPos }
      })
    }
    window.addEventListener('noteScreenPosition', handleScreenPosition)
    return () =>
      window.removeEventListener('noteScreenPosition', handleScreenPosition)
  }, [onNoteUpdate])

  const handleCardPositionChange = (id: string, pos: { x: number; y: number }) => {
    setCardPositions((prev) => ({ ...prev, [id]: pos }))
    onNoteUpdate(id, { cardPositionX: pos.x, cardPositionY: pos.y })
  }

  const handleCardSizeChange = (id: string, size: { width: number; height: number }) => {
    onNoteUpdate(id, { cardWidth: size.width, cardHeight: size.height })
  }

  return (
    <>
      {notes.map((note) => {
        const cardPos = cardPositions[note.id]
        if (!cardPos) return null
        return (
          <NoteCard
            key={`card-${note.id}`}
            id={note.id}
            title={note.title}
            content={note.text}
            pages={note.pages}
            color={note.color ?? NOTE_COLOR}
            position3D={[note.positionX, note.positionY, note.positionZ]}
            position2D={cardPos}
            width={note.cardWidth}
            height={note.cardHeight}
            onPositionChange={(pos) => handleCardPositionChange(note.id, pos)}
            onSizeChange={(size) => handleCardSizeChange(note.id, size)}
            onDelete={() => onNoteDelete(note.id)}
            onEdit={() => onNoteEdit?.(note.id)}
          />
        )
      })}

      <div
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ zIndex: 40 }}
      >
        <svg
          key="svg-note-connectors"
          className="w-full h-full"
          style={{ position: 'absolute', top: 0, left: 0 }}
          preserveAspectRatio="none"
        >
          {notes.map((note) => {
            const screenPos = screenPositions[note.id]
            const cardPos = cardPositions[note.id]
            if (!screenPos || !cardPos) return null

            const lineStartX = screenPos.x + canvasOffsetRef.current.x
            const lineStartY = screenPos.y + canvasOffsetRef.current.y
            const cardElement = document.querySelector(
              `[data-annotation-id="${note.id}"]`
            ) as HTMLElement
            if (!cardElement) return null
            const cardRect = cardElement.getBoundingClientRect()
            const cardTopCenterX = cardRect.left + cardRect.width / 2
            const cardTopCenterY = cardRect.top

            const strokeColor = note.color ?? NOTE_COLOR
            return (
              <g key={`connector-${note.id}`}>
                <path
                  d={`M ${lineStartX} ${lineStartY} Q ${(lineStartX + cardTopCenterX) / 2} ${(lineStartY + cardTopCenterY) / 2 - 30}, ${cardTopCenterX} ${cardTopCenterY}`}
                  stroke={strokeColor}
                  strokeWidth="2"
                  fill="none"
                  opacity={0.7}
                />
                <circle cx={lineStartX} cy={lineStartY} r="6" fill={strokeColor} opacity={0.8}>
                  <animate
                    attributeName="r"
                    values="6;8;6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            )
          })}
        </svg>
      </div>
    </>
  )
}
