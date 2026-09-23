package com.example.ui.screens.editor

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.CreateNewFolder
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.FontDownload
import androidx.compose.material.icons.filled.Image
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.NoteAdd
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ProjectFile

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FileBrowserSheet(
    files: List<ProjectFile>,
    onDismiss: () -> Unit,
    onFileClick: (ProjectFile) -> Unit,
    onCreateFile: (String, Boolean) -> Unit,
    onDeleteFile: (String) -> Unit
) {
    var showCreateDialog by remember { mutableStateOf(false) }
    var createIsFolder by remember { mutableStateOf(false) }
    var newFileName by remember { mutableStateOf("") }
    var newFileParentPath by remember { mutableStateOf("") }

    val expandedFolders = remember { mutableStateMapOf<String, Boolean>() }

    ModalBottomSheet(
        onDismissRequest = onDismiss
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp)
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Folder,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Struktur Berkas Template",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.weight(1f))

                IconButton(
                    onClick = {
                        createIsFolder = false
                        newFileParentPath = ""
                        newFileName = ""
                        showCreateDialog = true
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.NoteAdd,
                        contentDescription = "Buat Berkas",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }

                IconButton(
                    onClick = {
                        createIsFolder = true
                        newFileParentPath = ""
                        newFileName = ""
                        showCreateDialog = true
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.CreateNewFolder,
                        contentDescription = "Buat Folder",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Divider()

            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f, fill = false)
                    .padding(horizontal = 8.dp, vertical = 6.dp)
            ) {
                items(files) { item ->
                    FileTreeItemRow(
                        file = item,
                        depth = 0,
                        expandedMap = expandedFolders,
                        onFileClick = {
                            if (it.isDirectory) {
                                val current = expandedFolders[it.relativePath] ?: false
                                expandedFolders[it.relativePath] = !current
                            } else {
                                onFileClick(it)
                                onDismiss()
                            }
                        },
                        onDeleteClick = onDeleteFile,
                        onAddInside = { folderPath ->
                            createIsFolder = false
                            newFileParentPath = folderPath
                            newFileName = ""
                            showCreateDialog = true
                        }
                    )
                }
            }
        }
    }

    if (showCreateDialog) {
        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            title = {
                Text(if (createIsFolder) "Buat Folder Baru" else "Buat Berkas Baru")
            },
            text = {
                Column {
                    if (newFileParentPath.isNotEmpty()) {
                        Text(
                            text = "Lokasi: $newFileParentPath/",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(bottom = 6.dp)
                        )
                    }
                    OutlinedTextField(
                        value = newFileName,
                        onValueChange = { newFileName = it },
                        placeholder = { Text(if (createIsFolder) "nama_folder" else "nama_file.html") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        val trimmed = newFileName.trim()
                        if (trimmed.isNotEmpty()) {
                            val fullPath = if (newFileParentPath.isEmpty()) trimmed else "$newFileParentPath/$trimmed"
                            onCreateFile(fullPath, createIsFolder)
                            showCreateDialog = false
                        }
                    }
                ) {
                    Text("Buat")
                }
            },
            dismissButton = {
                TextButton(onClick = { showCreateDialog = false }) {
                    Text("Batal")
                }
            }
        )
    }
}

@Composable
fun FileTreeItemRow(
    file: ProjectFile,
    depth: Int,
    expandedMap: MutableMap<String, Boolean>,
    onFileClick: (ProjectFile) -> Unit,
    onDeleteClick: (String) -> Unit,
    onAddInside: (String) -> Unit
) {
    val isExpanded = expandedMap[file.relativePath] ?: (depth == 0)
    var showMenu by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onFileClick(file) }
                .padding(vertical = 6.dp, horizontal = (depth * 16 + 8).dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            val icon = getFileIcon(file, isExpanded)
            val iconTint = if (file.isDirectory) Color(0xFFF59E0B) else Color(0xFF38BDF8)

            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = iconTint,
                modifier = Modifier.size(20.dp)
            )

            Spacer(modifier = Modifier.width(8.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = file.name,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = if (file.isDirectory) FontWeight.SemiBold else FontWeight.Normal
                )
                if (!file.isDirectory && file.size > 0) {
                    Text(
                        text = formatFileSize(file.size),
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                        fontSize = 10.sp
                    )
                }
            }

            if (file.isDirectory) {
                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandMore else Icons.Default.ChevronRight,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp),
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Box {
                IconButton(
                    onClick = { showMenu = true },
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.MoreVert,
                        contentDescription = "Opsi",
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                DropdownMenu(
                    expanded = showMenu,
                    onDismissRequest = { showMenu = false }
                ) {
                    if (file.isDirectory) {
                        DropdownMenuItem(
                            text = { Text("Tambah Berkas di sini") },
                            onClick = {
                                showMenu = false
                                onAddInside(file.relativePath)
                            }
                        )
                    }
                    DropdownMenuItem(
                        text = { Text("Hapus", color = MaterialTheme.colorScheme.error) },
                        onClick = {
                            showMenu = false
                            onDeleteClick(file.relativePath)
                        }
                    )
                }
            }
        }

        // Render children if directory is expanded
        if (file.isDirectory && isExpanded) {
            file.children.forEach { child ->
                FileTreeItemRow(
                    file = child,
                    depth = depth + 1,
                    expandedMap = expandedMap,
                    onFileClick = onFileClick,
                    onDeleteClick = onDeleteClick,
                    onAddInside = onAddInside
                )
            }
        }
    }
}

private fun getFileIcon(file: ProjectFile, isExpanded: Boolean): ImageVector {
    return when {
        file.isDirectory -> if (isExpanded) Icons.Default.FolderOpen else Icons.Default.Folder
        file.isImage -> Icons.Default.Image
        file.isFont -> Icons.Default.FontDownload
        file.extension in listOf("html", "htm") -> Icons.Default.Code
        file.extension in listOf("css", "js") -> Icons.Default.Code
        else -> Icons.Default.Description
    }
}

private fun formatFileSize(bytes: Long): String {
    return when {
        bytes >= 1024 * 1024 -> String.format("%.1f MB", bytes / (1024.0 * 1024.0))
        bytes >= 1024 -> String.format("%.1f KB", bytes / 1024.0)
        else -> "$bytes B"
    }
}
