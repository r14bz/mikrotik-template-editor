package com.example.ui.viewmodel

import android.app.Application
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.db.AppDatabase
import com.example.data.model.ProjectEntity
import com.example.data.model.ProjectFile
import com.example.data.model.VisualSettings
import com.example.data.repository.TemplateRepository
import com.example.util.SimulationProfile
import com.example.util.VisualCustomizer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.io.File

class HotspotViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: TemplateRepository

    val projects: StateFlow<List<ProjectEntity>>

    private val _activeProject = MutableStateFlow<ProjectEntity?>(null)
    val activeProject: StateFlow<ProjectEntity?> = _activeProject.asStateFlow()

    private val _projectFiles = MutableStateFlow<List<ProjectFile>>(emptyList())
    val projectFiles: StateFlow<List<ProjectFile>> = _projectFiles.asStateFlow()

    private val _openedFiles = MutableStateFlow<List<String>>(listOf("login.html"))
    val openedFiles: StateFlow<List<String>> = _openedFiles.asStateFlow()

    private val _activeEditorFile = MutableStateFlow<String?>("login.html")
    val activeEditorFile: StateFlow<String?> = _activeEditorFile.asStateFlow()

    private val _activeFileContent = MutableStateFlow("")
    val activeFileContent: StateFlow<String> = _activeFileContent.asStateFlow()

    private val _activePreviewPage = MutableStateFlow("login.html")
    val activePreviewPage: StateFlow<String> = _activePreviewPage.asStateFlow()

    private val _simulationProfile = MutableStateFlow(SimulationProfile())
    val simulationProfile: StateFlow<SimulationProfile> = _simulationProfile.asStateFlow()

    private val _visualSettings = MutableStateFlow(VisualSettings())
    val visualSettings: StateFlow<VisualSettings> = _visualSettings.asStateFlow()

    private val _previewReloadKey = MutableStateFlow(System.currentTimeMillis())
    val previewReloadKey: StateFlow<Long> = _previewReloadKey.asStateFlow()

    private val _statusMessage = MutableStateFlow<String?>(null)
    val statusMessage: StateFlow<String?> = _statusMessage.asStateFlow()

    init {
        val database = AppDatabase.getInstance(application)
        repository = TemplateRepository(application, database.projectDao())

        projects = repository.allProjects.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

        viewModelScope.launch {
            repository.initializeDefaultTemplatesIfNeeded()
        }
    }

    fun openProject(project: ProjectEntity) {
        _activeProject.value = project
        _openedFiles.value = listOf("login.html")
        _activeEditorFile.value = "login.html"
        _activePreviewPage.value = "login.html"
        refreshProjectFiles()
        loadEditorFileContent("login.html")
        loadVisualSettings()
        triggerPreviewReload()
    }

    fun closeProject() {
        _activeProject.value = null
        _projectFiles.value = emptyList()
        _openedFiles.value = emptyList()
        _activeEditorFile.value = null
        _activeFileContent.value = ""
    }

    fun getActiveProjectDir(): File? {
        val id = _activeProject.value?.id ?: return null
        return repository.getProjectDir(id)
    }

    fun refreshProjectFiles() {
        val project = _activeProject.value ?: return
        viewModelScope.launch {
            val files = repository.getProjectFiles(project.id)
            _projectFiles.value = files
        }
    }

    fun openFileInEditor(relativePath: String) {
        val currentOpen = _openedFiles.value.toMutableList()
        if (!currentOpen.contains(relativePath)) {
            currentOpen.add(relativePath)
            _openedFiles.value = currentOpen
        }
        _activeEditorFile.value = relativePath
        loadEditorFileContent(relativePath)
    }

    fun closeFileInEditor(relativePath: String) {
        val currentOpen = _openedFiles.value.toMutableList()
        currentOpen.remove(relativePath)
        _openedFiles.value = currentOpen
        if (_activeEditorFile.value == relativePath) {
            val nextFile = currentOpen.lastOrNull()
            _activeEditorFile.value = nextFile
            if (nextFile != null) {
                loadEditorFileContent(nextFile)
            } else {
                _activeFileContent.value = ""
            }
        }
    }

    private fun loadEditorFileContent(relativePath: String) {
        val project = _activeProject.value ?: return
        viewModelScope.launch {
            val content = repository.readTextFile(project.id, relativePath)
            _activeFileContent.value = content
        }
    }

    fun saveEditorFile(relativePath: String, content: String) {
        val project = _activeProject.value ?: return
        viewModelScope.launch {
            val success = repository.writeTextFile(project.id, relativePath, content)
            if (success) {
                _activeFileContent.value = content
                triggerPreviewReload()
                loadVisualSettings()
            }
        }
    }

    fun setPreviewPage(page: String) {
        _activePreviewPage.value = page
        triggerPreviewReload()
    }

    fun updateSimulationProfile(profile: SimulationProfile) {
        _simulationProfile.value = profile
        triggerPreviewReload()
    }

    fun triggerPreviewReload() {
        _previewReloadKey.value = System.currentTimeMillis()
    }

    fun applyVisualSettings(settings: VisualSettings) {
        val project = _activeProject.value ?: return
        viewModelScope.launch {
            _visualSettings.value = settings
            // Read login.html and css/style.css
            val currentHtml = repository.readTextFile(project.id, "login.html")
            val currentCss = repository.readTextFile(project.id, "css/style.css")

            val updatedHtml = VisualCustomizer.applySettingsToHtml(currentHtml, settings)
            val updatedCss = VisualCustomizer.applySettingsToCss(currentCss, settings)

            repository.writeTextFile(project.id, "login.html", updatedHtml)
            repository.writeTextFile(project.id, "css/style.css", updatedCss)

            if (_activeEditorFile.value == "login.html") {
                _activeFileContent.value = updatedHtml
            } else if (_activeEditorFile.value == "css/style.css") {
                _activeFileContent.value = updatedCss
            }

            triggerPreviewReload()
            _statusMessage.value = "Kustomisasi visual berhasil diterapkan!"
        }
    }

    private fun loadVisualSettings() {
        val project = _activeProject.value ?: return
        viewModelScope.launch {
            val html = repository.readTextFile(project.id, "login.html")
            val css = repository.readTextFile(project.id, "css/style.css")
            _visualSettings.value = VisualCustomizer.extractSettingsFromHtml(html, css)
        }
    }

    fun createFileOrFolder(relativePath: String, isFolder: Boolean) {
        val project = _activeProject.value ?: return
        viewModelScope.launch {
            val success = repository.createFileOrFolder(project.id, relativePath, isFolder)
            if (success) {
                refreshProjectFiles()
                if (!isFolder) {
                    openFileInEditor(relativePath)
                }
            }
        }
    }

    fun deleteFile(relativePath: String) {
        val project = _activeProject.value ?: return
        viewModelScope.launch {
            val success = repository.deleteFile(project.id, relativePath)
            if (success) {
                closeFileInEditor(relativePath)
                refreshProjectFiles()
                triggerPreviewReload()
            }
        }
    }

    fun uploadAsset(uri: Uri, destRelativePath: String) {
        val project = _activeProject.value ?: return
        viewModelScope.launch {
            val stream = getApplication<Application>().contentResolver.openInputStream(uri)
            if (stream != null) {
                val success = repository.saveBinaryFile(project.id, destRelativePath, stream)
                if (success) {
                    refreshProjectFiles()
                    triggerPreviewReload()
                    _statusMessage.value = "Aset berhasil diupload!"
                }
            }
        }
    }

    fun createProjectFromPreset(name: String, presetType: String) {
        viewModelScope.launch {
            val newProject = repository.createPresetProject(
                name = name,
                description = "Template MikroTik dibuat dari preset $presetType",
                type = presetType
            )
            openProject(newProject)
        }
    }

    fun importZipTemplate(uri: Uri, customName: String? = null) {
        viewModelScope.launch {
            val result = repository.importProjectFromZip(uri, customName)
            result.onSuccess { project ->
                _statusMessage.value = "Template '${project.name}' berhasil diimpor!"
                openProject(project)
            }.onFailure { error ->
                _statusMessage.value = "Gagal mengimpor ZIP: ${error.localizedMessage}"
            }
        }
    }

    fun exportActiveProject(targetUri: Uri) {
        val project = _activeProject.value ?: return
        viewModelScope.launch {
            try {
                val outputStream = getApplication<Application>().contentResolver.openOutputStream(targetUri)
                if (outputStream != null) {
                    val result = repository.exportProjectToZip(project.id, outputStream)
                    result.onSuccess {
                        _statusMessage.value = "Berhasil mengekspor template '${project.name}.zip'!"
                    }.onFailure { err ->
                        _statusMessage.value = "Gagal mengekspor: ${err.localizedMessage}"
                    }
                }
            } catch (e: Exception) {
                _statusMessage.value = "Gagal menulis berkas ekspor: ${e.localizedMessage}"
            }
        }
    }

    fun duplicateProject(projectId: String, newName: String) {
        viewModelScope.launch {
            val project = repository.duplicateProject(projectId, newName)
            if (project != null) {
                _statusMessage.value = "Template diduplikasi: $newName"
            }
        }
    }

    fun deleteProject(projectId: String) {
        viewModelScope.launch {
            repository.deleteProject(projectId)
            if (_activeProject.value?.id == projectId) {
                closeProject()
            }
        }
    }

    fun clearStatusMessage() {
        _statusMessage.value = null
    }
}
