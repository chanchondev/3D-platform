/**
 * Types แยกไว้ในโฟลเดอร์ types เพื่อให้อ่านและนำกลับมาใช้ได้ง่าย
 */

export interface NodeTransform {
  visible: boolean
  positionX: number
  positionY: number
  positionZ: number
  rotationX: number
  rotationY: number
  rotationZ: number
  scale: number
}

/** หนึ่งหน้าใน Note: เนื้อหาเป็น HTML จาก rich editor (TinyMCE) */
export interface NotePage {
  content: string
}

export interface NoteAnnotation {
  id: string
  /** หัวข้อการ์ด (แก้ไขได้, ไม่ใส่ก็ได้) */
  title?: string
  positionX: number
  positionY: number
  positionZ: number
  /** @deprecated ใช้ pages แทน; เก็บไว้เพื่อ backward compatibility */
  text?: string
  /** เนื้อหาแบบหลายหน้า แต่ละหน้ามี HTML (รูป, ลิงก์, วิดีโอ ได้) */
  pages?: NotePage[]
  offsetY: number
  /** ความกว้างการ์ดบนจอ (px) — ปรับขนาดได้ */
  cardWidth?: number
  /** ความสูงการ์ดบนจอ (px) — ปรับขนาดได้ */
  cardHeight?: number
  /** ตำแหน่งการ์ดบนจอ (px) — ใช้คืนตำแหน่งเมื่อปิด/เปิด Note Annotations */
  cardPositionX?: number
  cardPositionY?: number
  createdAt: Date
  /** ถ้ามีค่า หมุดจะผูกกับกระดูกนี้และเคลื่อนตาม animation */
  attachedBoneName?: string
  /** ออฟเซ็ตจากกระดูก (local space) ใช้เมื่อ attachedBoneName มีค่า */
  attachedBoneOffset?: { x: number; y: number; z: number }
  /** สีหัวการ์ด/หมุด (hex เช่น #ef4444) — เปลี่ยนได้ใน modal แก้ไขโน้ต */
  color?: string
}

export interface TextAnnotation {
  id: string
  positionX: number
  positionY: number
  positionZ: number
  text: string
  fontSize: number
  color: string
  offsetY: number
  createdAt: Date
}

/** Trim range for a single animation item */
export interface TrimRange {
  sourceStartSec: number
  sourceEndSec: number
  trimInSec: number
  trimOutSec: number
}

/** Camera position + FOV snapshot */
export interface CameraState {
  x: number
  y: number
  z: number
  fov: number
}

/** Per-item camera override (opt-in) */
export interface CameraOverride {
  enabled: boolean
  camera: CameraState
}

/** Styling rule applied to non-selected nodes/materials */
export interface NonSelectedStyle {
  type: 'desaturate' | 'tint' | 'overrideColor'
  color: string
  intensity: number
}

/** Per-item highlight override (node/material emphasis) */
export interface HighlightOverride {
  enabled: boolean
  mode: 'node' | 'material' | 'both'
  selectedNodeIds: string[]
  selectedMaterialIds: string[]
  nonSelectedStyle: NonSelectedStyle
}

/** One animation entry inside a section's animation stack */
export interface AnimationItem {
  id: string
  animationClipName: string
  name?: string
  speed: number
  trim: TrimRange
  cameraOverride?: CameraOverride
  highlight?: HighlightOverride
}

/** Section สำหรับ Table of Contents */
export interface TocSection {
  id: string
  title: string
  /** @deprecated ใช้ animations[] แทน – kept for migration */
  animationName?: string
  /** @deprecated */
  animationSpeed?: number
  cameraX?: number
  cameraY?: number
  cameraZ?: number
  cameraFov?: number
  /** รายชื่อ node ที่จะ highlight เมื่อเข้า section นี้ */
  highlightNodes?: string[]
  /** Animation stack – เล่น sequential top→bottom */
  animations?: AnimationItem[]
}

/** รายการ Part Names: เลือก node จากโมเดล แล้วตั้งชื่อ (เช่น Head, Leg) */
export interface PartListItem {
  id: string
  nodeName: string
  label: string
}

