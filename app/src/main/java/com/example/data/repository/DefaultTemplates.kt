package com.example.data.repository

object DefaultTemplates {

    val MODERN_LOGIN_HTML = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VoltNet Hotspot</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="portal-wrapper">
        <div class="card glass-card">
            <!-- Brand Header -->
            <div class="brand-header">
                <div class="logo-wrapper">
                    <img src="assets/logo.svg" alt="Logo" class="portal-logo" onerror="this.style.display='none'">
                </div>
                <h1 class="brand-name">VoltNet Hotspot</h1>
                <p class="brand-subtitle">Internet Cepat, Stabil & Tanpa Batas</p>
            </div>

            <!-- MikroTik Error Notification -->
            $(if error)
            <div class="alert-box error-alert">
                <span class="alert-icon">⚠️</span>
                <span class="alert-msg">$(error)</span>
            </div>
            $(endif)

            <!-- Login Navigation Tabs -->
            <div class="tab-container">
                <button type="button" class="tab-btn active" id="tab-voucher" onclick="switchLoginMode('voucher')">
                    🎫 Kode Voucher
                </button>
                <button type="button" class="tab-btn" id="tab-member" onclick="switchLoginMode('member')">
                    👤 Member / Akun
                </button>
            </div>

            <!-- Login Form (MikroTik POST) -->
            <form name="login" action="$(link-login-only)" method="post" class="login-form" onsubmit="return validateLogin()">
                <input type="hidden" name="dst" value="$(link-orig)" />
                <input type="hidden" name="popup" value="true" />

                <!-- Voucher Mode Input -->
                <div id="voucher-input-group" class="input-group">
                    <label for="voucher-code">Masukkan Kode Voucher</label>
                    <div class="input-field-wrap">
                        <span class="input-icon">🔑</span>
                        <input id="voucher-code" type="text" name="voucher" placeholder="Contoh: VOLT-8942" autocomplete="off" autocorrect="off" autocapitalize="characters" />
                    </div>
                </div>

                <!-- Member Mode Inputs (Username & Password) -->
                <div id="member-input-group" class="input-group hidden">
                    <label for="username-field">Username</label>
                    <div class="input-field-wrap">
                        <span class="input-icon">👤</span>
                        <input id="username-field" type="text" name="username" placeholder="Username Anda" />
                    </div>
                    <label for="password-field" style="margin-top: 10px;">Password</label>
                    <div class="input-field-wrap">
                        <span class="input-icon">🔒</span>
                        <input id="password-field" type="password" name="password" placeholder="Password" />
                    </div>
                </div>

                <button type="submit" class="submit-btn">
                    <span>MASUK SEKARANG</span>
                    <span class="arrow">➜</span>
                </button>
            </form>

            $(if trial == 'yes')
            <div class="trial-box">
                <a href="$(link-login-only)?dst=$(link-orig-esc)&amp;username=T-$(mac-esc)" class="trial-btn">
                    ⚡ Akses Gratis 15 Menit (Trial)
                </a>
            </div>
            $(endif)

            <!-- Pricing List Section -->
            <div class="section-divider">
                <span>PILIHAN PAKET VOUCHER</span>
            </div>

            <!-- PRICING_TABLE_START -->
            <div class="pricing-grid">
                <div class="pricing-card">
                    <div class="pricing-header">
                        <span class="badge">60 Menit</span>
                        <h3 class="pkg-name">1 Jam</h3>
                    </div>
                    <div class="pricing-price">Rp 2.000</div>
                    <div class="pricing-speed">Up to 5 Mbps</div>
                </div>
                <div class="pricing-card popular">
                    <div class="popular-ribbon">TERLARIS</div>
                    <div class="pricing-header">
                        <span class="badge">1 Hari</span>
                        <h3 class="pkg-name">24 Jam</h3>
                    </div>
                    <div class="pricing-price">Rp 10.000</div>
                    <div class="pricing-speed">Up to 15 Mbps</div>
                </div>
                <div class="pricing-card">
                    <div class="pricing-header">
                        <span class="badge">7 Hari</span>
                        <h3 class="pkg-name">1 Minggu</h3>
                    </div>
                    <div class="pricing-price">Rp 35.000</div>
                    <div class="pricing-speed">Up to 20 Mbps</div>
                </div>
            </div>
            <!-- PRICING_TABLE_END -->

            <!-- Support / Contact Section -->
            <div class="support-footer">
                <p>Belum punya voucher? Beli langsung melalui:</p>
                <a href="https://wa.me/6281234567890" target="_blank" class="wa-btn">
                    💬 Hubungi Admin WhatsApp
                </a>
                <div class="device-info">
                    IP: <span>$(ip)</span> | MAC: <span>$(mac)</span>
                </div>
            </div>
        </div>
    </div>

    <script src="js/main.js"></script>
</body>
</html>
""".trimIndent()

    val MODERN_STATUS_HTML = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Status Hotspot - VoltNet</title>
    <link rel="stylesheet" href="css/style.css">
    <script>
        function openLogout() {
            if (window.name !== 'hotspot_status') return true;
            open('$(link-logout)', 'hotspot_logout', 'toolbar=0,location=0,directories=0,status=0,menubars=0,resizable=1,width=280,height=200');
            window.close();
            return false;
        }
    </script>
</head>
<body>
    <div class="portal-wrapper">
        <div class="card glass-card">
            <div class="status-header">
                <div class="online-indicator">
                    <span class="dot pulse"></span>
                    <span class="status-badge">TERHUBUNG KE INTERNET</span>
                </div>
                <h1 class="brand-name">Status Hotspot</h1>
                <p class="brand-subtitle">Halo, <strong>$(username)</strong>!</p>
            </div>

            <div class="stats-table">
                <div class="stat-row">
                    <span class="stat-label">Alamat IP</span>
                    <span class="stat-value">$(ip)</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Alamat MAC</span>
                    <span class="stat-value">$(mac)</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Waktu Aktif</span>
                    <span class="stat-value highlight">$(uptime)</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Sisa Waktu</span>
                    <span class="stat-value highlight">$(session-timeout)</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Download / Upload</span>
                    <span class="stat-value">$(bytes-out-nice) / $(bytes-in-nice)</span>
                </div>
            </div>

            <form action="$(link-logout)" name="logout" onSubmit="return openLogout()">
                <button type="submit" class="logout-btn">
                    <span>LOGOUT / KELUAR</span>
                </button>
            </form>

            <div class="support-footer" style="margin-top: 20px;">
                <a href="https://wa.me/6281234567890" class="wa-btn secondary">
                    💬 Hubungi Bantuan CS
                </a>
            </div>
        </div>
    </div>
</body>
</html>
""".trimIndent()

    val MODERN_LOGOUT_HTML = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logout Berhasil</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="portal-wrapper">
        <div class="card glass-card">
            <div class="brand-header">
                <div class="logout-icon-wrap">👋</div>
                <h1 class="brand-name">Anda Telah Logout</h1>
                <p class="brand-subtitle">Terima kasih telah menggunakan layanan hotspot kami.</p>
            </div>

            <div class="stats-table">
                <div class="stat-row">
                    <span class="stat-label">User</span>
                    <span class="stat-value">$(username)</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Pemakaian</span>
                    <span class="stat-value">$(bytes-out-nice)</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Uptime</span>
                    <span class="stat-value">$(uptime)</span>
                </div>
            </div>

            <a href="login.html" class="submit-btn" style="text-align: center; text-decoration: none; margin-top: 24px;">
                <span>MASUK KEMBALI</span>
            </a>
        </div>
    </div>
</body>
</html>
""".trimIndent()

    val MODERN_CSS = """
:root {
    --primary-color: #0284c7;
    --primary-hover: #0369a1;
    --accent-color: #0284c7;
    --accent-glow: rgba(2, 132, 199, 0.35);
    --bg-gradient: linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #1f4068 100%);
    --card-bg: rgba(255, 255, 255, 0.96);
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --border-color: #e2e8f0;
    --success: #10b981;
    --danger: #ef4444;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

body {
    min-height: 100vh;
    background: var(--bg-gradient);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    color: var(--text-primary);
}

.portal-wrapper {
    width: 100%;
    max-width: 440px;
    margin: auto;
}

.card {
    background: var(--card-bg);
    border-radius: 20px;
    padding: 28px 24px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.brand-header {
    text-align: center;
    margin-bottom: 20px;
}

.logo-wrapper {
    margin-bottom: 12px;
}

.portal-logo {
    width: 64px;
    height: 64px;
    display: inline-block;
}

.brand-name {
    font-size: 24px;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.5px;
}

.brand-subtitle {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
}

.alert-box {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 16px;
    font-size: 13px;
    font-weight: 600;
}

.error-alert {
    background: #fee2e2;
    border: 1px solid #fecaca;
    color: var(--danger);
}

.tab-container {
    display: flex;
    background: #f1f5f9;
    border-radius: 12px;
    padding: 4px;
    margin-bottom: 20px;
    gap: 4px;
}

.tab-btn {
    flex: 1;
    border: none;
    background: transparent;
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.tab-btn.active {
    background: #ffffff;
    color: var(--primary-color);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.input-group {
    margin-bottom: 16px;
}

.input-group label {
    display: block;
    font-size: 12px;
    font-weight: 700;
    color: var(--text-secondary);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.input-field-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 14px;
    font-size: 16px;
    pointer-events: none;
}

.input-field-wrap input {
    width: 100%;
    padding: 14px 14px 14px 44px;
    border: 1.5px solid var(--border-color);
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    background: #f8fafc;
    transition: all 0.2s ease;
}

.input-field-wrap input:focus {
    outline: none;
    border-color: var(--primary-color);
    background: #ffffff;
    box-shadow: 0 0 0 3px var(--accent-glow);
}

.submit-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--primary-color);
    color: #ffffff;
    border: none;
    border-radius: 12px;
    padding: 14px;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.5px;
    cursor: pointer;
    box-shadow: 0 4px 14px var(--accent-glow);
    transition: all 0.2s ease;
}

.submit-btn:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
}

.trial-box {
    margin-top: 14px;
}

.trial-btn {
    display: block;
    text-align: center;
    padding: 10px;
    background: #f0fdf4;
    border: 1px dashed var(--success);
    color: var(--success);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
}

.section-divider {
    text-align: center;
    position: relative;
    margin: 24px 0 16px;
}

.section-divider::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
    background: var(--border-color);
}

.section-divider span {
    position: relative;
    background: var(--card-bg);
    padding: 0 12px;
    font-size: 11px;
    font-weight: 800;
    color: var(--text-secondary);
    letter-spacing: 1px;
}

.pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 20px;
}

.pricing-card {
    position: relative;
    background: #f8fafc;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 12px 6px;
    text-align: center;
    transition: transform 0.2s ease;
}

.pricing-card.popular {
    border-color: var(--primary-color);
    background: #f0f9ff;
}

.popular-ribbon {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary-color);
    color: white;
    font-size: 9px;
    font-weight: 800;
    padding: 2px 8px;
    border-radius: 10px;
    letter-spacing: 0.5px;
}

.badge {
    display: inline-block;
    font-size: 10px;
    color: var(--text-secondary);
    font-weight: 600;
}

.pkg-name {
    font-size: 13px;
    font-weight: 800;
    color: var(--text-primary);
    margin: 2px 0;
}

.pricing-price {
    font-size: 13px;
    font-weight: 800;
    color: var(--primary-color);
}

.pricing-speed {
    font-size: 10px;
    color: var(--text-secondary);
    margin-top: 4px;
}

.support-footer {
    text-align: center;
    margin-top: 16px;
    font-size: 12px;
    color: var(--text-secondary);
}

.wa-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    padding: 8px 18px;
    background: #25d366;
    color: #ffffff;
    font-weight: 700;
    font-size: 13px;
    border-radius: 20px;
    text-decoration: none;
    box-shadow: 0 4px 10px rgba(37, 211, 102, 0.25);
}

.wa-btn.secondary {
    background: #f1f5f9;
    color: var(--text-primary);
    box-shadow: none;
}

.device-info {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 14px;
}

.hidden {
    display: none !important;
}

/* Status Page Additions */
.online-indicator {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #dcfce7;
    color: #15803d;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 800;
    margin-bottom: 12px;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #16a34a;
}

.stats-table {
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    padding: 12px 16px;
    margin: 16px 0;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
    font-size: 13px;
}

.stat-row:last-child {
    border-bottom: none;
}

.stat-label {
    color: var(--text-secondary);
}

.stat-value {
    font-weight: 700;
    color: var(--text-primary);
}

.stat-value.highlight {
    color: var(--primary-color);
}

.logout-btn {
    width: 100%;
    background: #fee2e2;
    color: var(--danger);
    border: 1px solid #fecaca;
    padding: 12px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
}

.logout-icon-wrap {
    font-size: 48px;
    margin-bottom: 10px;
}
""".trimIndent()

    val MODERN_JS = """
// HotspotCraft Portal Script
var currentMode = 'voucher';

function switchLoginMode(mode) {
    currentMode = mode;
    var tabVoucher = document.getElementById('tab-voucher');
    var tabMember = document.getElementById('tab-member');
    var voucherGroup = document.getElementById('voucher-input-group');
    var memberGroup = document.getElementById('member-input-group');
    var voucherInput = document.getElementById('voucher-code');

    if (mode === 'voucher') {
        tabVoucher.classList.add('active');
        tabMember.classList.remove('active');
        voucherGroup.classList.remove('hidden');
        memberGroup.classList.add('hidden');
        voucherInput.focus();
    } else {
        tabMember.classList.add('active');
        tabVoucher.classList.remove('active');
        memberGroup.classList.remove('hidden');
        voucherGroup.classList.add('hidden');
        document.getElementById('username-field').focus();
    }
}

function validateLogin() {
    var form = document.forms['login'];
    if (currentMode === 'voucher') {
        var voucher = document.getElementById('voucher-code').value.trim();
        if (!voucher) {
            alert('Silakan ketikkan kode voucher Anda terlebih dahulu.');
            return false;
        }
        // In MikroTik Hotspot voucher mode, username & password are both set to voucher code
        var userField = document.getElementById('username-field');
        var passField = document.getElementById('password-field');
        userField.value = voucher;
        passField.value = voucher;
    }
    return true;
}

// Auto uppercase for voucher code
document.addEventListener('DOMContentLoaded', function() {
    var vInput = document.getElementById('voucher-code');
    if (vInput) {
        vInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });
    }
});
""".trimIndent()

    val MODERN_LOGO_SVG = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#grad1)" />
  <circle cx="50" cy="74" r="7" fill="#ffffff" />
  <path d="M34 58 A 22 22 0 0 1 66 58" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
  <path d="M20 42 A 42 42 0 0 1 80 42" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
  <path d="M6 26 A 62 62 0 0 1 94 26" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" />
</svg>
""".trimIndent()

    val CAFE_LOGIN_HTML = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kopi & Cerita Wi-Fi</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        :root {
            --primary-color: #b45309;
            --primary-hover: #92400e;
            --bg-gradient: linear-gradient(135deg, #292524 0%, #1c1917 100%);
            --card-bg: #fffbf5;
        }
    </style>
</head>
<body>
    <div class="portal-wrapper">
        <div class="card">
            <div class="brand-header">
                <div style="font-size: 40px; margin-bottom: 8px;">☕</div>
                <h1 class="brand-name">Kopi & Cerita</h1>
                <p class="brand-subtitle">Nikmati kopi terbaik & akses Wi-Fi kencang</p>
            </div>

            $(if error)
            <div class="alert-box error-alert">
                <span>⚠️ $(error)</span>
            </div>
            $(endif)

            <form name="login" action="$(link-login-only)" method="post">
                <input type="hidden" name="dst" value="$(link-orig)" />
                <input type="hidden" name="popup" value="true" />
                <div class="input-group">
                    <label>Kode Wi-Fi di Struk Pembelian</label>
                    <div class="input-field-wrap">
                        <span class="input-icon">🧾</span>
                        <input name="username" type="text" placeholder="Masukkan 6 digit kode" required />
                    </div>
                </div>
                <input type="hidden" name="password" value="" />
                <button type="submit" class="submit-btn">
                    <span>HUBUNGKAN WI-FI</span>
                </button>
            </form>

            <div class="section-divider"><span>INFO KAFE</span></div>
            <div style="text-align: center; font-size: 13px; color: #78716c; line-height: 1.6;">
                <p>Setiap struk pembelian mendapatkan gratis 2 jam akses internet.</p>
                <p style="margin-top: 8px;">Butuh voucher tambahan? Tanyakan langsung ke barista kami.</p>
            </div>
        </div>
    </div>
</body>
</html>
""".trimIndent()

    val CYBERGLOW_LOGIN_HTML = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CyberGlow Fiber Hotspot</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        :root {
            --primary-color: #06b6d4;
            --primary-hover: #0891b2;
            --accent-glow: rgba(6, 182, 212, 0.4);
            --bg-gradient: linear-gradient(135deg, #030712 0%, #0f172a 100%);
            --card-bg: #111827;
            --text-primary: #f9fafb;
            --text-secondary: #9ca3af;
            --border-color: #1f2937;
        }
        .input-field-wrap input {
            background: #1f2937;
            color: #ffffff;
            border-color: #374151;
        }
        .tab-container {
            background: #1f2937;
        }
        .tab-btn.active {
            background: #374151;
            color: #38bdf8;
        }
        .pricing-card {
            background: #1f2937;
            border-color: #374151;
        }
        .section-divider span {
            background: #111827;
        }
    </style>
</head>
<body>
    <div class="portal-wrapper">
        <div class="card">
            <div class="brand-header">
                <div style="font-size: 42px; margin-bottom: 8px;">⚡</div>
                <h1 class="brand-name">CYBERGLOW FIBER</h1>
                <p class="brand-subtitle">Ultra High-Speed Gigabit Hotspot</p>
            </div>

            $(if error)
            <div class="alert-box error-alert">
                <span>⚠️ $(error)</span>
            </div>
            $(endif)

            <form name="login" action="$(link-login-only)" method="post">
                <input type="hidden" name="dst" value="$(link-orig)" />
                <input type="hidden" name="popup" value="true" />
                <div class="input-group">
                    <label>KODE VOUCHER ULTRA</label>
                    <div class="input-field-wrap">
                        <span class="input-icon">🚀</span>
                        <input name="username" type="text" placeholder="Masukkan Voucher" required />
                    </div>
                </div>
                <button type="submit" class="submit-btn">
                    <span>CONNECT GIGABIT</span>
                </button>
            </form>

            <div class="support-footer">
                <div class="device-info">
                    Router: <span>$(identity)</span> | IP: <span>$(ip)</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
""".trimIndent()
}
