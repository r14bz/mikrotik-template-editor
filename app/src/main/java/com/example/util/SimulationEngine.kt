package com.example.util

import android.webkit.MimeTypeMap
import java.io.File
import java.io.FileInputStream
import java.io.InputStream

data class SimulationProfile(
    val hasError: Boolean = false,
    val errorMessage: String = "Voucher expired or invalid login",
    val hasTrial: Boolean = true,
    val simulatedUsername: String = "VIP-89312",
    val simulatedIp: String = "192.168.88.45",
    val simulatedMac: String = "DC:A6:32:89:1F:B4",
    val simulatedRouterIdentity: String = "MikroTik-Hotspot-Pro",
    val simulatedUptime: String = "01:34:20",
    val simulatedBytesIn: String = "24.6 MiB",
    val simulatedBytesOut: String = "182.4 MiB",
    val simulatedSessionTimeout: String = "02:00:00",
    val simulatedRemainBytes: String = "817.6 MiB"
)

object SimulationEngine {

    fun getMimeType(extension: String): String {
        return when (extension.lowercase()) {
            "html", "htm" -> "text/html"
            "css" -> "text/css"
            "js" -> "application/javascript"
            "json" -> "application/json"
            "png" -> "image/png"
            "jpg", "jpeg" -> "image/jpeg"
            "webp" -> "image/webp"
            "svg" -> "image/svg+xml"
            "gif" -> "image/gif"
            "ico" -> "image/x-icon"
            "woff" -> "font/woff"
            "woff2" -> "font/woff2"
            "ttf" -> "font/ttf"
            "otf" -> "font/otf"
            "txt" -> "text/plain"
            "xml" -> "application/xml"
            else -> MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension)
                ?: "application/octet-stream"
        }
    }

    /**
     * Process HTML content by simulating MikroTik template variables
     */
    fun processHtml(rawHtml: String, profile: SimulationProfile, currentPage: String): String {
        var processed = rawHtml

        // 1. Process conditionals: $(if error) ... $(endif)
        val errorConditionRegex = Regex("""\$\(if\s+error\)([\s\S]*?)\$\(endif\)""", RegexOption.IGNORE_CASE)
        processed = errorConditionRegex.replace(processed) { matchResult ->
            if (profile.hasError) {
                matchResult.groupValues[1]
            } else {
                ""
            }
        }

        // 2. Process conditionals: $(if trial == 'yes') or $(if trial)
        val trialConditionRegex = Regex("""\$\(if\s+trial[^\)]*\)([\s\S]*?)\$\(endif\)""", RegexOption.IGNORE_CASE)
        processed = trialConditionRegex.replace(processed) { matchResult ->
            if (profile.hasTrial) {
                matchResult.groupValues[1]
            } else {
                ""
            }
        }

        // 3. Process common MikroTik tags
        val replacements = mapOf(
            "\$(link-login-only)" to "status.html?simulated=login",
            "\$(link-login)" to "login.html",
            "\$(link-logout)" to "logout.html?simulated=logout",
            "\$(link-status)" to "status.html",
            "\$(link-orig)" to "http://www.google.com",
            "\$(link-orig-esc)" to "http%3A%2F%2Fwww.google.com",
            "\$(mac-esc)" to profile.simulatedMac.replace(":", ""),
            "\$(error)" to if (profile.hasError) profile.errorMessage else "",
            "\$(username)" to profile.simulatedUsername,
            "\$(ip)" to profile.simulatedIp,
            "\$(mac)" to profile.simulatedMac,
            "\$(identity)" to profile.simulatedRouterIdentity,
            "\$(uptime)" to profile.simulatedUptime,
            "\$(session-timeout)" to profile.simulatedSessionTimeout,
            "\$(bytes-in-nice)" to profile.simulatedBytesIn,
            "\$(bytes-out-nice)" to profile.simulatedBytesOut,
            "\$(remain-bytes-total-nice)" to profile.simulatedRemainBytes,
            "\$(session-time-left)" to "00:25:40"
        )

        for ((tag, value) in replacements) {
            processed = processed.replace(tag, value)
        }

        // Add a friendly interactive script so form submit in login.html cleanly routes to status.html
        val interactiveScript = """
            <script>
            (function() {
                // Ensure forms in preview direct to simulated status page
                window.addEventListener('DOMContentLoaded', function() {
                    const forms = document.querySelectorAll('form');
                    forms.forEach(function(form) {
                        form.addEventListener('submit', function(e) {
                            e.preventDefault();
                            var action = form.getAttribute('action') || '';
                            if (action.includes('login') || form.name === 'login') {
                                window.location.href = 'status.html?simulated=login';
                            }
                        });
                    });
                });
            })();
            </script>
        """.trimIndent()

        // Inject before </body> if present
        if (processed.contains("</body>", ignoreCase = true)) {
            processed = processed.replace("</body>", "$interactiveScript\n</body>", ignoreCase = true)
        } else {
            processed += interactiveScript
        }

        return processed
    }
}
