/**
 * Utility to parse external links (Google Drive, YouTube, Vimeo, Dropbox, etc.)
 * and automatically extract file metadata, provider type, and high-resolution thumbnail URLs.
 */

/**
 * Extracts YouTube video ID and returns public HQ thumbnail URL
 * @param {string} url 
 * @returns {{ isMatch: boolean, provider?: string, videoId?: string, thumbnailUrl?: string }}
 */
function parseYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return { isMatch: false };

  // Matches youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);

  if (match && match[1]) {
    const videoId = match[1];
    return {
      isMatch: true,
      provider: 'youtube',
      videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  return { isMatch: false };
}

/**
 * Extracts Vimeo video ID and generates preview thumbnail
 * @param {string} url 
 * @returns {{ isMatch: boolean, provider?: string, videoId?: string }}
 */
function parseVimeoUrl(url) {
  if (!url || typeof url !== 'string') return { isMatch: false };

  const regExp = /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+))/i;
  const match = url.match(regExp);

  if (match && match[3]) {
    const videoId = match[3];
    return {
      isMatch: true,
      provider: 'vimeo',
      videoId,
      thumbnailUrl: `https://vumbnail.com/${videoId}.jpg`,
    };
  }

  return { isMatch: false };
}

/**
 * Extracts Google Drive file ID and returns public thumbnail preview endpoint
 * @param {string} url 
 * @returns {{ isMatch: boolean, provider?: string, fileId?: string, thumbnailUrl?: string }}
 */
function parseGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return { isMatch: false };

  // Matches drive.google.com/file/d/FILE_ID/..., drive.google.com/open?id=FILE_ID, drive.google.com/uc?id=FILE_ID
  const regExp = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]{25,})/i;
  const match = url.match(regExp);

  if (match && match[1]) {
    const fileId = match[1];
    return {
      isMatch: true,
      provider: 'gdrive',
      fileId,
      // Google's public thumbnail service (w800 width, high quality)
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
    };
  }

  return { isMatch: false };
}

/**
 * Detects Dropbox links and transforms them for direct preview/streaming
 * @param {string} url 
 * @returns {{ isMatch: boolean, provider?: string, previewUrl?: string }}
 */
function parseDropboxUrl(url) {
  if (!url || typeof url !== 'string') return { isMatch: false };

  const isDropbox = /(?:dropbox\.com\/)/i.test(url);
  if (isDropbox) {
    // If dl=0, replace with raw=1 so it can stream or view directly
    const directUrl = url.replace(/[?&]dl=0/i, '').concat(url.includes('?') ? '&raw=1' : '?raw=1');
    return {
      isMatch: true,
      provider: 'dropbox',
      directUrl,
    };
  }

  return { isMatch: false };
}

/**
 * Main parsing function that inspects any given URL and returns metadata
 * @param {string} url 
 * @returns {{ provider: string, thumbnailUrl: string|null, directUrl: string|null, isExternal: boolean }}
 */
function parseMediaLink(url) {
  if (!url || typeof url !== 'string') {
    return {
      provider: 'other',
      thumbnailUrl: null,
      directUrl: null,
      isExternal: false,
    };
  }

  const cleanUrl = url.trim();

  // 1. Check YouTube
  const yt = parseYouTubeUrl(cleanUrl);
  if (yt.isMatch) {
    return {
      provider: 'youtube',
      thumbnailUrl: yt.thumbnailUrl,
      directUrl: cleanUrl,
      isExternal: true,
    };
  }

  // 2. Check Vimeo
  const vimeo = parseVimeoUrl(cleanUrl);
  if (vimeo.isMatch) {
    return {
      provider: 'vimeo',
      thumbnailUrl: vimeo.thumbnailUrl,
      directUrl: cleanUrl,
      isExternal: true,
    };
  }

  // 3. Check Google Drive
  const gdrive = parseGoogleDriveUrl(cleanUrl);
  if (gdrive.isMatch) {
    return {
      provider: 'gdrive',
      thumbnailUrl: gdrive.thumbnailUrl,
      directUrl: cleanUrl,
      isExternal: true,
    };
  }

  // 4. Check Dropbox
  const dropbox = parseDropboxUrl(cleanUrl);
  if (dropbox.isMatch) {
    return {
      provider: 'dropbox',
      thumbnailUrl: null,
      directUrl: dropbox.directUrl,
      isExternal: true,
    };
  }

  // 5. Check WeTransfer
  if (/wetransfer\.com/i.test(cleanUrl)) {
    return {
      provider: 'wetransfer',
      thumbnailUrl: null,
      directUrl: cleanUrl,
      isExternal: true,
    };
  }

  // Generic external link
  const isHttp = /^https?:\/\//i.test(cleanUrl);
  return {
    provider: isHttp ? 'other' : 'imagekit',
    thumbnailUrl: null,
    directUrl: isHttp ? cleanUrl : null,
    isExternal: isHttp,
  };
}

module.exports = {
  parseMediaLink,
  parseYouTubeUrl,
  parseGoogleDriveUrl,
  parseVimeoUrl,
  parseDropboxUrl,
};
