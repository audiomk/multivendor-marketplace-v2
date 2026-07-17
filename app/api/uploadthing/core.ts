import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { UploadThingError } from 'uploadthing/server'
import { auth } from '@/auth'

const f = createUploadthing()

export const ourFileRouter = {
  // Product images
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 10 } })
    .middleware(async () => {
      const session = await auth()
      if (!session) throw new UploadThingError('Unauthorized')
      return { userId: session?.user?.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId }
    }),

  // ID documents (front/back) and selfie — images only
  idDocumentUploader: f({ image: { maxFileSize: '8MB', maxFileCount: 2 } })
    .middleware(async () => {
      const session = await auth()
      if (!session) throw new UploadThingError('Unauthorized')
      return { userId: session?.user?.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId }
    }),

  // Tax clearance — PDF or image
  taxDocumentUploader: f({
    image: { maxFileSize: '8MB' },
    pdf:   { maxFileSize: '8MB' },
  })
    .middleware(async () => {
      const session = await auth()
      if (!session) throw new UploadThingError('Unauthorized')
      return { userId: session?.user?.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId }
    }),

  // Selfie photo
  selfieUploader: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()
      if (!session) throw new UploadThingError('Unauthorized')
      return { userId: session?.user?.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId }
    }),

} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter