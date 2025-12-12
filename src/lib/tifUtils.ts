import UTIF from 'utif';

export async function convertTifToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const ifds = UTIF.decode(arrayBuffer);
  
  if (ifds.length === 0) {
    throw new Error('No images found in TIF file');
  }
  
  UTIF.decodeImage(arrayBuffer, ifds[0]);
  const rgba = UTIF.toRGBA8(ifds[0]);
  
  const canvas = document.createElement('canvas');
  canvas.width = ifds[0].width;
  canvas.height = ifds[0].height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  const imageData = ctx.createImageData(canvas.width, canvas.height);
  imageData.data.set(rgba);
  ctx.putImageData(imageData, 0, 0);
  
  return canvas.toDataURL('image/png');
}

export function isTifFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return name.endsWith('.tif') || name.endsWith('.tiff');
}

export async function getImagePreviewUrl(file: File): Promise<string> {
  if (isTifFile(file)) {
    return await convertTifToDataUrl(file);
  }
  return URL.createObjectURL(file);
}
