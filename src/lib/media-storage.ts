import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

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

export async function uploadImageToCloudinary(fileBuffer: Buffer, folder: string, mimeType: string) {
  if (!isConfigured) {
    throw new Error("MEDIA_STORAGE_NOT_CONFIGURED");
  }

  const safeMimeType = mimeType?.trim() || "image/jpeg";
  const dataUri = `data:${safeMimeType};base64,${fileBuffer.toString("base64")}`;

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

export async function deleteMediaFromCloudinary(publicId?: string | null) {
  if (!isConfigured || !publicId?.trim()) {
    return false;
  }

  const result = await cloudinary.uploader.destroy(publicId.trim(), {
    resource_type: "image",
    invalidate: true,
  });

  return result.result === "ok" || result.result === "not found";
}

export async function uploadDocumentToCloudinary(fileBuffer: Buffer, folder: string, fileName: string, mimeType: string) {
  if (!isConfigured) {
    throw new Error("MEDIA_STORAGE_NOT_CONFIGURED");
  }

  const dataUri = `data:${mimeType.trim()};base64,${fileBuffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "raw",
    public_id: fileName.replace(/\.[^.]+$/, ""),
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    format: result.format,
  };
}
