import { useNavigate } from 'react-router-dom'
import { Box, PenTool, List, LayoutGrid, Puzzle, FlaskConical } from 'lucide-react'

const menuItems = [
  {
    id: 'intro',
    title: 'Intro',
    description: 'เปิดดูโมเดล 3D พร้อมเครื่องมือจัดการต่างๆ',
    icon: Box,
    path: '/viewer',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'annotation-tool',
    title: 'Annotation Tool',
    description: 'เครื่องมือใส่คำอธิบายประกอบบนโมเดล 3D',
    icon: PenTool,
    path: '/annotation-tool',
    color: 'from-purple-500 to-pink-400',
  },
  {
    id: 'table-content',
    title: 'Table Content',
    description: 'จัดการสารบัญและลำดับเนื้อหาของโมเดล 3D',
    icon: List,
    path: '/table-content',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'layout',
    title: 'Layout',
    description: 'จัดวางและออกแบบเลย์เอาต์หน้าแสดงผล',
    icon: LayoutGrid,
    path: '/layout',
    color: 'from-orange-500 to-amber-400',
  },
  {
    id: 'assembly',
    title: 'Assembly',
    description: 'ประกอบชิ้นส่วนโมเดลทีละขั้นตอน',
    icon: Puzzle,
    path: null,
    color: 'from-rose-500 to-red-400',
  },
  {
    id: 'lab',
    title: 'Lab',
    description: 'ทดลองฟีเจอร์ใหม่และเครื่องมือทดสอบ',
    icon: FlaskConical,
    path: null,
    color: 'from-indigo-500 to-violet-400',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            3D Platform
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            เลือกเมนูเพื่อเริ่มต้นใช้งาน
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isAvailable = item.path !== null

            return (
              <button
                key={item.id}
                onClick={() => isAvailable && navigate(item.path!)}
                disabled={!isAvailable}
                className={`group relative overflow-hidden rounded-xl border border-border bg-card p-6 text-left transition-all duration-200 ${
                  isAvailable
                    ? 'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div
                  className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-br ${item.color} p-3 mb-4 shadow-sm`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h2 className="text-lg font-semibold text-foreground mb-1">
                  {item.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>

                {!isAvailable && (
                  <span className="absolute top-4 right-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
