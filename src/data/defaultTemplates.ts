import { VirtualFile } from '../types/hotspot';

export interface StarterTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  badge: string;
  files: Record<string, VirtualFile>;
}

// Helper to create text file
const makeTextFile = (path: string, content: string, mimeType: string = 'text/plain'): VirtualFile => {
  const name = path.split('/').pop() || path;
  return {
    path,
    name,
    content,
    isBinary: false,
    mimeType,
    lastModified: Date.now(),
  };
};

// Helper to create SVG file
const makeSvgFile = (path: string, svgContent: string): VirtualFile => {
  return makeTextFile(path, svgContent, 'image/svg+xml');
};

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none">
  <rect width="48" height="48" y="6" rx="12" fill="url(#brandGrad)" />
  <path d="M14 36C19.5 30.5 28.5 30.5 34 36" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <path d="M18 40C21.3 36.7 26.7 36.7 30 40" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <circle cx="24" cy="44" r="2.5" fill="white"/>
  <text x="60" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="700" fill="#0f172a">FLASH<tspan fill="#3b82f6">NET</tspan></text>
  <text x="60" y="46" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#64748b">HOTSPOT HIGH SPEED</text>
  <defs>
    <linearGradient id="brandGrad" x1="0" y1="6" x2="48" y2="54" gradientUnits="userSpaceOnUse">
      <stop stop-color="#2563eb"/>
      <stop offset="1" stop-color="#4f46e5"/>
    </linearGradient>
  </defs>
</svg>`;

const COFFEE_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none">
  <rect width="48" height="48" y="6" rx="12" fill="url(#coffeeGrad)" />
  <path d="M16 22H32V32C32 35.3137 29.3137 38 26 38H22C18.6863 38 16 35.3137 16 32V22Z" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M32 25H34.5C35.8807 25 37 26.1193 37 27.5C37 28.8807 35.8807 30 34.5 30H32" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M14 42H34" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M20 16C20 18 21 19 21 20" stroke="#fcd34d" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M24 14C24 17 25 18 25 20" stroke="#fcd34d" stroke-width="1.8" stroke-linecap="round"/>
  <text x="60" y="32" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="700" fill="#1e293b">KOPI<tspan fill="#d97706">KITA</tspan></text>
  <text x="60" y="46" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="500" fill="#78716c">FREE WIFI &amp; CAFE</text>
  <defs>
    <linearGradient id="coffeeGrad" x1="0" y1="6" x2="48" y2="54" gradientUnits="userSpaceOnUse">
      <stop stop-color="#d97706"/>
      <stop offset="1" stop-color="#92400e"/>
    </linearGradient>
  </defs>
</svg>`;

// TEMPLATE 1: Modern Voucher & Member Portal
const T1_LOGIN_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta http-equiv="pragma" content="no-cache">
  <meta http-equiv="expires" content="-1">
  <title>$(identity) - Login Hotspot Portal</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="portal-container">
    <div class="portal-card">
      <!-- Header Brand -->
      <div class="brand-header">
        <img src="assets/logo.svg" alt="Hotspot Logo" class="brand-logo">
        <div class="network-badge">
          <span class="signal-dot"></span>
          <span>$(identity)</span>
        </div>
      </div>

      <!-- Welcome Banner -->
      <div class="welcome-box">
        <h1>Selamat Datang di Hotspot</h1>
        <p>Silakan masukkan kode voucher atau akun member Anda untuk mulai browsing internet cepat.</p>
      </div>

      <!-- MikroTik Error Notification Condition -->
      $(if error)
      <div class="alert alert-danger" id="errorBox">
        <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div class="alert-content">
          <div class="alert-title">Gagal Masuk</div>
          <div class="alert-message">$(error)</div>
        </div>
      </div>
      $(endif)

      <!-- Tabs Navigation -->
      <div class="tab-buttons">
        <button type="button" class="tab-btn active" id="tabVoucherBtn" onclick="switchMode('voucher')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
            <rect x="2" y="5" width="20" height="14" rx="2"></rect>
            <line x1="2" y1="10" x2="22" y2="10"></line>
          </svg>
          Kode Voucher
        </button>
        <button type="button" class="tab-btn" id="tabMemberBtn" onclick="switchMode('member')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          Member
        </button>
      </div>

      <!-- MikroTik Form Action -->
      <form name="login" action="$(link-login-only)" method="post" class="login-form" onsubmit="return handleLoginSubmit();">
        <input type="hidden" name="dst" value="$(link-orig)" />
        <input type="hidden" name="popup" value="true" />

        <!-- Voucher Form Section -->
        <div id="voucherSection">
          <div class="form-group">
            <label for="voucherCode">KODE VOUCHER</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 2l-2 2m-1-1l-2 2m-1-1l-2 2M3 21l2-2m1 1l2-2m1 1l2-2"></path>
                <rect x="3" y="7" width="18" height="10" rx="2"></rect>
              </svg>
              <input type="text" id="voucherCode" name="username" placeholder="Masukkan 6-8 digit voucher" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" required>
            </div>
            <!-- Auto password synced with username for single-code voucher mode -->
            <input type="hidden" id="voucherPassword" name="password" value="">
          </div>
        </div>

        <!-- Member Form Section -->
        <div id="memberSection" style="display: none;">
          <div class="form-group">
            <label for="memberUser">USERNAME MEMBER</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input type="text" id="memberUser" placeholder="Nama pengguna member" autocomplete="off">
            </div>
          </div>

          <div class="form-group">
            <label for="memberPass">KATA SANDI</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input type="password" id="memberPass" placeholder="Kata sandi akun">
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="submit-btn" id="loginSubmitBtn">
          <span>MASUK INTERNET</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-arrow">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </form>

      <!-- Free Trial Condition -->
      $(if trial == 'yes')
      <div class="trial-box">
        <span class="trial-text">Mau coba koneksi gratis?</span>
        <a href="$(link-login-only)?dst=$(link-orig-esc)&amp;username=T-$(mac-esc)" class="trial-link">
          Coba Gratis 15 Menit &rarr;
        </a>
      </div>
      $(endif)

      <!-- Pricing Plans / Daftar Paket Voucher -->
      <div class="packages-card">
        <div class="packages-header">
          <h3>DAFTAR TARIF VOUCHER</h3>
          <span class="packages-sub">Pilih kuota sesuai kebutuhan</span>
        </div>
        <div class="packages-grid">
          <div class="pkg-item">
            <div class="pkg-duration">3 Jam</div>
            <div class="pkg-price">Rp 2.000</div>
            <div class="pkg-speed">Up to 5 Mbps</div>
          </div>
          <div class="pkg-item featured">
            <div class="pkg-tag">TERPOPULER</div>
            <div class="pkg-duration">24 Jam</div>
            <div class="pkg-price">Rp 5.000</div>
            <div class="pkg-speed">Up to 10 Mbps</div>
          </div>
          <div class="pkg-item">
            <div class="pkg-duration">7 Hari</div>
            <div class="pkg-price">Rp 25.000</div>
            <div class="pkg-speed">Up to 15 Mbps</div>
          </div>
        </div>
      </div>

      <!-- Footer Info -->
      <div class="portal-footer">
        <div class="ip-info">
          <span>IP: $(ip)</span>
          <span>&bull;</span>
          <span>MAC: $(mac)</span>
        </div>
        <div class="helpdesk">
          <span>Butuh Bantuan / Beli Voucher?</span>
          <a href="https://wa.me/6281234567890?text=Halo%20Admin%20Hotspot" class="wa-btn" target="_blank">
            Hubungi WhatsApp Admin
          </a>
        </div>
      </div>
    </div>
  </div>

  <script src="js/script.js"></script>
</body>
</html>`;

const T1_STYLE_CSS = `/* Reset & Fonts */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-tap-highlight-color: transparent;
}

body {
  background: #0f172a;
  background-image: 
    radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.18) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.15) 0px, transparent 50%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f8fafc;
  padding: 16px;
}

.portal-container {
  width: 100%;
  max-width: 440px;
  margin: 0 auto;
}

.portal-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
}

/* Header Brand */
.brand-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #334155;
}

.brand-logo {
  height: 38px;
  width: auto;
  object-fit: contain;
}

.network-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #0f172a;
  border: 1px solid #334155;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

.signal-dot {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 8px #22c55e;
}

/* Welcome Box */
.welcome-box {
  margin-bottom: 20px;
}

.welcome-box h1 {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
}

.welcome-box p {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.5;
}

/* Error Alert */
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.4);
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 18px;
}

.alert-danger {
  color: #fca5a5;
}

.alert-icon {
  width: 20px;
  height: 20px;
  stroke: #ef4444;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-title {
  font-size: 13px;
  font-weight: 600;
  color: #f87171;
}

.alert-message {
  font-size: 12px;
  color: #fca5a5;
  margin-top: 2px;
}

/* Tab buttons */
.tab-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: #0f172a;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 18px;
}

.tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.tab-icon {
  width: 16px;
  height: 16px;
}

/* Form Styles */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  width: 18px;
  height: 18px;
  stroke: #64748b;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  background: #0f172a;
  border: 1.5px solid #334155;
  border-radius: 10px;
  padding: 12px 14px 12px 42px;
  font-size: 14px;
  color: #ffffff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrapper input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.submit-btn {
  width: 100%;
  background: #2563eb;
  border: none;
  color: #ffffff;
  padding: 14px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
}

.submit-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
}

.btn-arrow {
  width: 18px;
  height: 18px;
}

/* Trial Box */
.trial-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 10px 14px;
  background: rgba(37, 99, 235, 0.08);
  border: 1px dashed rgba(59, 130, 246, 0.4);
  border-radius: 10px;
}

.trial-text {
  font-size: 12px;
  color: #94a3b8;
}

.trial-link {
  font-size: 12px;
  font-weight: 600;
  color: #60a5fa;
  text-decoration: none;
}

.trial-link:hover {
  text-decoration: underline;
}

/* Packages Grid */
.packages-card {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid #334155;
}

.packages-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
}

.packages-header h3 {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.5px;
}

.packages-sub {
  font-size: 10px;
  color: #64748b;
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.pkg-item {
  position: relative;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
}

.pkg-item.featured {
  border-color: #3b82f6;
  background: rgba(37, 99, 235, 0.1);
}

.pkg-tag {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  background: #2563eb;
  color: #ffffff;
  font-size: 8px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.pkg-duration {
  font-size: 12px;
  font-weight: 700;
  color: #f1f5f9;
}

.pkg-price {
  font-size: 13px;
  font-weight: 800;
  color: #38bdf8;
  margin: 3px 0;
}

.pkg-speed {
  font-size: 9px;
  color: #94a3b8;
}

/* Footer */
.portal-footer {
  margin-top: 20px;
  text-align: center;
}

.ip-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-family: monospace;
  color: #64748b;
  margin-bottom: 12px;
}

.helpdesk {
  font-size: 12px;
  color: #94a3b8;
}

.wa-btn {
  display: inline-block;
  margin-top: 6px;
  color: #22c55e;
  text-decoration: none;
  font-weight: 600;
  font-size: 12px;
}

.wa-btn:hover {
  text-decoration: underline;
}
`;

const T1_SCRIPT_JS = `// MikroTik Hotspot Helper Scripts
let currentMode = 'voucher';

function switchMode(mode) {
  currentMode = mode;
  const voucherSec = document.getElementById('voucherSection');
  const memberSec = document.getElementById('memberSection');
  const tabVoucher = document.getElementById('tabVoucherBtn');
  const tabMember = document.getElementById('tabMemberBtn');
  const voucherCode = document.getElementById('voucherCode');
  const memberUser = document.getElementById('memberUser');

  if (mode === 'voucher') {
    voucherSec.style.display = 'block';
    memberSec.style.display = 'none';
    tabVoucher.classList.add('active');
    tabMember.classList.remove('active');
    voucherCode.setAttribute('required', 'required');
    memberUser.removeAttribute('required');
  } else {
    voucherSec.style.display = 'none';
    memberSec.style.display = 'block';
    tabVoucher.classList.remove('active');
    tabMember.classList.add('active');
    voucherCode.removeAttribute('required');
    memberUser.setAttribute('required', 'required');
  }
}

// Ensure voucher password equals username for standard single-field Mikrotik vouchers
const voucherInput = document.getElementById('voucherCode');
const voucherPass = document.getElementById('voucherPassword');

if (voucherInput && voucherPass) {
  voucherInput.addEventListener('input', function() {
    this.value = this.value.toUpperCase().trim();
    voucherPass.value = this.value;
  });
}

function handleLoginSubmit() {
  if (currentMode === 'member') {
    const u = document.getElementById('memberUser').value;
    const p = document.getElementById('memberPass').value;
    // sync member fields to form inputs
    if (voucherInput) voucherInput.value = u;
    if (voucherPass) voucherPass.value = p;
  } else {
    if (voucherInput && voucherPass) {
      voucherPass.value = voucherInput.value;
    }
  }
  return true;
}
`;

const T1_STATUS_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <title>Status Koneksi - $(identity)</title>
  <link rel="stylesheet" href="css/style.css">
  <script language="JavaScript">
    function openLogout() {
      if (window.name != 'hotspot_status') return true;
      open('$(link-logout)', 'hotspot_logout', 'toolbar=0,location=0,directories=0,status=0,menubars=0,resizable=1,width=280,height=200');
      window.close();
      return false;
    }
  </script>
</head>
<body>
  <div class="portal-container">
    <div class="portal-card">
      <div class="brand-header">
        <img src="assets/logo.svg" alt="Logo" class="brand-logo">
        <div class="network-badge">
          <span class="signal-dot"></span>
          <span>TERHUBUNG</span>
        </div>
      </div>

      <div class="welcome-box">
        <h1>Status Internet Aktif</h1>
        <p>Anda telah terhubung ke jaringan internet hotspot <strong>$(identity)</strong>.</p>
      </div>

      <div style="background: #0f172a; border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid #334155;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Nama Pengguna</td>
            <td style="padding: 8px 0; font-weight: 600; text-align: right; color: #38bdf8;">$(username)</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Alamat IP</td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace; color: #cbd5e1;">$(ip)</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Alamat MAC</td>
            <td style="padding: 8px 0; text-align: right; font-family: monospace; color: #cbd5e1;">$(mac)</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Waktu Terhubung</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #22c55e;">$(uptime)</td>
          </tr>
          <tr style="border-bottom: 1px solid #1e293b;">
            <td style="padding: 8px 0; color: #94a3b8;">Upload / Download</td>
            <td style="padding: 8px 0; text-align: right; color: #cbd5e1;">$(bytes-in-nice) / $(bytes-out-nice)</td>
          </tr>
          $(if session-timeout)
          <tr>
            <td style="padding: 8px 0; color: #94a3b8;">Sisa Waktu</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #f59e0b;">$(session-timeout)</td>
          </tr>
          $(endif)
        </table>
      </div>

      <form action="$(link-logout)" name="logout" onSubmit="return openLogout()">
        <button type="submit" class="submit-btn" style="background: #ef4444; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);">
          PUTUS KONEKSI (LOGOUT)
        </button>
      </form>
    </div>
  </div>
</body>
</html>`;

const T1_LOGOUT_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Logout - $(identity)</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="portal-container">
    <div class="portal-card" style="text-align: center;">
      <img src="assets/logo.svg" alt="Logo" class="brand-logo" style="margin: 0 auto 16px auto;">
      <h1 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Koneksi Berakhir</h1>
      <p style="font-size: 13px; color: #94a3b8; margin-bottom: 24px;">Anda telah berhasil keluar dari jaringan hotspot.</p>
      
      <div style="background: #0f172a; padding: 14px; border-radius: 12px; margin-bottom: 20px; font-size: 13px; color: #94a3b8; border: 1px solid #334155;">
        Total Durasi Pemakaian: <strong style="color: #ffffff;">$(uptime)</strong><br>
        Total Kuota Terpakai: <strong style="color: #38bdf8;">$(bytes-in-nice) / $(bytes-out-nice)</strong>
      </div>

      <a href="$(link-login)" class="submit-btn" style="text-decoration: none;">
        MASUK KEMBALI
      </a>
    </div>
  </div>
</body>
</html>`;

const T1_ERROR_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terjadi Kesalahan - $(identity)</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="portal-container">
    <div class="portal-card" style="text-align: center;">
      <div style="width: 56px; height: 56px; background: rgba(239, 68, 68, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto;">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" style="width: 28px; height: 28px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h1 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Gagal Terhubung</h1>
      <p style="font-size: 13px; color: #f87171; margin-bottom: 24px;">$(error)</p>
      <a href="$(link-login)" class="submit-btn" style="text-decoration: none;">
        COBA LAGI
      </a>
    </div>
  </div>
</body>
</html>`;

// TEMPLATE 2: Cyber Cafe & Coffee Shop
const T2_LOGIN_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kopi Kita - WiFi Hotspot</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="cafe-wrapper">
    <div class="cafe-card">
      <div class="cafe-logo-wrap">
        <img src="assets/logo.svg" alt="Kopi Kita Cafe" class="cafe-logo">
      </div>
      <div class="cafe-motto">
        <h2>Nikmati Kopi &amp; Internet Cepat</h2>
        <p>Password/Voucher tercetak pada struk kasir pembayaran Anda.</p>
      </div>

      $(if error)
      <div class="cafe-error">
        <span>&times;</span>
        <div>$(error)</div>
      </div>
      $(endif)

      <form action="$(link-login-only)" method="post" name="login">
        <input type="hidden" name="dst" value="$(link-orig)" />
        <input type="hidden" name="popup" value="true" />
        
        <div class="cafe-input-box">
          <label>KODE AKSES STRUK</label>
          <input type="text" name="username" placeholder="Contoh: KOP-8921" required autofocus autocomplete="off">
          <input type="hidden" name="password" id="cafePass">
        </div>

        <button type="submit" class="cafe-btn">KONEKSIKAN SEKARANG</button>
      </form>

      <div class="cafe-menu-banner">
        <span>Promo Hari Ini: Diskon 20% Caramel Macchiato</span>
      </div>

      <div class="cafe-foot">
        <div>SSID: $(identity) | IP: $(ip)</div>
        <small>Tanyakan barista jika voucher bermasalah</small>
      </div>
    </div>
  </div>
  <script>
    const uInput = document.querySelector('input[name="username"]');
    const pInput = document.getElementById('cafePass');
    if (uInput && pInput) {
      uInput.addEventListener('input', () => {
        pInput.value = uInput.value;
      });
    }
  </script>
</body>
</html>`;

const T2_STYLE_CSS = `* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, sans-serif; }
body {
  background: #1c1917;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: #f5f5f4;
}
.cafe-wrapper { width: 100%; max-width: 400px; }
.cafe-card {
  background: #292524;
  border: 1px solid #44403c;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);
}
.cafe-logo-wrap { text-align: center; margin-bottom: 16px; }
.cafe-logo { height: 42px; }
.cafe-motto { text-align: center; margin-bottom: 22px; }
.cafe-motto h2 { font-size: 19px; color: #fbbf24; margin-bottom: 6px; }
.cafe-motto p { font-size: 13px; color: #a8a29e; }
.cafe-error {
  background: #7f1d1d;
  color: #fecaca;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 12px;
  margin-bottom: 16px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.cafe-input-box { margin-bottom: 18px; }
.cafe-input-box label { display: block; font-size: 11px; font-weight: 700; color: #d6d3d1; margin-bottom: 6px; letter-spacing: 0.5px; }
.cafe-input-box input {
  width: 100%;
  background: #1c1917;
  border: 1.5px solid #57534e;
  border-radius: 10px;
  padding: 12px 14px;
  color: #fafaf9;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 1px;
}
.cafe-input-box input:focus { border-color: #d97706; outline: none; }
.cafe-btn {
  width: 100%;
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 13px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}
.cafe-btn:hover { background: #b45309; }
.cafe-menu-banner {
  margin-top: 18px;
  background: #362f2d;
  border: 1px dashed #78350f;
  padding: 10px;
  border-radius: 8px;
  text-align: center;
  font-size: 12px;
  color: #fde68a;
}
.cafe-foot {
  margin-top: 20px;
  text-align: center;
  font-size: 11px;
  color: #78716c;
}
`;

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: 'modern-voucher',
    name: 'Modern Hotspot (Voucher & Member)',
    description: 'Template komplit dengan tab voucher/member, daftar paket, CS WhatsApp, logo SVG & responsive mobile.',
    category: 'ISP & RT/RW Net',
    badge: 'Rekomendasi',
    files: {
      'login.html': makeTextFile('login.html', T1_LOGIN_HTML, 'text/html'),
      'status.html': makeTextFile('status.html', T1_STATUS_HTML, 'text/html'),
      'logout.html': makeTextFile('logout.html', T1_LOGOUT_HTML, 'text/html'),
      'error.html': makeTextFile('error.html', T1_ERROR_HTML, 'text/html'),
      'css/style.css': makeTextFile('css/style.css', T1_STYLE_CSS, 'text/css'),
      'js/script.js': makeTextFile('js/script.js', T1_SCRIPT_JS, 'application/javascript'),
      'assets/logo.svg': makeSvgFile('assets/logo.svg', LOGO_SVG),
    },
  },
  {
    id: 'cafe-coffee',
    name: 'Coffee Shop & Cafe Hotspot',
    description: 'Nuansa warm coffee minimalis, voucher struk kasir, banner promo, cocok untuk cafe/warkop.',
    category: 'Cafe & Resto',
    badge: 'Cafe',
    files: {
      'login.html': makeTextFile('login.html', T2_LOGIN_HTML, 'text/html'),
      'status.html': makeTextFile('status.html', T1_STATUS_HTML, 'text/html'),
      'logout.html': makeTextFile('logout.html', T1_LOGOUT_HTML, 'text/html'),
      'error.html': makeTextFile('error.html', T1_ERROR_HTML, 'text/html'),
      'css/style.css': makeTextFile('css/style.css', T2_STYLE_CSS, 'text/css'),
      'assets/logo.svg': makeSvgFile('assets/logo.svg', COFFEE_LOGO_SVG),
    },
  },
];
