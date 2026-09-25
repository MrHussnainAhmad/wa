import { v2 as cloudinary } from "cloudinary";

const configured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function isCloudinaryConfigured() {
  return configured;
}

export function optimizedImageUrl(
  url: string,
  opts?: { width?: number; height?: number; quality?: string }
) {
  if (!url) return url;
  if (!url.includes("res.cloudinary.com")) return url;

  const width = opts?.width ?? 800;
  const quality = opts?.quality ?? "auto:eco";
  return url.replace(
    "/upload/",
    `/upload/f_auto,q_${quality},w_${width},c_limit/`
  );
}

export async function uploadImage(buffer: Buffer, folder = "waqasadvertisers/boards") {
  if (!configured) {
    const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
    return {
      url: base64,
      publicId: `local-${Date.now()}`,
    };
  }

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [
              { quality: "auto:good", fetch_format: "auto" },
              { width: 1600, crop: "limit" },
            ],
          },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              reject(error ?? new Error("Upload failed"));
              return;
            }
            resolve({
              secure_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
            });
          }
        )
        .end(buffer);
    }
  );

  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadFile(buffer: Buffer, folder = "waqasadvertisers/contracts") {
  if (!configured) {
    return {
      url: `data:application/octet-stream;base64,${buffer.toString("base64")}`,
      publicId: `local-file-${Date.now()}`,
    };
  }

  const result = await new Promise<{ secure_url: string; public_id: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder, resource_type: "auto" },
          (error, uploadResult) => {
            if (error || !uploadResult) {
              reject(error ?? new Error("Upload failed"));
              return;
            }
            resolve({
              secure_url: uploadResult.secure_url,
              public_id: uploadResult.public_id,
            });
          }
        )
        .end(buffer);
    }
  );

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteCloudinaryAsset(publicId: string) {
  if (!configured || !publicId || publicId.startsWith("local")) return;
  await cloudinary.uploader.destroy(publicId);
}
