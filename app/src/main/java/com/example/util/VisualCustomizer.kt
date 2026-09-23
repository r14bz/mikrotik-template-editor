package com.example.util

import com.example.data.model.VisualSettings
import com.example.data.model.VoucherPackage

object VisualCustomizer {

    fun extractSettingsFromHtml(html: String, css: String): VisualSettings {
        var hotspotName = "VoltNet Hotspot"
        var welcomeTitle = "Selamat Datang di Hotspot Kami"
        var welcomeSubtitle = "Silakan masukkan kode voucher untuk akses internet cepat"
        var adminWhatsapp = "6281234567890"
        var primaryColorHex = "#0284c7"

        // Extract hotspot name
        val nameMatch = Regex("""<title>([^<]+)</title>""", RegexOption.IGNORE_CASE).find(html)
            ?: Regex("""<h1[^>]*class="[^"]*brand-name[^"]*"[^>]*>([^<]+)</h1>""", RegexOption.IGNORE_CASE).find(html)
        if (nameMatch != null) {
            hotspotName = nameMatch.groupValues[1].trim()
        }

        // Extract subtitle
        val subtitleMatch = Regex("""<p[^>]*class="[^"]*brand-subtitle[^"]*"[^>]*>([^<]+)</p>""", RegexOption.IGNORE_CASE).find(html)
        if (subtitleMatch != null) {
            welcomeSubtitle = subtitleMatch.groupValues[1].trim()
        }

        // Extract WhatsApp
        val waMatch = Regex("""wa\.me/(\d+)""").find(html)
        if (waMatch != null) {
            adminWhatsapp = waMatch.groupValues[1].trim()
        }

        // Extract Primary Color
        val colorMatch = Regex("""--primary-color:\s*(#[0-9a-fA-F]{3,8})""").find(css)
            ?: Regex("""--accent-color:\s*(#[0-9a-fA-F]{3,8})""").find(css)
        if (colorMatch != null) {
            primaryColorHex = colorMatch.groupValues[1].trim()
        }

        return VisualSettings(
            hotspotName = hotspotName,
            welcomeTitle = welcomeTitle,
            welcomeSubtitle = welcomeSubtitle,
            adminWhatsapp = adminWhatsapp,
            primaryColorHex = primaryColorHex
        )
    }

    fun applySettingsToHtml(html: String, settings: VisualSettings): String {
        var updated = html

        // Update Title tag
        updated = Regex("""<title>([^<]+)</title>""", RegexOption.IGNORE_CASE)
            .replace(updated, "<title>${settings.hotspotName}</title>")

        // Update Brand Name in HTML if matching class exists
        val brandRegex = Regex("""(<(h1|h2|div|span)[^>]*class="[^"]*brand-name[^"]*"[^>]*>)[^<]*(</(h1|h2|div|span)>)""", RegexOption.IGNORE_CASE)
        if (brandRegex.containsMatchIn(updated)) {
            updated = brandRegex.replace(updated, "$1${settings.hotspotName}$3")
        }

        // Update Subtitle
        val subtitleRegex = Regex("""(<(p|div|span)[^>]*class="[^"]*brand-subtitle[^"]*"[^>]*>)[^<]*(</(p|div|span)>)""", RegexOption.IGNORE_CASE)
        if (subtitleRegex.containsMatchIn(updated)) {
            updated = subtitleRegex.replace(updated, "$1${settings.welcomeSubtitle}$3")
        }

        // Update WhatsApp links
        updated = Regex("""https://wa\.me/\d+""")
            .replace(updated, "https://wa.me/${settings.adminWhatsapp.trim().removePrefix("+")}")

        // Update or generate pricing table if pricing container is found
        val pricingRegex = Regex("""(<!--\s*PRICING_TABLE_START\s*-->)([\s\S]*?)(<!--\s*PRICING_TABLE_END\s*-->)""")
        if (pricingRegex.containsMatchIn(updated)) {
            val pricingHtml = buildPricingCardsHtml(settings.voucherPackages)
            updated = pricingRegex.replace(updated, "$1\n$pricingHtml\n$3")
        }

        return updated
    }

    fun applySettingsToCss(css: String, settings: VisualSettings): String {
        var updated = css
        // Update --primary-color: #hex
        val primaryVarRegex = Regex("""--primary-color:\s*#[0-9a-fA-F]{3,8};?""")
        if (primaryVarRegex.containsMatchIn(updated)) {
            updated = primaryVarRegex.replace(updated, "--primary-color: ${settings.primaryColorHex};")
        }

        val accentVarRegex = Regex("""--accent-color:\s*#[0-9a-fA-F]{3,8};?""")
        if (accentVarRegex.containsMatchIn(updated)) {
            updated = accentVarRegex.replace(updated, "--accent-color: ${settings.primaryColorHex};")
        }

        return updated
    }

    private fun buildPricingCardsHtml(packages: List<VoucherPackage>): String {
        val sb = StringBuilder()
        sb.append("<div class=\"pricing-grid\">\n")
        packages.forEach { pkg ->
            sb.append("  <div class=\"pricing-card\">\n")
            sb.append("    <div class=\"pricing-header\">\n")
            sb.append("      <span class=\"badge\">${pkg.duration}</span>\n")
            sb.append("      <h3 class=\"pkg-name\">${pkg.name}</h3>\n")
            sb.append("    </div>\n")
            sb.append("    <div class=\"pricing-price\">${pkg.price}</div>\n")
            if (pkg.speedLimit.isNotBlank()) {
                sb.append("    <div class=\"pricing-speed\">${pkg.speedLimit}</div>\n")
            }
            sb.append("  </div>\n")
        }
        sb.append("</div>")
        return sb.toString()
    }
}
