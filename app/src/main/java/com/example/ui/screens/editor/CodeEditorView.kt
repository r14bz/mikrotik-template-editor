package com.example.ui.screens.editor

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.FindInPage
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.util.MikrotikTags

@Composable
fun CodeEditorView(
    openedFiles: List<String>,
    activeFile: String?,
    fileContent: String,
    onFileSelected: (String) -> Unit,
    onCloseFile: (String) -> Unit,
    onSaveFile: (String, String) -> Unit,
    onOpenFileBrowser: () -> Unit,
    modifier: Modifier = Modifier
) {
    var editorState by remember(activeFile, fileContent) {
        mutableStateOf(TextFieldValue(fileContent))
    }
    val isDirty by remember(editorState, fileContent) {
        derivedStateOf { editorState.text != fileContent }
    }
    var showSearch by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    var saveSuccessAnim by remember { mutableStateOf(false) }

    LaunchedEffect(saveSuccessAnim) {
        if (saveSuccessAnim) {
            kotlinx.coroutines.delay(1800)
            saveSuccessAnim = false
        }
    }

    Column(modifier = modifier.fillMaxSize()) {
        // Tab Row for Open Files & File Browser Button
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.surfaceVariant,
            tonalElevation = 1.dp
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onOpenFileBrowser,
                    modifier = Modifier
                        .padding(start = 6.dp)
                        .size(38.dp)
                        .testTag("file_explorer_toggle_button")
                ) {
                    Icon(
                        imageVector = Icons.Default.Folder,
                        contentDescription = "Buka Berkas",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }

                if (openedFiles.isNotEmpty()) {
                    ScrollableTabRow(
                        selectedTabIndex = openedFiles.indexOf(activeFile).coerceAtLeast(0),
                        modifier = Modifier.weight(1f),
                        edgePadding = 8.dp,
                        containerColor = Color.Transparent,
                        divider = {}
                    ) {
                        openedFiles.forEach { filePath ->
                            val isSelected = filePath == activeFile
                            val fileName = filePath.substringAfterLast('/')
                            Tab(
                                selected = isSelected,
                                onClick = { onFileSelected(filePath) },
                                text = {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = if (isSelected && isDirty) "$fileName*" else fileName,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                            fontSize = 12.sp,
                                            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        Spacer(modifier = Modifier.width(4.dp))
                                        IconButton(
                                            onClick = { onCloseFile(filePath) },
                                            modifier = Modifier.size(18.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.Default.Close,
                                                contentDescription = "Tutup Tab",
                                                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f),
                                                modifier = Modifier.size(12.dp)
                                            )
                                        }
                                    }
                                }
                            )
                        }
                    }
                } else {
                    Text(
                        text = "Pilih berkas dari folder...",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 12.dp)
                    )
                }

                // Action icons: Search & Save
                IconButton(
                    onClick = { showSearch = !showSearch },
                    modifier = Modifier.size(36.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Cari Teks",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Button(
                    onClick = {
                        if (activeFile != null) {
                            onSaveFile(activeFile, editorState.text)
                            saveSuccessAnim = true
                        }
                    },
                    enabled = isDirty,
                    modifier = Modifier
                        .padding(end = 8.dp)
                        .height(34.dp)
                        .testTag("save_file_button"),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 10.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (saveSuccessAnim) Color(0xFF10B981) else MaterialTheme.colorScheme.primary
                    )
                ) {
                    Icon(
                        imageVector = if (saveSuccessAnim) Icons.Default.Check else Icons.Default.Save,
                        contentDescription = "Simpan",
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = if (saveSuccessAnim) "Tersimpan" else "Simpan",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Search Bar (if visible)
        AnimatedVisibility(visible = showSearch) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 2.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextField(
                        value = searchQuery,
                        onValueChange = { searchQuery = it },
                        placeholder = { Text("Cari tag / kata kunci...", fontSize = 12.sp) },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp),
                        singleLine = true,
                        textStyle = TextStyle(fontSize = 13.sp),
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent
                        )
                    )
                    IconButton(onClick = { showSearch = false }) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Tutup Pencarian")
                    }
                }
            }
        }

        // MikroTik Variable Quick Insertion Toolbar
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = Color(0xFF1E293B)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 8.dp, vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "TAGS:",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF38BDF8),
                    modifier = Modifier.padding(end = 6.dp)
                )

                MikrotikTags.TAGS.forEach { tagItem ->
                    AssistChip(
                        onClick = {
                            val currentText = editorState.text
                            val selection = editorState.selection
                            val insertSnippet = tagItem.snippet
                            val newText = if (selection.start != selection.end) {
                                currentText.replaceRange(selection.min, selection.max, insertSnippet)
                            } else {
                                StringBuilder(currentText).insert(selection.start, insertSnippet).toString()
                            }
                            val newPos = selection.start + insertSnippet.length
                            editorState = TextFieldValue(
                                text = newText,
                                selection = androidx.compose.ui.text.TextRange(newPos)
                            )
                        },
                        label = {
                            Text(
                                text = tagItem.label,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                color = Color(0xFFE2E8F0)
                            )
                        },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = Color(0xFF334155).copy(alpha = 0.7f)
                        ),
                        border = null,
                        modifier = Modifier
                            .padding(end = 6.dp)
                            .height(28.dp)
                    )
                }
            }
        }

        // Code Editor Body with Line Numbers
        if (activeFile != null) {
            val lines = remember(editorState.text) {
                val count = editorState.text.count { it == '\n' } + 1
                (1..count).toList()
            }
            val verticalScrollState = rememberScrollState()

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0F172A))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxSize()
                        .verticalScroll(verticalScrollState)
                ) {
                    // Line numbers gutter
                    Column(
                        modifier = Modifier
                            .background(Color(0xFF0B132B))
                            .padding(horizontal = 8.dp, vertical = 8.dp)
                            .fillMaxHeight(),
                        horizontalAlignment = Alignment.End
                    ) {
                        lines.forEach { lineNum ->
                            Text(
                                text = lineNum.toString(),
                                color = Color(0xFF475569),
                                fontFamily = FontFamily.Monospace,
                                fontSize = 12.sp,
                                lineHeight = 20.sp
                            )
                        }
                    }

                    // Code text area
                    BasicTextField(
                        value = editorState,
                        onValueChange = { editorState = it },
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .padding(horizontal = 12.dp, vertical = 8.dp)
                            .testTag("code_editor_input"),
                        textStyle = TextStyle(
                            color = Color(0xFFE2E8F0),
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp,
                            lineHeight = 20.sp
                        ),
                        cursorBrush = SolidColor(Color(0xFF38BDF8))
                    )
                }
            }
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(MaterialTheme.colorScheme.background),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(
                        imageVector = Icons.Default.Code,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary.copy(alpha = 0.5f),
                        modifier = Modifier.size(54.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = "Tidak ada berkas yang terbuka",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Ketuk ikon folder untuk memilih berkas yang ingin diedit",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = onOpenFileBrowser,
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary)
                    ) {
                        Icon(imageVector = Icons.Default.Folder, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Buka Penjelajah Berkas")
                    }
                }
            }
        }
    }
}
