"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download, Trash2, X, Eye } from "lucide-react"
import { getAllImages, deleteImage as deleteImageFromDB, initDB } from "@/lib/indexeddb"

interface SavedImage {
  id: string
  dataUrl: string
  timestamp: number
}

export default function PreviewListPage() {
  const [images, setImages] = useState<SavedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<SavedImage | null>(null)

  useEffect(() => {
    // IndexedDBから保存された画像を読み込む
    const loadImages = async () => {
      try {
        await initDB()
        const loadedImages = await getAllImages()
        // タイムスタンプでソート（新しい順）
        const sortedImages = loadedImages.sort((a, b) => b.timestamp - a.timestamp)
        setImages(sortedImages)
      } catch (err) {
        console.error("画像の読み込みに失敗しました:", err)
      }
    }
    loadImages()
  }, [])

  const downloadImage = (image: SavedImage) => {
    const link = document.createElement("a")
    link.href = image.dataUrl
    link.download = `photo-${image.timestamp}.png`
    link.click()
  }

  const deleteImage = async (id: string) => {
    try {
      await deleteImageFromDB(id)
      const updatedImages = images.filter((img) => img.id !== id)
      setImages(updatedImages)
      // プレビュー中の画像を削除した場合は閉じる
      if (selectedImage?.id === id) {
        setSelectedImage(null)
      }
    } catch (err) {
      console.error("画像の削除に失敗しました:", err)
    }
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">ギャラリー</h1>
              <p className="mt-1 text-sm text-white/60">{images.length}枚の写真</p>
            </div>
          </div>
        </div>

        {images.length === 0 ? (
          <Card className="flex h-96 items-center justify-center border-white/10 bg-white/5">
            <div className="text-center">
              <p className="text-lg text-white/70">まだ写真がありません</p>
              <Link href="/camera">
                <Button className="mt-4 bg-white text-black hover:bg-white/90">撮影を開始</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.map((image) => (
              <Card key={image.id} className="group overflow-hidden border-white/10 bg-white/5">
                <div className="relative aspect-square">
                  <img
                    src={image.dataUrl || "/placeholder.svg"}
                    alt={`撮影日時: ${new Date(image.timestamp).toLocaleString("ja-JP")}`}
                    className="h-full w-full object-cover cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      setSelectedImage(image)
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImage(image)
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <Eye className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadImage(image)
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <Download className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteImage(image.id)
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-white/60">
                    {new Date(image.timestamp).toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* プレビューモーダル */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-h-full max-w-4xl">
            <img
              src={selectedImage.dataUrl}
              alt={`撮影日時: ${new Date(selectedImage.timestamp).toLocaleString("ja-JP")}`}
              className="max-h-[90vh] w-full object-contain"
            />
            
            {/* 閉じるボタン */}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSelectedImage(null)}
              className="absolute right-2 top-2 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* 操作ボタン */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  downloadImage(selectedImage)
                }}
                variant="ghost"
                className="bg-black/50 text-white hover:bg-black/70"
              >
                <Download className="mr-2 h-5 w-5" />
                ダウンロード
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteImage(selectedImage.id)
                }}
                variant="ghost"
                className="bg-black/50 text-white hover:bg-black/70"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                削除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
