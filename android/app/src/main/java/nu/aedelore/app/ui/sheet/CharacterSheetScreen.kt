package nu.aedelore.app.ui.sheet

import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import kotlinx.coroutines.launch
import nu.aedelore.app.domain.util.CharacterExporter
import nu.aedelore.app.ui.common.StatusBar
import nu.aedelore.app.ui.sheet.abilities.AbilitiesTab
import nu.aedelore.app.ui.sheet.character.CharacterTab
import nu.aedelore.app.ui.sheet.combat.CombatTab
import nu.aedelore.app.ui.sheet.gear.GearTab
import nu.aedelore.app.ui.sheet.overview.OverviewTab
import nu.aedelore.app.ui.sheet.stats.StatsTab
import nu.aedelore.app.ui.sheet.tools.ToolsTab

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CharacterSheetScreen(
    viewModel: CharacterSheetViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit,
) {
    val uiState by viewModel.uiState.collectAsState()
    val tabs = SheetTab.entries
    val pagerState = rememberPagerState(pageCount = { tabs.size })
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    var showMenu by remember { mutableStateOf(false) }

    // Import launcher
    val importLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            val inputStream = context.contentResolver.openInputStream(it)
            val jsonString = inputStream?.bufferedReader()?.readText()
            inputStream?.close()
            if (jsonString != null) {
                val imported = CharacterExporter.importFromJson(jsonString)
                if (imported != null) {
                    viewModel.updateData { imported }
                }
            }
        }
    }

    LaunchedEffect(pagerState.currentPage) {
        viewModel.selectTab(tabs[pagerState.currentPage])
    }

    Scaffold(
        topBar = {
            Column {
                TopAppBar(
                    title = {
                        Column {
                            Text(
                                text = uiState.data.character_name.ifBlank { "New Character" },
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis,
                                fontWeight = FontWeight.Bold,
                            )
                            // Save indicator
                            when (uiState.saveState) {
                                SaveState.SAVING -> Text(
                                    "Saving...",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                                SaveState.SAVED -> Text(
                                    "Saved",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.primary,
                                )
                                SaveState.ERROR -> Text(
                                    "Save failed",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.error,
                                )
                                SaveState.IDLE -> {}
                            }
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = {
                            viewModel.saveToServer()
                            onNavigateBack()
                        }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                        }
                    },
                    actions = {
                        IconButton(onClick = { showMenu = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "More")
                        }
                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false },
                        ) {
                            DropdownMenuItem(
                                text = { Text("Export JSON") },
                                onClick = {
                                    showMenu = false
                                    val jsonStr = CharacterExporter.exportToJson(uiState.data)
                                    val sendIntent = Intent().apply {
                                        action = Intent.ACTION_SEND
                                        putExtra(Intent.EXTRA_TEXT, jsonStr)
                                        putExtra(Intent.EXTRA_SUBJECT,
                                            "${uiState.data.character_name.ifBlank { "character" }}.json")
                                        type = "application/json"
                                    }
                                    context.startActivity(Intent.createChooser(sendIntent, "Export Character"))
                                },
                            )
                            DropdownMenuItem(
                                text = { Text("Import JSON") },
                                onClick = {
                                    showMenu = false
                                    importLauncher.launch("application/json")
                                },
                            )
                        }
                    },
                )

                // Tab row
                ScrollableTabRow(
                    selectedTabIndex = pagerState.currentPage,
                    edgePadding = 0.dp,
                ) {
                    tabs.forEachIndexed { index, tab ->
                        Tab(
                            selected = pagerState.currentPage == index,
                            onClick = {
                                coroutineScope.launch {
                                    pagerState.animateScrollToPage(index)
                                }
                            },
                            text = { Text(tab.title) },
                        )
                    }
                }
            }
        },
        bottomBar = {
            if (!uiState.isLoading && uiState.data.character_name.isNotBlank()) {
                StatusBar(data = uiState.data)
            }
        },
    ) { padding ->
        if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator()
            }
        } else if (uiState.error != null && uiState.data.character_name.isBlank()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = uiState.error!!,
                        color = MaterialTheme.colorScheme.error,
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = onNavigateBack) {
                        Text("Go Back")
                    }
                }
            }
        } else {
            HorizontalPager(
                state = pagerState,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
            ) { page ->
                when (tabs[page]) {
                    SheetTab.OVERVIEW -> OverviewTab(viewModel)
                    SheetTab.CHARACTER -> CharacterTab(viewModel)
                    SheetTab.STATS -> StatsTab(viewModel)
                    SheetTab.COMBAT -> CombatTab(viewModel)
                    SheetTab.ABILITIES -> AbilitiesTab(viewModel)
                    SheetTab.GEAR -> GearTab(viewModel)
                    SheetTab.TOOLS -> ToolsTab(viewModel)
                }
            }
        }
    }
}
