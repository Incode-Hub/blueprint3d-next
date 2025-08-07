import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <Home className="h-16 w-16 text-blue-400 mx-auto" />
          <h1 className="text-5xl font-bold text-white">Blueprint3D</h1>
          <p className="text-xl text-gray-300 max-w-md mx-auto">
            Design your dream room in stunning 3D with our modern room designer
          </p>
        </div>
        
        <Link href="/blueprint3d">
          <Button size="lg" className="text-lg px-8 py-4">
            Start Designing
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}