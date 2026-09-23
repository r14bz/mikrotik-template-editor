package com.example.ui.screens.editor

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.viewmodel.HotspotViewModel
import java.io.File

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProjectWorkspaceScreen(
    viewModel: HotspotViewModel,
    onNavigateBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val activeProject by viewModel.activeProject.collectAsState()
    val projectFiles by viewModel.projectFiles.collectAsState()
    val openedFiles by viewModel.openedFiles.collectAsState()
    val activeEditorFile by viewModel.activeEditorFile.collectAsState()
    val activeFileContent by viewModel.activeFileContent.collectAsState()
    val activePreviewPage by viewModel.activePreviewPage.collectAsState()
    val simulationProfile by viewModel.simulationProfile.collectAsState()
    val visualSettings by viewModel.visualSettings.collectAsState()
    val previewReloadKey by viewModel.previewReloadKey.collectAsState()
    val statusMessage by viewModel.statusMessage.collectAsState()

    var selectedTabIndex by remember { mutableIntStateOf(0) } // 0: Preview, 1: Code, 2: Visual, 3: Assets
    var showFileBrowserSheet by remember { mutableStateOf(false) }

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(statusMessage) {
        statusMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearStatusMessage()
        }
    }

    // Export ZIP Launcher
    val exportZipLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.CreateDocument("application/zip")
    ) { uri: Uri? ->
        if (uri != null) {
            viewModel.exportActiveProject(uri)
        }
    }

    val projectDir = viewModel.getActiveProjectDir()

    if (activeProject == null || projectDir == null) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Tidak ada proyek yang aktif.")
        }
        return
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = activeProject!!.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        Text(
                            text = "MikroTik Hotspot Portal",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                            fontSize = 10.sp
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Kembali ke Beranda"
                        )
                    }
                },
                actions = {
                    // Export ZIP Button
                    FilledTonalButton(
                        onClick = {
                            val defaultFileName = "${activeProject!!.name.replace(' ', '_').lowercase()}_hotspot.zip"
                            exportZipLauncher.launch(defaultFileName)
                        },
                        modifier = Modifier
                            .padding(end = 8.dp)
                            .testTag("export_zip_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Download,
                            contentDescription = "Ekspor ZIP",
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Ekspor ZIP", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 4.dp
            ) {
                NavigationBarItem(
                    selected = selectedTabIndex == 0,
                    onClick = { selectedTabIndex = 0 },
                    icon = { Icon(Icons.Default.Visibility, contentDescription = null) },
                    label = { Text("Live Preview") },
                    modifier = Modifier.testTag("nav_tab_preview")
                )
                NavigationBarItem(
                    selected = selectedTabIndex == 1,
                    onClick = { selectedTabIndex = 1 },
                    icon = { Icon(Icons.Default.Code, contentDescription = null) },
                    label = { Text("Editor Kode") },
                    modifier = Modifier.testTag("nav_tab_code")
                )
                NavigationBarItem(
                    selected = selectedTabIndex == 2,
                    onClick = { selectedTabIndex = 2 },
                    icon = { Icon(Icons.Default.AutoAwesome, contentDescription = null) },
                    label = { Text("Kustomisasi") },
                    modifier = Modifier.testTag("nav_tab_visual")
                )
                NavigationBarItem(
                    selected = selectedTabIndex == 3,
                    onClick = { selectedTabIndex = 3 },
                    icon = { Icon(Icons.Default.Image, contentDescription = null) },
                    label = { Text("Aset & Font") },
                    modifier = Modifier.testTag("nav_tab_assets")
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (selectedTabIndex) {
                0 -> {
                    // Live Preview with assets reading & full-screen view
                    LivePreviewContainer(
                        projectDir = projectDir,
                        activePage = activePreviewPage,
                        onPageSelected = { viewModel.setPreviewPage(it) },
                        simulationProfile = simulationProfile,
                        onSimulationProfileChanged = { viewModel.updateSimulationProfile(it) },
                        reloadKey = previewReloadKey,
                        modifier = Modifier.fillMaxSize()
                    )
                }
                1 -> {
                    // Code Editor view
                    CodeEditorView(
                        openedFiles = openedFiles,
                        activeFile = activeEditorFile,
                        fileContent = activeFileContent,
                        onFileSelected = { viewModel.openFileInEditor(it) },
                        onCloseFile = { viewModel.closeFileInEditor(it) },
                        onSaveFile = { path, content -> viewModel.saveEditorFile(path, content) },
                        onOpenFileBrowser = { showFileBrowserSheet = true },
                        modifier = Modifier.fillMaxSize()
                    )
                }
                2 -> {
                    // Visual Customizer
                    VisualCustomizerView(
                        initialSettings = visualSettings,
                        onApplySettings = { viewModel.applyVisualSettings(it) },
                        modifier = Modifier.fillMaxSize()
                    )
                }
                3 -> {
                    // Asset Manager
                    AssetManagerView(
                        projectDir = projectDir,
                        allFiles = projectFiles,
                        onUploadAsset = { uri, path -> viewModel.uploadAsset(uri, path) },
                        onDeleteAsset = { viewModel.deleteFile(it) },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }

    // Modal File Browser
    if (showFileBrowserSheet) {
        FileBrowserSheet(
            files = projectFiles,
            onDismiss = { showFileBrowserSheet = false },
            onFileClick = { file ->
                if (file.isEditableText) {
                    viewModel.openFileInEditor(file.relativePath)
                } else if (file.isImage || file.isFont) {
                    selectedTabIndex = 3 // Jump to Assets tab
                }
            },
            onCreateFile = { path, isFolder -> viewModel.createFileOrFolder(path, isFolder) },
            onDeleteFile = { path -> viewModel.deleteFile(path) }
        )
    }
}
