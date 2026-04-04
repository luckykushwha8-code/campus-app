import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

export function isMediaStorageConfigured() {
  return isConfigured;
}

export async function uploadImageToCloudinary(fileBuffer: Buffer, folder: string) {
  if (!isConfigured) {
    throw new Error("MEDIA_STORAGE_NOT_CONFIGURED");
  }

  const dataUri = `data:image/jpeg;base64,${fileBuffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    overwrite: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}
