export interface ImageProcessingResult {
  url: string;
  originalUrl: string;
  backgroundRemoved: boolean;
  processingAvailable: boolean;
  status: "processed" | "original" | "unavailable";
  message?: string;
}

export interface ImageProcessingService {
  process(file: File, removeBackground: boolean): Promise<ImageProcessingResult>;
}

function objectUrl(file: File) {
  return URL.createObjectURL(file);
}

function originalResult(file: File, removeBackground: boolean): ImageProcessingResult {
  const url = objectUrl(file);
  if (!removeBackground) {
    return {
      url,
      originalUrl: url,
      backgroundRemoved: false,
      processingAvailable: false,
      status: "original",
    };
  }
  return {
    url,
    originalUrl: url,
    backgroundRemoved: false,
    processingAvailable: false,
    status: "unavailable",
    message:
      "Background removal is not connected. The original image is shown and no processed image will be saved.",
  };
}

export function createImageProcessingService(): ImageProcessingService {
  return {
    async process(file, removeBackground) {
      if (!removeBackground) return originalResult(file, false);
      const runtimeEnv = typeof window === "undefined" ? {} : ((window as Window & { __APP_ENV__?: Record<string, string | undefined> }).__APP_ENV__ ?? {});
      const endpoint = runtimeEnv.VITE_IMAGE_PROCESSING_URL as string | undefined;
      if (!endpoint) return originalResult(file, true);

      try {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("background", "#FFFFFF");
        const response = await fetch(endpoint, { method: "POST", body: formData });
        if (!response.ok) throw new Error("Image processing service returned an error");
        const payload = (await response.json()) as { url?: string; image?: string };
        const processedUrl = payload.url || payload.image;
        if (!processedUrl) throw new Error("Image processing service returned no image");
        const originalUrl = objectUrl(file);
        return {
          url: processedUrl,
          originalUrl,
          backgroundRemoved: true,
          processingAvailable: true,
          status: "processed",
        };
      } catch {
        return originalResult(file, true);
      }
    },
  };
}

export const imageProcessingService = createImageProcessingService();

export function revokeImageUrls(images: Array<{ url?: string; originalUrl?: string }>) {
  for (const image of images) {
    if (image.url?.startsWith("blob:")) URL.revokeObjectURL(image.url);
    if (image.originalUrl?.startsWith("blob:") && image.originalUrl !== image.url) {
      URL.revokeObjectURL(image.originalUrl);
    }
  }
}
