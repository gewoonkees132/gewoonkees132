
const IMAGE_SIZES = [240, 320, 480, 768, 1024, 1440, 1920];

/**
 * Generates a srcset attribute for a given image source.
 * @param {string} src - The base image src.
 * @returns {string} The srcset string.
 */
export const generateSrcset = (src) => {
    if (!src) return '';
    const parts = src.split('.');
    const extension = parts.pop();
    const base = parts.join('.');
    
    return IMAGE_SIZES.map(size => `${base}-${size}w.${extension} ${size}w`).join(', ');
};

/**
 * Defines the sizes for the main gallery images.
 */
export const galleryImageSizes = '(min-width: 1024px) 60vw, 100vw';
