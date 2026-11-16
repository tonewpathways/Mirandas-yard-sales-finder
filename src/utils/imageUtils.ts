/**
 * Resizes and compresses a user-uploaded image file on the client using an offscreen HTML5 Canvas.
 * This keeps uploaded photos lightweight for both Appwrite Storage uploads and localStorage fallbacks.
 *
 * @param file - The File selected by the user from an <input type="file">
 * @param maxWidth - Maximum pixel width of the output image (preserves aspect ratio)
 * @param quality - JPEG compression quality between 0 and 1
 * @returns A base64-encoded JPEG Data URL string
 */
export async function compressAndResizeImage(
  file: File,
  maxWidth = 960,
  quality = 0.78
): Promise<string> {
  // Block non-image files early with a friendly validation message
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG, PNG, or WebP).');
  }

  return new Promise((resolve, reject) => {
    // Step 1: Read the file into memory as a Data URL
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));

    reader.onload = () => {
      // Step 2: Load the Data URL into an Image element to read its natural dimensions
      const img = new Image();
      img.onerror = () => reject(new Error('The selected file is not a valid image.'));

      img.onload = () => {
        let targetWidth = img.width;
        let targetHeight = img.height;

        // Downscale proportionally if the image exceeds maxWidth
        if (targetWidth > maxWidth) {
          const ratio = maxWidth / targetWidth;
          targetWidth = maxWidth;
          targetHeight = Math.round(targetHeight * ratio);
        }

        // Step 3: Draw the resized image onto an offscreen canvas and export as compressed JPEG
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Unable to process image in this browser.'));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Converts a base64 Data URL (from Canvas compression) into a standard File object
 * so it can be uploaded directly to an Appwrite Storage bucket.
 */
export function dataUrlToFile(dataUrl: string, filename = 'yard-sale.jpg'): File {
  const [header, base64Data] = dataUrl.split(',');
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mimeType });
}
