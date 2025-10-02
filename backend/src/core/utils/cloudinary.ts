import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Function to configure Cloudinary
const configureCloudinary = () => {
  const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  console.log('🔑 Cloudinary Config Check:', {
    cloud_name: cloudinaryConfig.cloud_name,
    api_key: cloudinaryConfig.api_key ? '***' + cloudinaryConfig.api_key.slice(-4) : 'MISSING',
    api_secret: cloudinaryConfig.api_secret ? '***' + cloudinaryConfig.api_secret.slice(-4) : 'MISSING'
  });

  // Validate configuration
  if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
    console.error('❌ Cloudinary configuration incomplete. Please check your .env file');
    return false;
  } else {
    cloudinary.config(cloudinaryConfig);
    console.log('✅ Cloudinary configured successfully');
    return true;
  }
};

const isCloudinaryConfigured = configureCloudinary();

export const uploadToCloudinary = (file: Express.Multer.File): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured) {
      const error = new Error('Cloudinary is not properly configured. Check your environment variables.');
      console.error('❌ Cloudinary configuration error');
      reject(error);
      return;
    }

    console.log('☁️ Starting Cloudinary upload for file:', file.originalname);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: 'technician-applications',
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload failed:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload successful:', result?.secure_url);
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};