import JSZip from 'jszip';
import { VirtualFile } from '../types/hotspot';

export function getMimeType(filename: string): { mimeType: string; isBinary: boolean } {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (ext) {
    case 'html':
    case 'htm':
      return { mimeType: 'text/html', isBinary: false };
    case 'css':
      return { mimeType: 'text/css', isBinary: false };
    case 'js':
      return { mimeType: 'application/javascript', isBinary: false };
    case 'json':
      return { mimeType: 'application/json', isBinary: false };
    case 'svg':
      return { mimeType: 'image/svg+xml', isBinary: false };
    case 'txt':
      return { mimeType: 'text/plain', isBinary: false };
    case 'png':
      return { mimeType: 'image/png', isBinary: true };
    case 'jpg':
    case 'jpeg':
      return { mimeType: 'image/jpeg', isBinary: true };
    case 'webp':
      return { mimeType: 'image/webp', isBinary: true };
    case 'gif':
      return { mimeType: 'image/gif', isBinary: true };
    case 'ico':
      return { mimeType: 'image/x-icon', isBinary: true };
    case 'woff':
      return { mimeType: 'font/woff', isBinary: true };
    case 'woff2':
      return { mimeType: 'font/woff2', isBinary: true };
    case 'ttf':
      return { mimeType: 'font/ttf', isBinary: true };
    default:
      return { mimeType: 'application/octet-stream', isBinary: true };
  }
}

/**
 * Unpack a user uploaded ZIP file into in-memory VirtualFiles
 */
export async function unpackZipFile(zipBlob: Blob | File): Promise<Record<string, VirtualFile>> {
  const zip = await JSZip.loadAsync(zipBlob);
  const result: Record<string, VirtualFile> = {};

  // Sometimes zip archives have a root container directory (e.g. "hotspot/login.html" or "my-template/login.html")
  // Let's inspect the files list first.
  const zipPaths = Object.keys(zip.files).filter(p => !zip.files[p].dir && !p.startsWith('__MACOSX') && !p.endsWith('.DS_Store'));
  
  // Check if there is a common single root folder e.g. "hotspot/"
  let prefixToStrip = '';
  const firstSlashIndex = zipPaths[0]?.indexOf('/');
  if (firstSlashIndex !== -1 && zipPaths.length > 1) {
    const candidatePrefix = zipPaths[0].substring(0, firstSlashIndex + 1);
    const allHavePrefix = zipPaths.every(p => p.startsWith(candidatePrefix));
    if (allHavePrefix) {
      prefixToStrip = candidatePrefix;
    }
  }

  for (const rawPath of zipPaths) {
    const fileEntry = zip.files[rawPath];
    if (!fileEntry || fileEntry.dir) continue;

    // strip root folder if uniform
    const cleanPath = prefixToStrip ? rawPath.substring(prefixToStrip.length) : rawPath;
    if (!cleanPath) continue;

    const fileName = cleanPath.split('/').pop() || cleanPath;
    const { mimeType, isBinary } = getMimeType(fileName);

    if (isBinary) {
      const arrayBuffer = await fileEntry.async('uint8array');
      result[cleanPath] = {
        path: cleanPath,
        name: fileName,
        content: '',
        binaryData: arrayBuffer,
        isBinary: true,
        mimeType,
        lastModified: fileEntry.date?.getTime() || Date.now(),
      };
    } else {
      const text = await fileEntry.async('string');
      result[cleanPath] = {
        path: cleanPath,
        name: fileName,
        content: text,
        isBinary: false,
        mimeType,
        lastModified: fileEntry.date?.getTime() || Date.now(),
      };
    }
  }

  return result;
}

/**
 * Package all virtual files into a clean MikroTik Hotspot ready zip file and trigger download
 */
export async function exportToZip(files: Record<string, VirtualFile>, zipName = 'mikrotik-hotspot-template.zip') {
  const zip = new JSZip();

  for (const [path, file] of Object.entries(files)) {
    if (file.isBinary && file.binaryData) {
      zip.file(path, file.binaryData);
    } else {
      zip.file(path, file.content || '');
    }
  }

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}
