// src/core/utils/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// src/core/utils/cloudinary.ts
export const uploadToCloudinary = async (file: any): Promise<any> => {
  try {
    console.log("☁️ Starting Cloudinary upload...");
    console.log("📁 File details:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    // Determine resource type based on file type
    const isPdf = file.mimetype === 'application/pdf';
    const resourceType = isPdf ? 'raw' : 'image';
    
    // Extract file extension from original name
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    console.log(`📄 Resource type: ${resourceType} (PDF: ${isPdf}), Extension: ${fileExtension}`);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'technician-documents',
          upload_preset: 'image_preset',
          access_mode: 'public',
          // ADD THIS: Preserve the original filename with extension
          use_filename: true,
          unique_filename: true,
          // For raw files, explicitly set the format to preserve extension
          ...(isPdf && { format: fileExtension }), // This tells Cloudinary to keep the PDF extension
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful:', {
              url: result?.secure_url,
              resource_type: result?.resource_type,
              format: result?.format
            });
            resolve(result);
          }
        }
      );

      uploadStream.end(file.buffer);
    });

  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw error;
  }
};