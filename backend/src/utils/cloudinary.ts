import { v2 as cloudinary } from "cloudinary";

// Validate configuration on startup
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Cloudinary configuration is missing");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format?: string;
  original_filename?: string;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File
): Promise<CloudinaryUploadResult> => {
  try {
    if (!file.buffer || file.buffer.length === 0) {
      console.error("No file buffer found");
      throw new Error("File buffer is empty or corrupted");
    }

    const isPdf = file.mimetype === "application/pdf";
    const resourceType = isPdf ? "raw" : "image";

    const uploadOptions: any = {
      resource_type: resourceType,
      folder: "technician-documents",
      access_mode: "public",
    };

    // Different handling for images vs PDFs
    if (isPdf) {
      // For PDFs
      uploadOptions.filename_override = file.originalname;
      uploadOptions.use_filename = true;
    } else {
      // For images
      uploadOptions.upload_preset = "image_preset";
      uploadOptions.use_filename = true;
      uploadOptions.unique_filename = true;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else if (!result) {
            reject(new Error("Cloudinary returned empty result"));
          } else {
            resolve(result as CloudinaryUploadResult);
          }
        }
      );

      uploadStream.on("error", (error) => {
        console.error("Upload stream error:", error);
        reject(error);
      });

      uploadStream.end(file.buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};
