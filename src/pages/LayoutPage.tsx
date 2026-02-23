import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function LayoutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-foreground mb-2">Layout</h1>
      <p className="text-muted-foreground mb-8">หน้านี้ยังว่างอยู่ — พร้อมสำหรับเพิ่มเนื้อหา</p>
      <Button variant="outline" onClick={() => navigate('/')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>
    </div>
  )
}
