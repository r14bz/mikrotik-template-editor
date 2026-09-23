package com.example.data.model

data class ProjectFile(
    val name: String,
    val relativePath: String,
    val isDirectory: Boolean,
    val size: Long = 0,
    val mimeType: String = "",
    val children: List<ProjectFile> = emptyList()
) {
    val extension: String
        get() = if (isDirectory) "" else name.substringAfterLast('.', "").lowercase()

    val isEditableText: Boolean
        get() = extension in listOf("html", "htm", "css", "js", "txt", "json", "xml", "svg", "md")

    val isImage: Boolean
        get() = extension in listOf("png", "jpg", "jpeg", "webp", "gif", "svg", "ico")

    val isFont: Boolean
        get() = extension in listOf("woff", "woff2", "ttf", "otf", "eot")
}
