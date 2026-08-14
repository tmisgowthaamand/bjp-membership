import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'n9fgemea',
  api_key: process.env.CLOUDINARY_API_KEY || '587186263567254',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'p6auY1cSEsSPjVE56Ii19gBzQ_k',
})

const storage = multer.memoryStorage()
export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for candidate pitch videos
})


function uploadToCloudinary(fileBuffer, resourceType = 'auto', folder = 'BJP_Local_Body_Candidates') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    stream.end(fileBuffer)
  })
}

export async function postUploadMedia(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' })
    }
    const mobile = req.body?.mobile || 'general'
    const folder = `BJP_Local_Body_Candidates/${mobile}`
    const result = await uploadToCloudinary(req.file.buffer, 'auto', folder)

    return res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      message: 'File uploaded successfully.',
    })
  } catch (e) {
    console.error('[Upload Error]', e)
    return res.status(500).json({ success: false, message: e?.message || 'Failed to upload photo.' })
  }
}
