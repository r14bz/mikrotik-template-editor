package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "projects")
data class ProjectEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val description: String,
    val templateType: String,
    val createdTimestamp: Long,
    val lastModifiedTimestamp: Long
)
