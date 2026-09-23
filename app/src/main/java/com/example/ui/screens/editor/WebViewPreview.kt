package com.example.ui.screens.editor

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.net.Uri
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.FullscreenExit
import androidx.compose.material.icons.filled.PhoneAndroid
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.StayCurrentLandscape
import androidx.compose.material.icons.filled.Tablet
import androidx.compose.material.icons.filled.Tv
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.util.SimulationEngine
import com.example.util.SimulationProfile
import java.io.ByteArrayInputStream
import java.io.File
import java.io.FileInputStream

enum class ViewportMode(val title: String, val widthDp: Int?) {
    FULL_RESPONSIVE("Penuh", null),
    MOBILE_PORTRAIT("HP Tegak", 380),
    MOBILE_LANDSCAPE("HP Miring", 640),
    TABLET("Tablet", 768)
}

@Composable
fun LivePreviewContainer(
    projectDir: File,
    activePage: String = "login.html",
    onPageSelected: (String) -> Unit,
    simulationProfile: SimulationProfile,
    onSimulationProfileChanged: (SimulationProfile) -> Unit,
    reloadKey: Long,
    modifier: Modifier = Modifier
) {
    var viewportMode by remember { mutableStateOf(ViewportMode.FULL_RESPONSIVE) }
    var isFullscreen by remember { mutableStateOf(false) }
    var currentWebUrl by remember { mutableStateOf("http://hotspot.local/$activePage") }
    var localReloadCounter by remember { mutableStateOf(0L) }

    LaunchedEffect(activePage) {
        currentWebUrl = "http://hotspot.local/$activePage"
    }

    Column(modifier = modifier.fillMaxSize()) {
        // Preview control header
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.surfaceVariant,
            tonalElevation = 2.dp
        ) {
            Column(modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)) {
                // Row 1: Target page switcher & controls
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Halaman:",
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(6.dp))

                    val pages = listOf("login.html", "status.html", "logout.html")
                    pages.forEach { page ->
                        val isSelected = activePage.equals(page, ignoreCase = true)
                        FilterChip(
                            selected = isSelected,
                            onClick = { onPageSelected(page) },
                            label = { Text(page, fontSize = 11.sp) },
                            modifier = Modifier.padding(end = 4.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = MaterialTheme.colorScheme.primary,
                                selectedLabelColor = MaterialTheme.colorScheme.onPrimary
                            )
                        )
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    // Reload button
                    IconButton(
                        onClick = { localReloadCounter++ },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Muat Ulang Preview",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }

                    // Fullscreen button
                    IconButton(
                        onClick = { isFullscreen = true },
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Fullscreen,
                            contentDescription = "Tampilan Layar Penuh",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }

                // Row 2: Viewport Switcher & Simulation Toggles
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Ukuran:",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(6.dp))

                    ViewportMode.values().forEach { mode ->
                        val icon = when (mode) {
                            ViewportMode.FULL_RESPONSIVE -> Icons.Default.Tv
                            ViewportMode.MOBILE_PORTRAIT -> Icons.Default.PhoneAndroid
                            ViewportMode.MOBILE_LANDSCAPE -> Icons.Default.StayCurrentLandscape
                            ViewportMode.TABLET -> Icons.Default.Tablet
                        }
                        IconButton(
                            onClick = { viewportMode = mode },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = icon,
                                contentDescription = mode.title,
                                tint = if (viewportMode == mode) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    // Error simulation toggle
                    FilterChip(
                        selected = simulationProfile.hasError,
                        onClick = {
                            onSimulationProfileChanged(
                                simulationProfile.copy(hasError = !simulationProfile.hasError)
                            )
                            localReloadCounter++
                        },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.ErrorOutline,
                                contentDescription = null,
                                modifier = Modifier.size(14.dp)
                            )
                        },
                        label = { Text("Simulasi Error", fontSize = 10.sp) }
                    )
                }
            }
        }

        // Preview Area with viewport scaling/centering
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF0F172A))
                .padding(if (viewportMode.widthDp != null) 12.dp else 0.dp),
            contentAlignment = Alignment.Center
        ) {
            val previewModifier = if (viewportMode.widthDp != null) {
                Modifier
                    .width(viewportMode.widthDp!!.dp)
                    .fillMaxSize()
                    .shadow(12.dp, RoundedCornerShape(16.dp))
                    .clip(RoundedCornerShape(16.dp))
                    .border(2.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
            } else {
                Modifier.fillMaxSize()
            }

            NativeWebViewRenderer(
                projectDir = projectDir,
                targetUrl = currentWebUrl,
                simulationProfile = simulationProfile,
                reloadTrigger = reloadKey + localReloadCounter,
                onNavigate = { newPage ->
                    if (newPage.isNotBlank() && !newPage.startsWith("http")) {
                        onPageSelected(newPage)
                    }
                },
                modifier = previewModifier
            )
        }
    }

    // Fullscreen Dialog ("Tampilan Penuh Tidak Terpotong")
    if (isFullscreen) {
        Dialog(
            onDismissRequest = { isFullscreen = false },
            properties = DialogProperties(
                usePlatformDefaultWidth = false,
                decorFitsSystemWindows = false
            )
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black)
            ) {
                NativeWebViewRenderer(
                    projectDir = projectDir,
                    targetUrl = currentWebUrl,
                    simulationProfile = simulationProfile,
                    reloadTrigger = reloadKey + localReloadCounter,
                    onNavigate = { onPageSelected(it) },
                    modifier = Modifier.fillMaxSize()
                )

                // Floating minimal top controls in fullscreen
                Surface(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(16.dp),
                    shape = RoundedCornerShape(24.dp),
                    color = Color.Black.copy(alpha = 0.75f),
                    contentColor = Color.White
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = activePage,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                        IconButton(
                            onClick = { localReloadCounter++ },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Reload",
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        IconButton(
                            onClick = { isFullscreen = false },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.FullscreenExit,
                                contentDescription = "Tutup Layar Penuh",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun NativeWebViewRenderer(
    projectDir: File,
    targetUrl: String,
    simulationProfile: SimulationProfile,
    reloadTrigger: Long,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var isLoading by remember { mutableStateOf(true) }
    var webViewRef by remember { mutableStateOf<WebView?>(null) }

    LaunchedEffect(reloadTrigger) {
        webViewRef?.reload()
    }

    LaunchedEffect(targetUrl) {
        webViewRef?.loadUrl(targetUrl)
    }

    Box(modifier = modifier) {
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    webViewRef = this
                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        allowFileAccess = true
                        loadWithOverviewMode = true
                        useWideViewPort = true
                        builtInZoomControls = true
                        displayZoomControls = false
                        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    }

                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                            super.onPageStarted(view, url, favicon)
                            isLoading = true
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            super.onPageFinished(view, url)
                            isLoading = false
                        }

                        override fun shouldInterceptRequest(
                            view: WebView?,
                            request: WebResourceRequest?
                        ): WebResourceResponse? {
                            val uri = request?.url ?: return null
                            val host = uri.host
                            if (host == "hotspot.local" || host == "localhost") {
                                var path = uri.path?.removePrefix("/") ?: ""
                                if (path.isEmpty()) path = "login.html"

                                val requestedFile = File(projectDir, path)

                                val headers = mapOf(
                                    "Access-Control-Allow-Origin" to "*",
                                    "Cache-Control" to "no-cache"
                                )

                                if (path.endsWith(".html") || path.endsWith(".htm")) {
                                    val rawHtml = if (requestedFile.exists()) {
                                        requestedFile.readText()
                                    } else {
                                        "<!DOCTYPE html><html><body><h2>Berkas $path tidak ditemukan</h2></body></html>"
                                    }
                                    val processedHtml = SimulationEngine.processHtml(
                                        rawHtml = rawHtml,
                                        profile = simulationProfile,
                                        currentPage = path
                                    )
                                    val stream = ByteArrayInputStream(processedHtml.toByteArray(Charsets.UTF_8))
                                    return WebResourceResponse("text/html", "UTF-8", 200, "OK", headers, stream)
                                }

                                if (requestedFile.exists() && requestedFile.isFile) {
                                    val mimeType = SimulationEngine.getMimeType(requestedFile.extension)
                                    val stream = FileInputStream(requestedFile)
                                    return WebResourceResponse(mimeType, null, 200, "OK", headers, stream)
                                }
                            }
                            return super.shouldInterceptRequest(view, request)
                        }

                        override fun shouldOverrideUrlLoading(
                            view: WebView?,
                            request: WebResourceRequest?
                        ): Boolean {
                            val uri = request?.url ?: return false
                            if (uri.host == "hotspot.local") {
                                val pageName = uri.path?.removePrefix("/") ?: ""
                                onNavigate(pageName)
                                return false
                            }
                            return false
                        }
                    }

                    loadUrl(targetUrl)
                }
            },
            update = { webView ->
                // Keep reference updated
                webViewRef = webView
            },
            modifier = Modifier.fillMaxSize()
        )

        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(36.dp),
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            webViewRef?.destroy()
        }
    }
}
