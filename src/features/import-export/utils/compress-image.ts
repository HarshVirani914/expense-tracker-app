const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.8

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`Failed to load image: ${file.name}`))
    }

    img.src = url
  })

export const compressImage = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) {
    return file
  }

  const img = await loadImage(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const width = Math.round(img.width * scale)
  const height = Math.round(img.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return file
  }

  ctx.drawImage(img, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
  })

  if (!blob) {
    return file
  }

  const baseName = file.name.replace(/\.[^.]+$/, '')
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
}

export const compressImages = async (files: File[]): Promise<File[]> =>
  Promise.all(files.map((file) => compressImage(file)))
