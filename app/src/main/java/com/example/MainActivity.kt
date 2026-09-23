package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.example.ui.screens.DashboardScreen
import com.example.ui.screens.editor.ProjectWorkspaceScreen
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.HotspotViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: HotspotViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    HotspotApp(viewModel = viewModel)
                }
            }
        }
    }
}

@Composable
fun HotspotApp(viewModel: HotspotViewModel) {
    val activeProject by viewModel.activeProject.collectAsState()

    if (activeProject != null) {
        BackHandler {
            viewModel.closeProject()
        }
        ProjectWorkspaceScreen(
            viewModel = viewModel,
            onNavigateBack = { viewModel.closeProject() }
        )
    } else {
        DashboardScreen(
            viewModel = viewModel,
            onProjectClick = { project ->
                viewModel.openProject(project)
            }
        )
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    androidx.compose.material3.Text(text = "Hello $name!", modifier = modifier)
}
