"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, Download, RotateCcw, X, AlertCircle, RefreshCw } from "lucide-react"

export default function CameraApp() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsCameraActive(true)
      }
    } catch (err: any) {
      let errorMessage = "カメラへのアクセスが拒否されました。ブラウザの設定を確認してください。"
      
      if (err.name === "NotAllowedError") {
        errorMessage = "カメラへのアクセスが拒否されました。ブラウザの設定でカメラの許可を確認してください。"
      } else if (err.name === "NotFoundError") {
        errorMessage = "カメラが見つかりませんでした。カメラが接続されているか確認してください。"
      } else if (err.name === "NotReadableError") {
        errorMessage = "カメラが使用中です。他のアプリケーションがカメラを使用していないか確認してください。"
      }
      
      setError(errorMessage)
      console.error("カメラエラー:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL("image/png")
        setCapturedImage(imageData)
      }
    }
  }

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement("a")
      link.href = capturedImage
      link.download = `photo-${Date.now()}.png`
      link.click()
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 md:p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">WebCamera</h1>
        <p className="mt-2 text-lg text-muted-foreground">ブラウザで簡単に写真撮影</p>
      </div>

      <Card className="w-full max-w-4xl overflow-hidden bg-card">
        <div className="relative aspect-video w-full bg-muted">
          {!isCameraActive && !capturedImage && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Camera className="mx-auto h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">カメラを起動してください</p>
              </div>
            </div>
          )}

          {isCameraActive && !capturedImage && (
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          )}

          {capturedImage && (
            <img src={capturedImage || "/placeholder.svg"} alt="撮影した写真" className="h-full w-full object-cover" />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex flex-col gap-4 p-6">
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive mb-2">{error}</p>
                  <Button 
                    onClick={startCamera} 
                    variant="outline" 
                    size="sm"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    再試行
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!isCameraActive && !capturedImage && (
              <Button onClick={startCamera} size="lg" className="gap-2">
                <Camera className="h-5 w-5" />
                カメラを起動
              </Button>
            )}

            {isCameraActive && !capturedImage && (
              <>
                <Button onClick={capturePhoto} size="lg" className="gap-2">
                  <Camera className="h-5 w-5" />
                  撮影する
                </Button>
                <Button onClick={stopCamera} variant="outline" size="lg" className="gap-2 bg-transparent">
                  <X className="h-5 w-5" />
                  停止
                </Button>
              </>
            )}

            {capturedImage && (
              <>
                <Button onClick={downloadImage} size="lg" className="gap-2">
                  <Download className="h-5 w-5" />
                  ダウンロード
                </Button>
                <Button onClick={retakePhoto} variant="outline" size="lg" className="gap-2 bg-transparent">
                  <RotateCcw className="h-5 w-5" />
                  撮り直す
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>このアプリはブラウザのカメラAPIを使用しています</p>
        <p className="mt-1">撮影した写真はデバイスに保存されます</p>
      </div>
    </div>
  )
}
