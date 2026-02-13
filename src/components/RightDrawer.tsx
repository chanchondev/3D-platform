import { useState } from 'react'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function RightDrawer() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 rounded-r-none rounded-l-lg"
        variant="secondary"
        size="icon"
      >
        {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full bg-card border-l border-border shadow-lg transition-transform duration-300 z-40 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '370px', maxHeight: '100vh' }}
      >
        <div className="p-4">
          {/* Empty drawer content */}
        </div>
      </div>
    </>
  )
}
