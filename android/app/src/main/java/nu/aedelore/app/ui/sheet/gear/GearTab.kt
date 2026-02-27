package nu.aedelore.app.ui.sheet.gear

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import nu.aedelore.app.domain.gamedata.Classes
import nu.aedelore.app.ui.common.ResourceAdjuster
import nu.aedelore.app.ui.sheet.CharacterSheetViewModel

@Composable
fun GearTab(viewModel: CharacterSheetViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val data = uiState.data
    val cls = Classes.byName(data.characterClass)
    val isMagicClass = cls?.isMagicClass == true

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // Currency
        Text("Currency", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedTextField(
                value = data.gold,
                onValueChange = { viewModel.updateData { d -> d.copy(gold = it) } },
                label = { Text("Gold") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
            OutlinedTextField(
                value = data.silver,
                onValueChange = { viewModel.updateData { d -> d.copy(silver = it) } },
                label = { Text("Silver") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
            OutlinedTextField(
                value = data.copper,
                onValueChange = { viewModel.updateData { d -> d.copy(copper = it) } },
                label = { Text("Copper") },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
        }

        // Consumables
        HorizontalDivider()
        Text("Consumables", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)

        OutlinedTextField(
            value = data.food_water,
            onValueChange = { viewModel.updateData { d -> d.copy(food_water = it) } },
            label = { Text("Food & Water") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        ResourceAdjuster(
            label = "Adrenaline Potions",
            value = data.pot_adrenaline_slider,
            min = 0,
            max = 99,
            onValueChange = { viewModel.updateData { d -> d.copy(pot_adrenaline_slider = it) } },
        )
        ResourceAdjuster(
            label = "Antidote Potions",
            value = data.pot_antidote_slider,
            min = 0,
            max = 99,
            onValueChange = { viewModel.updateData { d -> d.copy(pot_antidote_slider = it) } },
        )
        ResourceAdjuster(
            label = "Poison Potions",
            value = data.pot_poison_slider,
            min = 0,
            max = 99,
            onValueChange = { viewModel.updateData { d -> d.copy(pot_poison_slider = it) } },
        )

        if (isMagicClass) {
            ResourceAdjuster(
                label = "Arcane Elixir",
                value = data.pot_arcane_slider,
                min = 0,
                max = 99,
                onValueChange = { viewModel.updateData { d -> d.copy(pot_arcane_slider = it) } },
            )
        }

        OutlinedTextField(
            value = data.arrows,
            onValueChange = { viewModel.updateData { d -> d.copy(arrows = it) } },
            label = { Text("Arrows") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        ResourceAdjuster(
            label = "Poison Arrows",
            value = data.poison_arrow_slider,
            min = 0,
            max = 99,
            onValueChange = { viewModel.updateData { d -> d.copy(poison_arrow_slider = it) } },
        )

        // Inventory
        HorizontalDivider()
        Text("Inventory", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)

        val inventoryValues = listOf(
            data.inventory_1, data.inventory_2, data.inventory_3,
            data.inventory_4, data.inventory_5, data.inventory_6,
            data.inventory_7, data.inventory_8, data.inventory_9,
            data.inventory_10,
        )

        for (i in 1..10) {
            OutlinedTextField(
                value = inventoryValues[i - 1],
                onValueChange = { newVal ->
                    viewModel.updateData { d ->
                        when (i) {
                            1 -> d.copy(inventory_1 = newVal)
                            2 -> d.copy(inventory_2 = newVal)
                            3 -> d.copy(inventory_3 = newVal)
                            4 -> d.copy(inventory_4 = newVal)
                            5 -> d.copy(inventory_5 = newVal)
                            6 -> d.copy(inventory_6 = newVal)
                            7 -> d.copy(inventory_7 = newVal)
                            8 -> d.copy(inventory_8 = newVal)
                            9 -> d.copy(inventory_9 = newVal)
                            10 -> d.copy(inventory_10 = newVal)
                            else -> d
                        }
                    }
                },
                label = { Text("Slot $i") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
            )
        }

        // Quest Items
        HorizontalDivider()
        Text("Quest Items", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)

        if (uiState.questItems.isEmpty()) {
            Text(
                "No quest items yet (given by DM)",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        } else {
            uiState.questItems.forEachIndexed { index, item ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant,
                    ),
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(item.name, fontWeight = FontWeight.SemiBold)
                        if (item.description.isNotBlank()) {
                            Text(item.description, style = MaterialTheme.typography.bodySmall)
                        }
                        if (item.sessionName != null) {
                            Text(
                                "Given in: ${item.sessionName}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                        TextButton(onClick = { viewModel.archiveQuestItem(index) }) {
                            Text("Archive")
                        }
                    }
                }
            }
        }

        // Archived Quest Items
        if (uiState.archivedQuestItems.isNotEmpty()) {
            var showArchived by remember { mutableStateOf(false) }
            TextButton(onClick = { showArchived = !showArchived }) {
                Text(
                    if (showArchived) "Hide Archived (${uiState.archivedQuestItems.size})"
                    else "Show Archived (${uiState.archivedQuestItems.size})"
                )
            }
            if (showArchived) {
                uiState.archivedQuestItems.forEachIndexed { index, item ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        ),
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(item.name, fontWeight = FontWeight.SemiBold)
                            TextButton(onClick = { viewModel.unarchiveQuestItem(index) }) {
                                Text("Restore")
                            }
                        }
                    }
                }
            }
        }

        // Notes
        HorizontalDivider()
        Text("Notes", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = data.inventory_freetext,
            onValueChange = { viewModel.updateData { d -> d.copy(inventory_freetext = it) } },
            label = { Text("Inventory Notes") },
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 100.dp),
            maxLines = 10,
        )
        OutlinedTextField(
            value = data.notes_freetext,
            onValueChange = { viewModel.updateData { d -> d.copy(notes_freetext = it) } },
            label = { Text("Quest Notes") },
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 100.dp),
            maxLines = 10,
        )

        Spacer(modifier = Modifier.height(32.dp))
    }
}
