import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, GripVertical, Edit2, Eye, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from '../ui/dialog'
import type { NotePage } from '../../types'

const DEFAULT_WIDTH = 300
const DEFAULT_HEIGHT = 240
const MIN_WIDTH = 220
const MIN_HEIGHT = 160
const MAX_WIDTH = 560
const MAX_HEIGHT = 480

interface NoteCardProps {
  id: string
  /** หัวข้อการ์ด (แก้ไขได้, ไม่ใส่ก็ได้ — ไม่ส่งมาจะไม่แสดงหัวข้อ) */
  title?: string
  /** เนื้อหาแบบเก่า (ข้อความเดียว) */
  content?: string
  /** เนื้อหาแบบหลายหน้า (HTML ได้) */
  pages?: NotePage[]
  position3D: [number, number, number]
  position2D: { x: number; y: number }
  /** ความกว้าง/สูงการ์ด (px) — ไม่ส่งใช้ค่า default */
  width?: number
  height?: number
  onPositionChange: (pos: { x: number; y: number }) => void
  onSizeChange?: (size: { width: number; height: number }) => void
  onDelete: () => void
  onEdit: () => void
}

export default function NoteCard(props: NoteCardProps) {
  const { id, title, content = '', pages: propPages, position2D, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, onPositionChange, onSizeChange, onDelete, onEdit } = props
  const pages: NotePage[] = propPages?.length ? propPages : [{ content: content || '' }]
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewPageIndex, setViewPageIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const resizeStartRef = useRef({ x: 0, y: 0, w: width, h: height })
  const cardRef = useRef<HTMLDivElement>(null)

  const currentPage = pages[currentPageIndex]
  const html = currentPage?.content ?? ''
  const hasMultiplePages = pages.length > 1

  /** ขนาดโซนมุมล่างขวา (px) — คลิกในโซนนี้ = ปรับขนาด, นอกโซน = ลากย้าย */
  const RESIZE_ZONE = 48

  const handleResizeZoneMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onSizeChange) return
    setIsResizing(true)
    resizeStartRef.current = { x: e.clientX, y: e.clientY, w: width, h: height }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if ((e.target as HTMLElement).closest('[data-resize-zone]')) return
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const inResizeZone =
      onSizeChange &&
      e.clientX >= rect.right - RESIZE_ZONE &&
      e.clientY >= rect.bottom - RESIZE_ZONE
    if (inResizeZone) {
      e.preventDefault()
      e.stopPropagation()
      setIsResizing(true)
      resizeStartRef.current = { x: e.clientX, y: e.clientY, w: width, h: height }
      return
    }
    setIsDragging(true)
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault()
        let newX = e.clientX - dragOffset.x
        let newY = e.clientY - dragOffset.y
        newX = Math.max(0, Math.min(newX, window.innerWidth - width))
        newY = Math.max(0, Math.min(newY, window.innerHeight - height))
        onPositionChange({ x: newX, y: newY })
      }
      if (isResizing && onSizeChange) {
        e.preventDefault()
        const { x, y, w, h } = resizeStartRef.current
        let newW = w + (e.clientX - x)
        let newH = h + (e.clientY - y)
        newW = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newW))
        newH = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newH))
        onSizeChange({ width: newW, height: newH })
        resizeStartRef.current = { x: e.clientX, y: e.clientY, w: newW, h: newH }
      }
    }
    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
    }
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, width, height, onPositionChange, onSizeChange])

  useEffect(() => {
    if (!viewOpen || pages.length <= 1) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setViewPageIndex((i) => Math.max(0, i - 1))
      } else if (e.key === 'ArrowRight') {
        setViewPageIndex((i) => Math.min(pages.length - 1, i + 1))
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [viewOpen, pages.length])

  return (
    <div
      ref={cardRef}
      data-annotation-id={id}
      className={`fixed bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isResizing ? 'select-none' : ''}`}
      style={{
        left: `${position2D.x}px`,
        top: `${position2D.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        transition: isDragging || isResizing ? 'none' : 'box-shadow 0.15s ease-out',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        contain: 'paint',
        isolation: 'isolate',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden' as const,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GripVertical className="w-4 h-4 opacity-70 shrink-0" />
          {title != null && title.trim() !== '' && (
            <span className="text-lg truncate">{title}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setViewPageIndex(0); setViewOpen(true) }}
            className="p-1 hover:bg-white/20 rounded"
            title="ดูเนื้อหาแต่ละหน้า"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={onEdit} className="p-1 hover:bg-white/20 rounded" title="แก้ไข">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-white/20 rounded" title="ลบ">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="note-card-body p-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden overflow-x-clip">
        {hasMultiplePages && (
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-200">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrentPageIndex((i) => Math.max(0, i - 1)) }}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-500">หน้า {currentPageIndex + 1} / {pages.length}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrentPageIndex((i) => Math.min(pages.length - 1, i + 1)) }}
              className="p-1 rounded hover:bg-gray-200 disabled:opacity-40"
              disabled={currentPageIndex === pages.length - 1}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        <div
          className="text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none prose-img:max-w-full prose-video:max-w-full [&:has(iframe)_iframe]:bg-transparent"
          dangerouslySetInnerHTML={{ __html: html || '<span class="text-gray-400">(ไม่มีข้อความ)</span>' }}
        />
      </div>
      <div
        data-resize-handle
        className={`absolute bottom-0 right-0 z-10 flex items-center justify-end pb-1.5 pr-1.5 pointer-events-none ${onSizeChange ? '' : 'opacity-50'}`}
        title={onSizeChange ? 'ลากเพื่อขยาย/ย่อกล่อง' : undefined}
      >
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-tl-md bg-black/5 text-gray-400 shadow-sm" title="ลากเพื่อขยาย/ย่อ">
          <Maximize2 className="w-3.5 h-3.5 shrink-0 -rotate-90" strokeWidth={2.5} aria-hidden />
        </span>
      </div>

      {onSizeChange && (
        <div
          data-resize-zone
          className="absolute bottom-0 right-0 z-[60] cursor-se-resize"
          style={{ width: RESIZE_ZONE, height: RESIZE_ZONE }}
          onMouseDown={handleResizeZoneMouseDown}
          title="ลากเพื่อปรับขนาดกล่อง"
        />
      )}

      {viewOpen &&
        createPortal(
          <Dialog open={viewOpen} onOpenChange={setViewOpen} closeOnOverlayClick>
            <DialogContent
              className="note-detail-modal max-w-lg w-full mx-auto max-h-[85vh] flex flex-col"
              onClose={() => setViewOpen(false)}
              showCloseButton
            >
              <DialogHeader className="flex flex-col gap-1">
                <DialogTitle>รายละเอียดเนื้อหา</DialogTitle>
                {title != null && title.trim() !== '' && (
                  <p className="text-sm font-medium text-foreground mt-0.5">หัวข้อ: {title}</p>
                )}
              </DialogHeader>
              <DialogBody className="flex flex-col min-h-0 flex-1 overflow-hidden p-0">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-4">
                  <div className="border rounded-lg p-4 bg-muted/30 min-w-0">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      หน้า {viewPageIndex + 1} / {pages.length}
                    </h4>
                    <div
                      className="note-detail-modal-prose text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none prose-img:max-w-full prose-img:w-full prose-video:max-w-full [&:has(iframe)_iframe]:bg-transparent"
                      dangerouslySetInnerHTML={{
                        __html: pages[viewPageIndex]?.content?.trim()
                          ? pages[viewPageIndex].content
                          : '<span class="text-gray-400">(ไม่มีข้อความ)</span>',
                      }}
                    />
                  </div>
                </div>
                {pages.length > 1 && (
                  <div className="flex items-center justify-between gap-2 px-6 py-3 border-t bg-muted/20 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewPageIndex((i) => Math.max(0, i - 1))}
                      disabled={viewPageIndex === 0}
                      className="px-3 py-1.5 rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                      ← ก่อนหน้า
                    </button>
                    <span className="text-sm text-muted-foreground">
                      หน้า {viewPageIndex + 1} / {pages.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewPageIndex((i) => Math.min(pages.length - 1, i + 1))}
                      disabled={viewPageIndex === pages.length - 1}
                      className="px-3 py-1.5 rounded-md border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                      ถัดไป →
                    </button>
                  </div>
                )}
              </DialogBody>
            </DialogContent>
          </Dialog>,
          document.body
        )}
    </div>
  )
}
