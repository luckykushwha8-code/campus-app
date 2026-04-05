export type ProfileMediaTarget = "avatar" | "cover";

type ProcessOptions = {
  target: ProfileMediaTarget;
  maxBytes?: number;
};

function readImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("IMAGE_LOAD_FAILED"));
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("IMAGE_PROCESS_FAILED"));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}

export async function processProfileImage(file: File, options: ProcessOptions) {
  const image = await readImage(file);
  const aspect = options.target === "cover" ? 3 : 1;
  const outputWidth = options.target === "cover" ? 1500 : 720;
  const outputHeight = Math.round(outputWidth / aspect);

  const sourceAspect = image.width / image.height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceAspect > aspect) {
    sourceWidth = Math.round(image.height * aspect);
    sourceX = Math.round((image.width - sourceWidth) / 2);
  } else {
    sourceHeight = Math.round(image.width / aspect);
    sourceY = Math.round((image.height - sourceHeight) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("IMAGE_PROCESS_FAILED");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);

  const blob = await canvasToBlob(canvas, "image/jpeg", 0.86);
  const maxBytes = options.maxBytes ?? 2 * 1024 * 1024;
  const finalBlob =
    blob.size <= maxBytes ? blob : await canvasToBlob(canvas, "image/jpeg", 0.72);

  const processedFile = new File([finalBlob], `${options.target}-${Date.now()}.jpg`, {
    type: "image/jpeg",
  });

  return {
    file: processedFile,
    previewUrl: URL.createObjectURL(finalBlob),
    width: outputWidth,
    height: outputHeight,
  };
}
