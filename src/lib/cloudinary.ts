// Cloudinary URL builder for SnapQuiz images
// Folder convention: snap-lens/<difficulty>/<category>/<filename>
// e.g.  snap-lens/easy/landmarks/eiffel-tower
//       snap-lens/medium/flags/japan
//       snap-lens/extreme/celebrities/einstein

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "your_cloud_name";

/**
 * Build a Cloudinary delivery URL.
 * publicId should be the full path WITHOUT leading slash,
 * e.g. "snap-lens/easy/landmarks/eiffel-tower"
 */
export function cld(publicId: string, width = 1280): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}

/**
 * Helper: build a snap-lens path from parts.
 * cldSnap("easy", "landmarks", "eiffel-tower")
 * → "snap-lens/easy/landmarks/eiffel-tower"
 */
export function cldSnap(
  difficulty: "easy" | "medium" | "extreme",
  category: string,
  filename: string,
): string {
  return cld(`snap-lens/${difficulty}/${category}/${filename}`);
}
