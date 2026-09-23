import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  RotateCw, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  SlidersHorizontal, 
  Maximize2,
  Minimize2,
  Wifi,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { VirtualFile, DeviceType, HotspotSimulationState } from '../types/hotspot';
import { buildPreviewDocument } from '../utils/assetResolver';

interface LivePreviewProps {
  files: Record<string, VirtualFile>;
  simulationState: HotspotSimulationState;
  onUpdateSimulation: (updater: (prev: HotspotSimulationState) => HotspotSimulationState) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  activeHtmlPage: string;
  onSelectHtmlPage: (pagePath: string) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  files,
  simulationState,
  onUpdateSimulation,
  isFullscreen = false,
  onToggleFullscreen,
  activeHtmlPage,
  onSelectHtmlPage,
}) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isLandscape, setIsLandscape] = useState(false);
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [simNotification, setSimNotification] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Available HTML files in project
  const htmlFiles = useMemo(() => {
    return Object.keys(files).filter(path => path.endsWith('.html') || path.endsWith('.htm'));
  }, [files]);

  // Count assets in project
  const assetCount = useMemo(() => {
    return Object.values(files).filter(f => {
      const ext = f.path.split('.').pop()?.toLowerCase();
      return ['css', 'js', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext || '');
    }).length;
  }, [files]);

  // Compile HTML with resolved blob assets
  const { srcDoc, cleanup } = useMemo(() => {
    return buildPreviewDocument(activeHtmlPage, files, simulationState);
  }, [activeHtmlPage, files, simulationState, refreshKey]);

  // Clean up blob URLs when component unmounts or doc updates
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Handle messages from the iframe (e.g. form submission or navigation link clicks)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'MIKROTIK_SUBMIT_LOGIN') {
        const username = event.data.username || 'user_guest';
        
        if (simulationState.hasError) {
          setSimNotification(`[MikroTik Response] Login Gagal: ${simulationState.simulatedError}`);
          setTimeout(() => setSimNotification(null), 4000);
        } else {
          setSimNotification(`[MikroTik Response] Berhasil login sebagai "${username}"! Mengalihkan ke status.html...`);
          // Automatically navigate to status.html if it exists
          if (files['status.html']) {
            setTimeout(() => {
              onUpdateSimulation(prev => ({ ...prev, username: username }));
              onSelectHtmlPage('status.html');
              setSimNotification(null);
            }, 1000);
          } else {
            setTimeout(() => setSimNotification(null), 3000);
          }
        }
      }

      if (event.data.type === 'MIKROTIK_NAVIGATE') {
        const target = event.data.target;
        if (target.includes('status.html') && files['status.html']) {
          onSelectHtmlPage('status.html');
        } else if (target.includes('login') && files['login.html']) {
          onSelectHtmlPage('login.html');
        } else if (target.includes('logout') && files['logout.html']) {
          onSelectHtmlPage('logout.html');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [files, simulationState, onSelectHtmlPage, onUpdateSimulation]);

  // Open preview in new browser tab
  const handleOpenNewTab = () => {
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Device width & height calculations
  const getDeviceDimensions = () => {
    switch (deviceType) {
      case 'mobile':
        return isLandscape ? { width: '844px', height: '390px' } : { width: '390px', height: '780px' };
      case 'mobile-cna':
        return { width: '375px', height: '720px' };
      case 'tablet':
        return isLandscape ? { width: '1024px', height: '768px' } : { width: '768px', height: '940px' };
      case 'desktop':
      case 'responsive':
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const dim = getDeviceDimensions();

  return (
    <div className={`flex-1 flex flex-col h-full bg-slate-950/80 overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950' : ''}`}>
      {/* Simulation Feedback Toast */}
      {simNotification && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 border border-blue-500/60 shadow-xl rounded-xl text-xs font-medium text-blue-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{simNotification}</span>
        </div>
      )}

      {/* Top Preview Control Bar */}
      <div className="h-11 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between select-none shrink-0 gap-2">
        {/* Left: Page Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={activeHtmlPage}
              onChange={e => onSelectHtmlPage(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
            >
              {htmlFiles.map(path => (
                <option key={path} value={path} className="bg-slate-900 text-white">
                  {path} {path === 'login.html' ? '(Utama)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-medium pl-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{assetCount} Aset Terbaca</span>
          </div>
        </div>

        {/* Center: Device Switcher */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setDeviceType('desktop')}
            className={`p-1.5 rounded transition-colors ${
              deviceType === 'desktop' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan Desktop / Lebar Penuh (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceType('tablet')}
            className={`p-1.5 rounded transition-colors ${
              deviceType === 'tablet' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceType('mobile')}
            className={`p-1.5 rounded transition-colors ${
              deviceType === 'mobile' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Tampilan Smartphone (390px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeviceType('mobile-cna')}
            className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
              deviceType === 'mobile-cna' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Simulasi Android/iOS Captive Portal Assistant"
          >
            CNA
          </button>
          {deviceType !== 'desktop' && (
            <button
              onClick={() => setIsLandscape(!isLandscape)}
              className={`p-1.5 rounded text-slate-400 hover:text-slate-200 transition-colors ml-0.5`}
              title="Rotasi Layar (Landscape / Portrait)"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right: Simulation drawer toggle & Fullscreen */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSimPanel(!showSimPanel)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
              showSimPanel
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border-slate-800'
            }`}
            title="Atur Variabel MikroTik RouterOS (Error, IP, MAC, SSID)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Simulator RouterOS</span>
          </button>

          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            title="Muat Ulang Preview"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleOpenNewTab}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-lg transition-colors"
            title="Buka di Tab Baru Browser"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (Full View)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* MikroTik Simulation Variables Panel (Collapsible Drawer) */}
      {showSimPanel && (
        <div className="bg-slate-900 border-b border-slate-800 p-3 text-xs text-slate-300 shadow-xl select-none animate-in slide-in-from-top-2 duration-150">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Error Message Simulator */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Simulasi $(error):</span>
                <input
                  type="checkbox"
                  checked={simulationState.hasError}
                  onChange={e => onUpdateSimulation(prev => ({ ...prev, hasError: e.target.checked }))}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
              </label>
              <input
                type="text"
                value={simulationState.simulatedError}
                onChange={e => onUpdateSimulation(prev => ({ ...prev, simulatedError: e.target.value }))}
                placeholder="Pesan error MikroTik"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateSimulation(prev => ({ ...prev, hasError: true, simulatedError: 'invalid username or password' }))}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                >
                  Password Salah
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSimulation(prev => ({ ...prev, hasError: true, simulatedError: 'user not found or voucher expired' }))}
                  className="text-[10px] px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400"
                >
                  Voucher Habis
                </button>
              </div>
            </div>

            {/* Router Identity & Trial */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400">
                Nama Router $(identity):
              </label>
              <input
                type="text"
                value={simulationState.routerIdentity}
                onChange={e => onUpdateSimulation(prev => ({ ...prev, routerIdentity: e.target.value }))}
                placeholder="Nama Hotspot SSID"
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <label className="flex items-center gap-2 pt-1 text-[11px] text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulationState.trialAllowed}
                  onChange={e => onUpdateSimulation(prev => ({ ...prev, trialAllowed: e.target.checked }))}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0"
                />
                <span>Aktifkan Mode Coba Gratis $(trial)</span>
              </label>
            </div>

            {/* Client IP & MAC */}
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">$(ip)</label>
                  <input
                    type="text"
                    value={simulationState.clientIp}
                    onChange={e => onUpdateSimulation(prev => ({ ...prev, clientIp: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">$(mac)</label>
                  <input
                    type="text"
                    value={simulationState.clientMac}
                    onChange={e => onUpdateSimulation(prev => ({ ...prev, clientMac: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div className="text-[10px] text-slate-500 pt-1">
                Tip: Tekan tombol submit di preview untuk mencoba simulasi login MikroTik.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Preview Container Viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-slate-950">
        {deviceType === 'desktop' ? (
          /* Desktop Fluid Full View */
          <div className="w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            {/* Simulated Browser URL bar */}
            <div className="h-8 bg-slate-900 border-b border-slate-800 px-3 flex items-center gap-2 select-none shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <div className="flex-1 max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-md px-3 py-0.5 text-[11px] text-slate-400 font-mono text-center truncate">
                http://hotspot.mikrotik.com/{activeHtmlPage}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                <span>{simulationState.routerIdentity}</span>
              </div>
            </div>

            {/* Iframe */}
            <iframe
              ref={iframeRef}
              srcDoc={srcDoc}
              title="MikroTik Captive Portal Preview"
              className="w-full flex-1 border-none bg-white"
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            />
          </div>
        ) : deviceType === 'mobile-cna' ? (
          /* Android / iOS Captive Network Assistant Frame */
          <div
            style={{ width: dim.width, height: dim.height }}
            className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border-[6px] border-slate-800 flex flex-col transition-all duration-300 relative"
          >
            {/* CNA Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 select-none shrink-0">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold">Masuk ke Jaringan Wi-Fi</span>
                <span className="text-[11px] text-blue-400 cursor-pointer">Batal</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                SSID: {simulationState.routerIdentity}
              </div>
            </div>

            {/* Iframe */}
            <iframe
              ref={iframeRef}
              srcDoc={srcDoc}
              title="MikroTik Captive Portal Preview CNA"
              className="w-full flex-1 border-none bg-white"
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            />
          </div>
        ) : (
          /* Phone / Tablet Bezel Frame */
          <div
            style={{ width: dim.width, height: dim.height }}
            className="bg-slate-900 rounded-[36px] overflow-hidden shadow-2xl border-[8px] border-slate-800 flex flex-col transition-all duration-300 relative"
          >
            {/* Phone Notch/Speaker */}
            <div className="h-6 bg-slate-900 flex items-center justify-center shrink-0">
              <div className="w-16 h-3 bg-slate-800 rounded-full"></div>
            </div>

            {/* Iframe */}
            <iframe
              ref={iframeRef}
              srcDoc={srcDoc}
              title="MikroTik Captive Portal Mobile Preview"
              className="w-full flex-1 border-none bg-white"
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
            />

            {/* Home Indicator bar */}
            <div className="h-4 bg-slate-900 flex items-center justify-center shrink-0">
              <div className="w-24 h-1 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
