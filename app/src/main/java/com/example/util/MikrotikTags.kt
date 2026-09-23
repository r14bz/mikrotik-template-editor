package com.example.util

data class MikrotikTag(
    val tag: String,
    val label: String,
    val description: String,
    val category: String,
    val snippet: String = tag
)

object MikrotikTags {
    val TAGS = listOf(
        // Login & Form Action
        MikrotikTag(
            tag = "\$(link-login-only)",
            label = "\$(link-login-only)",
            description = "Form action target for submitting login credentials directly",
            category = "Forms & Links",
            snippet = "<form name=\"login\" action=\"\$(link-login-only)\" method=\"post\">\n  <input type=\"hidden\" name=\"dst\" value=\"\$(link-orig)\" />\n  <input type=\"hidden\" name=\"popup\" value=\"true\" />\n  <input name=\"username\" type=\"text\" placeholder=\"Voucher\" />\n  <input name=\"password\" type=\"password\" placeholder=\"Password\" />\n  <button type=\"submit\">Login</button>\n</form>"
        ),
        MikrotikTag(
            tag = "\$(link-login)",
            label = "\$(link-login)",
            description = "Standard link to login page with query parameters",
            category = "Forms & Links",
            snippet = "\$(link-login)"
        ),
        MikrotikTag(
            tag = "\$(link-logout)",
            label = "\$(link-logout)",
            description = "Link to initiate user logout from hotspot session",
            category = "Forms & Links",
            snippet = "<a href=\"\$(link-logout)\">Logout</a>"
        ),
        MikrotikTag(
            tag = "\$(link-status)",
            label = "\$(link-status)",
            description = "Link to view current session status page",
            category = "Forms & Links",
            snippet = "<a href=\"\$(link-status)\">Lihat Status</a>"
        ),

        // Error Handling
        MikrotikTag(
            tag = "\$(error)",
            label = "\$(error)",
            description = "Prints hotspot authentication error message",
            category = "Alerts & Logic",
            snippet = "\$(if error)\n  <div class=\"alert alert-danger\">\$(error)</div>\n\$(endif)"
        ),
        MikrotikTag(
            tag = "\$(if error)",
            label = "\$(if error) ... \$(endif)",
            description = "Conditional block shown only when an authentication error occurs",
            category = "Alerts & Logic",
            snippet = "\$(if error)\n  <p class=\"error-text\">\$(error)</p>\n\$(endif)"
        ),
        MikrotikTag(
            tag = "\$(if trial)",
            label = "\$(if trial) ... \$(endif)",
            description = "Conditional block shown if free trial is enabled on router",
            category = "Alerts & Logic",
            snippet = "\$(if trial == 'yes')\n  <a href=\"\$(link-login-only)?dst=\$(link-orig-esc)&amp;username=T-\$(mac-esc)\">Coba Gratis</a>\n\$(endif)"
        ),

        // User & Device Details
        MikrotikTag(
            tag = "\$(username)",
            label = "\$(username)",
            description = "Logged in username / voucher code",
            category = "User Info",
            snippet = "\$(username)"
        ),
        MikrotikTag(
            tag = "\$(ip)",
            label = "\$(ip)",
            description = "Client device IP address",
            category = "User Info",
            snippet = "\$(ip)"
        ),
        MikrotikTag(
            tag = "\$(mac)",
            label = "\$(mac)",
            description = "Client device MAC hardware address",
            category = "User Info",
            snippet = "\$(mac)"
        ),
        MikrotikTag(
            tag = "\$(identity)",
            label = "\$(identity)",
            description = "MikroTik Router system identity name",
            category = "User Info",
            snippet = "\$(identity)"
        ),

        // Session & Traffic Stats
        MikrotikTag(
            tag = "\$(uptime)",
            label = "\$(uptime)",
            description = "Session active uptime (e.g. 1h 25m)",
            category = "Session Stats",
            snippet = "\$(uptime)"
        ),
        MikrotikTag(
            tag = "\$(session-timeout)",
            label = "\$(session-timeout)",
            description = "Total allowed session time limit or remaining time",
            category = "Session Stats",
            snippet = "\$(session-timeout)"
        ),
        MikrotikTag(
            tag = "\$(bytes-in-nice)",
            label = "\$(bytes-in-nice)",
            description = "Bytes uploaded formatted nicely (e.g. 15.4 MiB)",
            category = "Session Stats",
            snippet = "\$(bytes-in-nice)"
        ),
        MikrotikTag(
            tag = "\$(bytes-out-nice)",
            label = "\$(bytes-out-nice)",
            description = "Bytes downloaded formatted nicely (e.g. 128.2 MiB)",
            category = "Session Stats",
            snippet = "\$(bytes-out-nice)"
        ),
        MikrotikTag(
            tag = "\$(remain-bytes-total-nice)",
            label = "\$(remain-bytes-total-nice)",
            description = "Remaining data quota formatted nicely (e.g. 850 MiB)",
            category = "Session Stats",
            snippet = "\$(remain-bytes-total-nice)"
        )
    )
}
