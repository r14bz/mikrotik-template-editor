import { VirtualFile, HotspotSimulationState } from '../types/hotspot';

// Normalize path: strip leading ./ or /
export function normalizePath(path: string): string {
  return path.replace(/^\.?\//, '').trim();
}

// Convert VirtualFile to Blob URL
export function createAssetBlobUrl(file: VirtualFile): string {
  if (file.isBinary && file.binaryData) {
    const blob = new Blob([file.binaryData as unknown as BlobPart], { type: file.mimeType });
    return URL.createObjectURL(blob);
  } else {
    const blob = new Blob([file.content], { type: file.mimeType || 'text/plain' });
    return URL.createObjectURL(blob);
  }
}

// Map of all generated blob URLs to revoke later
const activeBlobUrls: string[] = [];

export function revokeAllBlobUrls() {
  while (activeBlobUrls.length > 0) {
    const url = activeBlobUrls.pop();
    if (url) {
      try {
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Process CSS content to replace any url('...') with blob URLs of matched assets
 */
export function resolveCssUrls(
  cssContent: string,
  files: Record<string, VirtualFile>,
  createdUrls: string[]
): string {
  // Matches url("path") or url('path') or url(path)
  return cssContent.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi, (match, quote, assetPath) => {
    // ignore data urls or http(s)
    if (assetPath.startsWith('data:') || assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
      return match;
    }
    const clean = normalizePath(assetPath);
    // Find matching file
    const foundFile = files[clean] || Object.values(files).find(f => normalizePath(f.path) === clean || f.name === clean);
    if (foundFile) {
      const blobUrl = createAssetBlobUrl(foundFile);
      createdUrls.push(blobUrl);
      return `url("${blobUrl}")`;
    }
    return match;
  });
}

/**
 * Substitute MikroTik RouterOS variables and conditional blocks:
 * $(if error) ... $(endif)
 * $(if trial == 'yes') ... $(endif)
 * $(variable)
 */
export function injectMikrotikVariables(html: string, sim: HotspotSimulationState): string {
  let result = html;

  // 1. Process $(if error) ... $(endif)
  if (sim.hasError && sim.simulatedError) {
    // Keep contents of $(if error) ... $(endif), replace the markers
    result = result.replace(/\$\(if\s+error\)([\s\S]*?)\$\(endif\)/gi, '$1');
  } else {
    // Strip block completely
    result = result.replace(/\$\(if\s+error\)[\s\S]*?\$\(endif\)/gi, '');
  }

  // 2. Process $(if trial == 'yes') ... $(endif)
  if (sim.trialAllowed) {
    result = result.replace(/\$\(if\s+trial\s*==\s*['"]?yes['"]?\)([\s\S]*?)\$\(endif\)/gi, '$1');
  } else {
    result = result.replace(/\$\(if\s+trial\s*==\s*['"]?yes['"]?\)[\s\S]*?\$\(endif\)/gi, '');
  }

  // 3. Process $(if session-timeout) ... $(endif)
  result = result.replace(/\$\(if\s+session-timeout\)([\s\S]*?)\$\(endif\)/gi, '$1');

  // 4. Injected MikroTik Variables mapping
  const vars: Record<string, string> = {
    'identity': sim.routerIdentity,
    'error': sim.hasError ? sim.simulatedError : '',
    'ip': sim.clientIp,
    'mac': sim.clientMac,
    'mac-esc': sim.clientMac.replace(/:/g, '-'),
    'username': sim.username,
    'uptime': sim.uptime,
    'bytes-in-nice': sim.bytesIn,
    'bytes-out-nice': sim.bytesOut,
    'session-timeout': sim.sessionTimeout,
    'trial': sim.trialAllowed ? 'yes' : 'no',
    'link-login-only': '#simulated-login-action',
    'link-login': '#login.html',
    'link-logout': '#status.html',
    'link-orig': 'http://www.google.com',
    'link-orig-esc': 'http%3A%2F%2Fwww.google.com',
    'chap-id': '01',
    'chap-challenge': 'simulated_chap_challenge_998877665544',
    'popup': 'false',
  };

  // Replace $(varName)
  for (const [key, value] of Object.entries(vars)) {
    const reg = new RegExp(`\\$\\(${key}\\)`, 'g');
    result = result.replace(reg, value);
  }

  return result;
}

/**
 * Main function to compile the HTML document with all local assets
 * (CSS, JS, Images, SVGs) resolved to Blob URLs, plus interactive simulation interceptor.
 */
export function buildPreviewDocument(
  activeHtmlPath: string,
  files: Record<string, VirtualFile>,
  simulationState: HotspotSimulationState
): { srcDoc: string; cleanup: () => void } {
  const currentHtmlFile = files[activeHtmlPath] || files['login.html'] || Object.values(files).find(f => f.name.endsWith('.html'));

  if (!currentHtmlFile) {
    return {
      srcDoc: `<html><body style="font-family:sans-serif;padding:30px;color:#64748b;background:#0f172a;text-align:center;">
        <h2>Tidak ada file HTML yang dipilih</h2>
        <p>Silakan buat atau pilih file HTML di panel sebelah kiri.</p>
      </body></html>`,
      cleanup: () => {},
    };
  }

  const createdUrls: string[] = [];

  // Step 1: Inject MikroTik Variables
  let processedHtml = injectMikrotikVariables(currentHtmlFile.content, simulationState);

  // Step 2: Build a lookup map of normalized paths
  const fileMapByPath = new Map<string, VirtualFile>();
  const fileMapByName = new Map<string, VirtualFile>();

  for (const file of Object.values(files)) {
    fileMapByPath.set(normalizePath(file.path), file);
    fileMapByName.set(file.name, file);
  }

  // Step 3: Resolve CSS <link rel="stylesheet" href="...">
  processedHtml = processedHtml.replace(
    /<link\s+([^>]*?)rel=["']stylesheet["']([^>]*?)href=["']([^"']+)["']([^>]*?)>/gi,
    (match, preRel, mid, href, post) => {
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('data:')) {
        return match;
      }
      const cleanHref = normalizePath(href);
      const cssFile = fileMapByPath.get(cleanHref) || fileMapByName.get(cleanHref.split('/').pop() || '');
      if (cssFile) {
        const resolvedCss = resolveCssUrls(cssFile.content, files, createdUrls);
        const blob = new Blob([resolvedCss], { type: 'text/css' });
        const blobUrl = URL.createObjectURL(blob);
        createdUrls.push(blobUrl);
        return `<link ${preRel} rel="stylesheet" ${mid} href="${blobUrl}" ${post}>`;
      }
      return match;
    }
  );

  // Also handle reversed attribute order: href="..." before rel="stylesheet"
  processedHtml = processedHtml.replace(
    /<link\s+([^>]*?)href=["']([^"']+)["']([^>]*?)rel=["']stylesheet["']([^>]*?)>/gi,
    (match, preHref, href, mid, post) => {
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('data:')) {
        return match;
      }
      const cleanHref = normalizePath(href);
      const cssFile = fileMapByPath.get(cleanHref) || fileMapByName.get(cleanHref.split('/').pop() || '');
      if (cssFile) {
        const resolvedCss = resolveCssUrls(cssFile.content, files, createdUrls);
        const blob = new Blob([resolvedCss], { type: 'text/css' });
        const blobUrl = URL.createObjectURL(blob);
        createdUrls.push(blobUrl);
        return `<link ${preHref} href="${blobUrl}" ${mid} rel="stylesheet" ${post}>`;
      }
      return match;
    }
  );

  // Step 4: Resolve Scripts <script src="...">
  processedHtml = processedHtml.replace(
    /<script\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>([\s\S]*?)<\/script>/gi,
    (match, pre, src, post, inner) => {
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
        return match;
      }
      const cleanSrc = normalizePath(src);
      const jsFile = fileMapByPath.get(cleanSrc) || fileMapByName.get(cleanSrc.split('/').pop() || '');
      if (jsFile) {
        const blob = new Blob([jsFile.content], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        createdUrls.push(blobUrl);
        return `<script ${pre} src="${blobUrl}" ${post}>${inner}</script>`;
      }
      return match;
    }
  );

  // Step 5: Resolve Images <img ... src="..." ...>
  processedHtml = processedHtml.replace(
    /<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi,
    (match, pre, src, post) => {
      if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
        return match;
      }
      const cleanSrc = normalizePath(src);
      const imgFile = fileMapByPath.get(cleanSrc) || fileMapByName.get(cleanSrc.split('/').pop() || '');
      if (imgFile) {
        const blobUrl = createAssetBlobUrl(imgFile);
        createdUrls.push(blobUrl);
        return `<img ${pre} src="${blobUrl}" ${post}>`;
      }
      return match;
    }
  );

  // Step 6: Resolve inline style="..." containing url(...)
  processedHtml = processedHtml.replace(/style=["']([^"']+)["']/gi, (match, styleContent) => {
    const resolvedStyle = resolveCssUrls(styleContent, files, createdUrls);
    return `style="${resolvedStyle}"`;
  });

  // Step 7: Inject Live Simulator Interceptor
  // This captures login submissions in the preview iframe, informs the parent window,
  // and allows user to experience instant login simulation (transitioning to status.html or showing feedback)!
  const simulationScript = `
  <script>
    (function() {
      // Intercept form submit
      document.addEventListener('submit', function(e) {
        e.preventDefault();
        var form = e.target;
        var formData = new FormData(form);
        var username = formData.get('username') || '';
        
        window.parent.postMessage({
          type: 'MIKROTIK_SUBMIT_LOGIN',
          username: username,
          action: form.getAttribute('action')
        }, '*');
      }, true);

      // Intercept navigation links like status.html, login.html, logout.html
      document.addEventListener('click', function(e) {
        var a = e.target.closest('a');
        if (a && a.getAttribute('href')) {
          var href = a.getAttribute('href');
          if (href.startsWith('#') || href.endsWith('.html')) {
            e.preventDefault();
            window.parent.postMessage({
              type: 'MIKROTIK_NAVIGATE',
              target: href.replace(/^#/, '')
            }, '*');
          }
        }
      }, true);
    })();
  </script>
  `;

  // Inject simulation script right before </body>
  if (processedHtml.includes('</body>')) {
    processedHtml = processedHtml.replace('</body>', `${simulationScript}</body>`);
  } else {
    processedHtml += simulationScript;
  }

  // Record for global tracking
  activeBlobUrls.push(...createdUrls);

  return {
    srcDoc: processedHtml,
    cleanup: () => {
      for (const u of createdUrls) {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // ignore
        }
      }
    },
  };
}
