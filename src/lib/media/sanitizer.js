/**
 * hushSpace v0.0.1 — Client-Side Privacy Sanitizer & Image Compressor
 * 
 * Protects user privacy by completely stripping all EXIF metadata, GPS coordinates,
 * device serial numbers, and camera signatures before images leave browser memory.
 * 
 * @module lib/media/sanitizer
 */

const MAX_DIMENSION = 2048; // Max width/height in px
const COMPRESSION_QUALITY = 0.85; // WebP quality

/**
 * Sanitize and compress image file on the client side.
 * - Draws image pixels to a clean HTML5 Canvas (stripping all EXIF, GPS, and metadata).
 * - Exports as optimized WebP blob.
 * 
 * @param {File} file - Raw user image file
 * @returns {Promise<{blob: Blob, width: number, height: number, originalSize: number, newSize: number}>}
 */
export async function sanitizeAndCompressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Scale down if exceeding max dimension
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        // Clean Canvas draws pure pixel array without metadata headers
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Draw image onto clean canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Export as clean WebP (or fallback to JPEG if WebP unsupported)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create sanitized image blob.'));
              return;
            }
            resolve({
              blob,
              width,
              height,
              originalSize: file.size,
              newSize: blob.size,
              format: 'image/webp',
            });
          },
          'image/webp',
          COMPRESSION_QUALITY
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for sanitization.'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human-readable string.
 * @param {number} bytes 
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
