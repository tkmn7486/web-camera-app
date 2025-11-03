import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Camera, Images } from "lucide-react"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-black p-4 md:p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white md:text-6xl">WebCamera</h1>
        <p className="mt-4 text-lg text-white/70">プロフェッショナルな撮影体験</p>
      </div>

      <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
        <Link href="/camera" className="group">
          <Card className="flex h-48 flex-col items-center justify-center gap-4 border-white/10 bg-white/5 transition-all hover:border-white/30 hover:bg-white/10">
            <Camera className="h-16 w-16 text-white transition-transform group-hover:scale-110" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">撮影する</h2>
              <p className="mt-1 text-sm text-white/60">カメラを起動して撮影</p>
            </div>
          </Card>
        </Link>

        <Link href="/preview-list" className="group">
          <Card className="flex h-48 flex-col items-center justify-center gap-4 border-white/10 bg-white/5 transition-all hover:border-white/30 hover:bg-white/10">
            <Images className="h-16 w-16 text-white transition-transform group-hover:scale-110" />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">ギャラリー</h2>
              <p className="mt-1 text-sm text-white/60">撮影した写真を確認</p>
            </div>
          </Card>
        </Link>
      </div>

      <div className="text-center text-sm text-white/50">
        <p>ブラウザベースのプロフェッショナルカメラアプリ「WebCamera」</p>
      </div>
    </main>
  )
}
