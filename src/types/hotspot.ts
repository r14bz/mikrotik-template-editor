export interface VirtualFile {
  path: string; // e.g. "login.html", "css/style.css", "assets/logo.svg"
  name: string;
  content: string; // text content
  binaryData?: Uint8Array; // binary data for images, fonts, etc.
  isBinary: boolean;
  mimeType: string;
  lastModified: number;
}

export type ViewMode = 'split' | 'code' | 'preview';
export type DeviceType = 'responsive' | 'desktop' | 'tablet' | 'mobile' | 'mobile-cna';

export interface HotspotSimulationState {
  routerIdentity: string;
  clientIp: string;
  clientMac: string;
  simulatedError: string;
  hasError: boolean;
  trialAllowed: boolean;
  username: string;
  uptime: string;
  bytesIn: string;
  bytesOut: string;
  sessionTimeout: string;
  linkLoginOnly: string;
  linkLogout: string;
}

export interface HotspotTemplateMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnailColor: string;
}
