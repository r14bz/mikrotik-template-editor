package com.example.data.repository

import android.content.Context
import android.net.Uri
import com.example.data.db.ProjectDao
import com.example.data.model.ProjectEntity
import com.example.data.model.ProjectFile
import com.example.util.SimulationEngine
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.io.OutputStream
import java.util.UUID
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

class TemplateRepository(
    private val context: Context,
    private val projectDao: ProjectDao
) {
    private val baseProjectsDir: File
        get() = File(context.filesDir, "projects").apply { if (!exists()) mkdirs() }

    val allProjects: Flow<List<ProjectEntity>> = projectDao.getAllProjects()

    suspend fun getProject(id: String): ProjectEntity? = projectDao.getProjectById(id)

    fun getProjectDir(projectId: String): File {
        return File(baseProjectsDir, projectId).apply { if (!exists()) mkdirs() }
    }

    /**
     * Initializes default starter templates if the database is empty.
     */
    suspend fun initializeDefaultTemplatesIfNeeded() = withContext(Dispatchers.IO) {
        val existing = projectDao.getProjectById("preset_modern")
        if (existing == null) {
            createPresetProject(
                id = "preset_modern",
                name = "VoltNet Modern Voucher",
                description = "Template MikroTik responsif dengan tab voucher & member, QR scan, dan tabel paket.",
                type = "modern"
            )
            createPresetProject(
                id = "preset_cafe",
                name = "Kopi & Cerita Wi-Fi",
                description = "Template hangat minimalis untuk kafe, restoran, dan lounge dengan struk kode akses.",
                type = "cafe"
            )
            createPresetProject(
                id = "preset_cyberglow",
                name = "CyberGlow Fiber Dark",
                description = "Template dark mode bernuansa cyberpunk untuk ISP dan hotspot fiber berkecepatan tinggi.",
                type = "cyberglow"
            )
        }
    }

    suspend fun createPresetProject(
        id: String = UUID.randomUUID().toString(),
        name: String,
        description: String,
        type: String
    ): ProjectEntity = withContext(Dispatchers.IO) {
        val now = System.currentTimeMillis()
        val project = ProjectEntity(
            id = id,
            name = name,
            description = description,
            templateType = type,
            createdTimestamp = now,
            lastModifiedTimestamp = now
        )

        val projectDir = getProjectDir(id)
        projectDir.deleteRecursively()
        projectDir.mkdirs()

        // Create folders
        val cssDir = File(projectDir, "css").apply { mkdirs() }
        val jsDir = File(projectDir, "js").apply { mkdirs() }
        val assetsDir = File(projectDir, "assets").apply { mkdirs() }
        File(projectDir, "fonts").apply { mkdirs() }

        // Common files
        File(cssDir, "style.css").writeText(DefaultTemplates.MODERN_CSS)
        File(jsDir, "main.js").writeText(DefaultTemplates.MODERN_JS)
        File(assetsDir, "logo.svg").writeText(DefaultTemplates.MODERN_LOGO_SVG)
        File(projectDir, "status.html").writeText(DefaultTemplates.MODERN_STATUS_HTML)
        File(projectDir, "logout.html").writeText(DefaultTemplates.MODERN_LOGOUT_HTML)
        File(projectDir, "alogin.html").writeText("<html><head><meta http-equiv=\"refresh\" content=\"2; url=$(link-status)\"></head><body><h3>Connecting...</h3></body></html>")
        File(projectDir, "errors.txt").writeText("voucher expired\ninvalid username or password\nsimultaneous session limit reached")

        when (type) {
            "cafe" -> {
                File(projectDir, "login.html").writeText(DefaultTemplates.CAFE_LOGIN_HTML)
            }
            "cyberglow" -> {
                File(projectDir, "login.html").writeText(DefaultTemplates.CYBERGLOW_LOGIN_HTML)
            }
            else -> {
                File(projectDir, "login.html").writeText(DefaultTemplates.MODERN_LOGIN_HTML)
            }
        }

        projectDao.insertProject(project)
        project
    }

    /**
     * Imports a user-uploaded ZIP file into a new project.
     * Safely unpacks all files (html, css, js, fonts, assets) preserving the folder structure.
     */
    suspend fun importProjectFromZip(
        zipUri: Uri,
        customName: String? = null
    ): Result<ProjectEntity> = withContext(Dispatchers.IO) {
        try {
            val projectId = UUID.randomUUID().toString()
            val projectDir = getProjectDir(projectId)
            projectDir.deleteRecursively()
            projectDir.mkdirs()

            var extractedFileCount = 0
            val tempDir = File(projectDir, "_temp_extract").apply { mkdirs() }

            context.contentResolver.openInputStream(zipUri)?.use { rawInputStream ->
                ZipInputStream(rawInputStream).use { zis ->
                    var entry: ZipEntry? = zis.nextEntry
                    while (entry != null) {
                        val entryName = entry.name
                        // Prevent Zip Slip vulnerability
                        val targetFile = File(tempDir, entryName)
                        val canonicalDest = targetFile.canonicalPath
                        val canonicalDir = tempDir.canonicalPath
                        if (!canonicalDest.startsWith(canonicalDir + File.separator) && canonicalDest != canonicalDir) {
                            throw SecurityException("ZIP traversal attack attempt detected: $entryName")
                        }

                        if (entry.isDirectory) {
                            targetFile.mkdirs()
                        } else {
                            targetFile.parentFile?.mkdirs()
                            FileOutputStream(targetFile).use { fos ->
                                zis.copyTo(fos)
                            }
                            extractedFileCount++
                        }
                        zis.closeEntry()
                        entry = zis.nextEntry
                    }
                }
            } ?: return@withContext Result.failure(Exception("Cannot open ZIP input stream"))

            // Check if extracted files are nested inside a single root folder (e.g. hotspot/login.html)
            val subFiles = tempDir.listFiles() ?: emptyArray()
            val effectiveSourceDir = if (subFiles.size == 1 && subFiles[0].isDirectory) {
                subFiles[0]
            } else {
                tempDir
            }

            // Move contents from effectiveSourceDir to projectDir
            effectiveSourceDir.listFiles()?.forEach { file ->
                file.copyRecursively(File(projectDir, file.name), overwrite = true)
            }
            tempDir.deleteRecursively()

            // If login.html does not exist, check if there is an index.html and create login.html
            val loginFile = File(projectDir, "login.html")
            if (!loginFile.exists()) {
                val indexFile = File(projectDir, "index.html")
                if (indexFile.exists()) {
                    indexFile.copyTo(loginFile)
                } else {
                    // Create minimal login.html so project is functional
                    loginFile.writeText(DefaultTemplates.MODERN_LOGIN_HTML)
                }
            }

            val derivedName = customName?.takeIf { it.isNotBlank() }
                ?: (zipUri.lastPathSegment?.substringAfterLast('/')?.removeSuffix(".zip")?.takeIf { it.isNotBlank() }
                    ?: "Hotspot Import ${System.currentTimeMillis() % 1000}")

            val now = System.currentTimeMillis()
            val project = ProjectEntity(
                id = projectId,
                name = derivedName,
                description = "Template diimpor dari file ZIP ($extractedFileCount berkas).",
                templateType = "custom_zip",
                createdTimestamp = now,
                lastModifiedTimestamp = now
            )

            projectDao.insertProject(project)
            Result.success(project)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Exports the entire project directory into a standard ZIP output stream.
     */
    suspend fun exportProjectToZip(
        projectId: String,
        outputStream: OutputStream
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val projectDir = getProjectDir(projectId)
            if (!projectDir.exists()) {
                return@withContext Result.failure(Exception("Project directory not found"))
            }

            ZipOutputStream(outputStream).use { zos ->
                fun addFileToZip(file: File, relativePath: String) {
                    if (file.isDirectory) {
                        val children = file.listFiles() ?: return
                        for (child in children) {
                            val childRelative = if (relativePath.isEmpty()) child.name else "$relativePath/${child.name}"
                            addFileToZip(child, childRelative)
                        }
                    } else {
                        zos.putNextEntry(ZipEntry(relativePath))
                        FileInputStream(file).use { fis ->
                            fis.copyTo(zos)
                        }
                        zos.closeEntry()
                    }
                }

                val topFiles = projectDir.listFiles() ?: emptyArray()
                for (topFile in topFiles) {
                    addFileToZip(topFile, topFile.name)
                }
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getProjectFiles(projectId: String): List<ProjectFile> = withContext(Dispatchers.IO) {
        val projectDir = getProjectDir(projectId)
        fun buildTree(dir: File, relativeBase: String): List<ProjectFile> {
            val files = dir.listFiles() ?: return emptyList()
            return files.sortedWith(compareBy({ !it.isDirectory }, { it.name.lowercase() }))
                .map { file ->
                    val relativePath = if (relativeBase.isEmpty()) file.name else "$relativeBase/${file.name}"
                    val isDir = file.isDirectory
                    val children = if (isDir) buildTree(file, relativePath) else emptyList()
                    ProjectFile(
                        name = file.name,
                        relativePath = relativePath,
                        isDirectory = isDir,
                        size = if (isDir) 0 else file.length(),
                        mimeType = if (isDir) "" else SimulationEngine.getMimeType(file.extension),
                        children = children
                    )
                }
        }
        buildTree(projectDir, "")
    }

    suspend fun readTextFile(projectId: String, relativePath: String): String = withContext(Dispatchers.IO) {
        val target = File(getProjectDir(projectId), relativePath)
        if (target.exists() && target.isFile) {
            target.readText()
        } else {
            ""
        }
    }

    suspend fun writeTextFile(projectId: String, relativePath: String, content: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val target = File(getProjectDir(projectId), relativePath)
            target.parentFile?.mkdirs()
            target.writeText(content)
            touchProjectModified(projectId)
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun saveBinaryFile(projectId: String, relativePath: String, inputStream: InputStream): Boolean = withContext(Dispatchers.IO) {
        try {
            val target = File(getProjectDir(projectId), relativePath)
            target.parentFile?.mkdirs()
            FileOutputStream(target).use { fos ->
                inputStream.copyTo(fos)
            }
            touchProjectModified(projectId)
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun createFileOrFolder(projectId: String, relativePath: String, isFolder: Boolean): Boolean = withContext(Dispatchers.IO) {
        try {
            val target = File(getProjectDir(projectId), relativePath)
            val success = if (isFolder) {
                target.mkdirs()
            } else {
                target.parentFile?.mkdirs()
                if (!target.exists()) target.createNewFile() else true
            }
            if (success) touchProjectModified(projectId)
            success
        } catch (e: Exception) {
            false
        }
    }

    suspend fun deleteFile(projectId: String, relativePath: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val target = File(getProjectDir(projectId), relativePath)
            val success = target.deleteRecursively()
            if (success) touchProjectModified(projectId)
            success
        } catch (e: Exception) {
            false
        }
    }

    suspend fun renameFile(projectId: String, oldRelativePath: String, newName: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val oldFile = File(getProjectDir(projectId), oldRelativePath)
            val newFile = File(oldFile.parentFile, newName)
            val success = oldFile.renameTo(newFile)
            if (success) touchProjectModified(projectId)
            success
        } catch (e: Exception) {
            false
        }
    }

    suspend fun duplicateProject(projectId: String, newName: String): ProjectEntity? = withContext(Dispatchers.IO) {
        try {
            val sourceProject = projectDao.getProjectById(projectId) ?: return@withContext null
            val newId = UUID.randomUUID().toString()
            val now = System.currentTimeMillis()
            val duplicated = ProjectEntity(
                id = newId,
                name = newName,
                description = "Salinan dari ${sourceProject.name}",
                templateType = sourceProject.templateType,
                createdTimestamp = now,
                lastModifiedTimestamp = now
            )

            val sourceDir = getProjectDir(projectId)
            val targetDir = getProjectDir(newId)
            targetDir.deleteRecursively()
            sourceDir.copyRecursively(targetDir, overwrite = true)

            projectDao.insertProject(duplicated)
            duplicated
        } catch (e: Exception) {
            null
        }
    }

    suspend fun deleteProject(projectId: String) = withContext(Dispatchers.IO) {
        getProjectDir(projectId).deleteRecursively()
        projectDao.deleteProjectById(projectId)
    }

    suspend fun updateProjectDetails(projectId: String, name: String, description: String) = withContext(Dispatchers.IO) {
        val existing = projectDao.getProjectById(projectId) ?: return@withContext
        val updated = existing.copy(
            name = name,
            description = description,
            lastModifiedTimestamp = System.currentTimeMillis()
        )
        projectDao.updateProject(updated)
    }

    private suspend fun touchProjectModified(projectId: String) {
        val existing = projectDao.getProjectById(projectId) ?: return
        projectDao.updateProject(existing.copy(lastModifiedTimestamp = System.currentTimeMillis()))
    }
}
