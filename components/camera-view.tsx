"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ZoomIn, ZoomOut, Grid3x3, Minus, Circle, SwitchCamera, AlertCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface SavedImage {
  id: string
  dataUrl: string
  timestamp: number
}

interface CameraDevice {
  deviceId: string
  label: string
}

export default function CameraView() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [showGrid, setShowGrid] = useState(false)
  const [showHorizon, setShowHorizon] = useState(false)
  const [lastImage, setLastImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameras, setCameras] = useState<CameraDevice[]>([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)

  useEffect(() => {
    enumerateCameras()
    loadLastImage()
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (cameras.length > 0) {
      startCamera()
    }
  }, [currentCameraIndex, cameras])

  const enumerateCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices
        .filter((device) => device.kind === "videoinput")
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `カメラ ${index + 1}`,
        }))
      setCameras(videoDevices)
    } catch (err) {
      console.error("カメラデバイスの列挙エラー:", err)
    }
  }

  const loadLastImage = () => {
    const savedImages = localStorage.getItem("camera-images")
    if (savedImages) {
      const images: SavedImage[] = JSON.parse(savedImages)
      if (images.length > 0) {
        setLastImage(images[images.length - 1].dataUrl)
      }
    }
  }

  const startCamera = async () => {
    try {
      setError(null)
      stopCamera()

      const constraints: MediaStreamConstraints = {
        video:
          cameras.length > 0 && cameras[currentCameraIndex]
            ? {
                deviceId: cameras[currentCameraIndex].deviceId,
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              }
            : {
                facingMode: "user",
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (err: any) {
      let errorMessage = "カメラへのアクセスが拒否されました"
      
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
    }
  }

  const switchCamera = () => {
    if (cameras.length > 1) {
      setCurrentCameraIndex((prev) => (prev + 1) % cameras.length)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && !isCapturing) {
      setIsCapturing(true)
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        // ズームを適用して描画
        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.scale(zoom, zoom)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        ctx.restore()

        const imageData = canvas.toDataURL("image/png")

        // ローカルストレージに保存
        const savedImages = localStorage.getItem("camera-images")
        const images: SavedImage[] = savedImages ? JSON.parse(savedImages) : []
        const newImage: SavedImage = {
          id: Date.now().toString(),
          dataUrl: imageData,
          timestamp: Date.now(),
        }
        images.push(newImage)
        localStorage.setItem("camera-images", JSON.stringify(images))

        setLastImage(imageData)

        // シャッターエフェクト
        setTimeout(() => {
          setIsCapturing(false)
        }, 200)
      }
    }
  }

  const adjustZoom = (delta: number) => {
    setZoom((prev) => Math.max(1, Math.min(3, prev + delta)))
  }

  return (
    <div className="relative flex h-screen flex-col bg-black">
      {/* ヘッダー */}
      <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between p-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex gap-2">
          {cameras.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={switchCamera}
              className="text-white hover:bg-white/10"
              title={`現在: ${cameras[currentCameraIndex]?.label || "カメラ"}`}
            >
              <SwitchCamera className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGrid(!showGrid)}
            className={`text-white hover:bg-white/10 ${showGrid ? "bg-white/20" : ""}`}
          >
            <Grid3x3 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHorizon(!showHorizon)}
            className={`text-white hover:bg-white/10 ${showHorizon ? "bg-white/20" : ""}`}
          >
            <Minus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* カメラビュー */}
      <div className="relative flex-1">
        {error ? (
          <div className="flex h-full items-center justify-center p-8">
            <div className="max-w-md text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">カメラにアクセスできません</h2>
              <p className="text-white/70 mb-6">{error}</p>
              <Button
                onClick={startCamera}
                className="bg-white text-black hover:bg-white/90"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                再試行
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: `scale(${zoom})` }}
            />

            {/* グリッド線 */}
            {showGrid && (
              <div className="pointer-events-none absolute inset-0">
                <svg className="h-full w-full">
                  <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="white" strokeWidth="1" opacity="0.3" />
                  <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="white" strokeWidth="1" opacity="0.3" />
                  <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="white" strokeWidth="1" opacity="0.3" />
                  <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="white" strokeWidth="1" opacity="0.3" />
                </svg>
              </div>
            )}

            {/* 水平線 */}
            {showHorizon && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-px w-full bg-white/30" />
                <div className="absolute h-full w-px bg-white/30" />
              </div>
            )}

            {/* シャッターエフェクト */}
            {isCapturing && <div className="absolute inset-0 bg-white" />}
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* コントロール */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black/80 to-transparent p-6">
        <div className="flex items-center justify-between">
          {/* サムネイル */}
          <Link href="/preview-list" className="h-14 w-14">
            {lastImage ? (
              <img
                src={lastImage || "/placeholder.svg"}
                alt="最後の写真"
                className="h-full w-full rounded-lg border-2 border-white/30 object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-lg border-2 border-white/30 bg-white/10" />
            )}
          </Link>

          {/* シャッターボタン */}
          <Button
            onClick={capturePhoto}
            disabled={isCapturing}
            size="icon"
            className="h-20 w-20 rounded-full border-4 border-white bg-white/20 hover:bg-white/30"
          >
            <Circle className="h-16 w-16 fill-white text-white" />
          </Button>

          {/* ズームコントロール */}
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => adjustZoom(0.5)}
              disabled={zoom >= 3}
              className="text-white hover:bg-white/10"
            >
              <ZoomIn className="h-6 w-6" />
            </Button>
            <div className="text-center text-sm font-medium text-white">{zoom.toFixed(1)}x</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => adjustZoom(-0.5)}
              disabled={zoom <= 1}
              className="text-white hover:bg-white/10"
            >
              <ZoomOut className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
