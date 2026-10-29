/**
 * Parses Wix image URIs into direct static CDN URLs.
 * Example input:
 *   wix:image://v1/c5af70_5aac40c671924c4984869888ea17601d~mv2.png/energy%20gurus.PNG#originWidth=1408&originHeight=924
 * Output:
 *   https://static.wixstatic.com/media/c5af70_5aac40c671924c4984869888ea17601d~mv2.png
 */
export function resolveWixImageUrl(wixUrl: string | undefined | null): string {
  if (!wixUrl) return '/placeholder-project.webp';

  if (wixUrl.startsWith('http://') || wixUrl.startsWith('https://')) {
    return wixUrl;
  }

  if (wixUrl.startsWith('wix:image://v1/')) {
    const withoutPrefix = wixUrl.replace('wix:image://v1/', '');
    // The format is <media_id>/<filename>#... or just <media_id>#...
    const mediaId = withoutPrefix.split('/')[0].split('#')[0];
    if (mediaId) {
      return `https://static.wixstatic.com/media/${mediaId}`;
    }
  }

  return '/placeholder-project.webp';
}

/**
 * Creates a clean, URL-friendly slug from a project title
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}
