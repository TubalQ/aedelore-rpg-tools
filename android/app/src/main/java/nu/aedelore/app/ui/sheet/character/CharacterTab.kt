package nu.aedelore.app.ui.sheet.character

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
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import nu.aedelore.app.domain.gamedata.Classes
import nu.aedelore.app.domain.gamedata.Races
import nu.aedelore.app.domain.gamedata.Religions
import nu.aedelore.app.domain.model.CharacterData
import nu.aedelore.app.domain.util.AutoFiller
import nu.aedelore.app.ui.common.AvatarDisplay
import nu.aedelore.app.ui.common.AvatarPicker
import nu.aedelore.app.ui.common.DropdownSelector
import nu.aedelore.app.ui.sheet.CharacterSheetViewModel

@Composable
fun CharacterTab(viewModel: CharacterSheetViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val data = uiState.data
    val isLocked = uiState.lockState.raceClassLocked
    var showAvatarPicker by remember { mutableStateOf(false) }

    if (showAvatarPicker) {
        AvatarPicker(
            selectedAvatarId = data.avatar?.value,
            onAvatarSelected = { avatarId ->
                viewModel.updateData { d ->
                    d.copy(avatar = CharacterData.AvatarData(type = "preset", value = avatarId))
                }
                showAvatarPicker = false
            },
            onDismiss = { showAvatarPicker = false },
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // Name
        OutlinedTextField(
            value = data.character_name,
            onValueChange = { viewModel.updateData { d -> d.copy(character_name = it) } },
            label = { Text("Character Name") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )

        // Player Name
        OutlinedTextField(
            value = data.player_name,
            onValueChange = { viewModel.updateData { d -> d.copy(player_name = it) } },
            label = { Text("Player Name") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )

        // Avatar
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            AvatarDisplay(avatarId = data.avatar?.value, size = 72)
            Spacer(modifier = Modifier.height(4.dp))
            OutlinedButton(onClick = { showAvatarPicker = true }) {
                Text("Choose Avatar")
            }
        }

        // Race dropdown
        DropdownSelector(
            label = "Race",
            options = Races.all.map { it.name },
            selected = data.race,
            onSelected = { raceName ->
                viewModel.updateData { d ->
                    AutoFiller.applyAutoFill(d.copy(race = raceName))
                }
            },
            enabled = !isLocked,
        )

        // Show race bonuses
        if (data.race.isNotBlank()) {
            val race = Races.byName(data.race)
            if (race != null && race.bonuses.isNotEmpty()) {
                Text(
                    text = "Race bonuses: ${race.bonuses.joinToString(", ")}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
        }

        // Class dropdown
        DropdownSelector(
            label = "Class",
            options = Classes.all.map { it.name },
            selected = data.characterClass,
            onSelected = { className ->
                viewModel.updateData { d ->
                    AutoFiller.applyAutoFill(d.copy(characterClass = className))
                }
            },
            enabled = !isLocked,
        )

        // Show class bonuses
        if (data.characterClass.isNotBlank()) {
            val cls = Classes.byName(data.characterClass)
            if (cls != null && cls.bonuses.isNotEmpty()) {
                Text(
                    text = "Class bonuses: ${cls.bonuses.joinToString(", ")}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
        }

        // Religion dropdown
        DropdownSelector(
            label = "Religion",
            options = Religions.all.map { it.name },
            selected = data.religion,
            onSelected = { religionName ->
                viewModel.updateData { d ->
                    AutoFiller.applyAutoFill(d.copy(religion = religionName))
                }
            },
            enabled = !isLocked,
        )

        // Lock Race & Class button
        if (!isLocked) {
            Button(
                onClick = { viewModel.lockRaceClass() },
                modifier = Modifier.fillMaxWidth(),
                enabled = data.race.isNotBlank() && data.characterClass.isNotBlank(),
            ) {
                Text("Lock Race & Class")
            }
        } else {
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
            ) {
                Text(
                    text = "Race & Class are locked",
                    modifier = Modifier.padding(12.dp),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        HorizontalDivider()

        // Background
        OutlinedTextField(
            value = data.background,
            onValueChange = { viewModel.updateData { d -> d.copy(background = it) } },
            label = { Text("Background") },
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 100.dp),
            maxLines = 5,
        )

        // Miscs
        OutlinedTextField(
            value = data.miscs,
            onValueChange = { viewModel.updateData { d -> d.copy(miscs = it) } },
            label = { Text("Miscellaneous") },
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(min = 100.dp),
            maxLines = 5,
        )

        HorizontalDivider()

        // Campaign section
        Text(
            text = "Campaign",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
        )

        if (uiState.campaignName != null) {
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Linked to: ${uiState.campaignName}", fontWeight = FontWeight.SemiBold)
                    if (uiState.partyMembers.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Party:", style = MaterialTheme.typography.bodySmall)
                        uiState.partyMembers.forEach { member ->
                            Text(
                                text = "  ${member.name}${member.playerName?.let { " ($it)" } ?: ""}",
                                style = MaterialTheme.typography.bodySmall,
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedButton(onClick = { viewModel.unlinkCampaign() }) {
                        Text("Unlink Campaign")
                    }
                }
            }
        } else {
            var shareCode by remember { mutableStateOf("") }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                OutlinedTextField(
                    value = shareCode,
                    onValueChange = { shareCode = it },
                    label = { Text("Share Code") },
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                )
                Button(
                    onClick = { viewModel.linkCampaign(shareCode) },
                    enabled = shareCode.isNotBlank(),
                ) {
                    Text("Link")
                }
            }
        }

        // Progression
        HorizontalDivider()
        Text(
            text = "Progression",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
        )
        Text("XP: ${uiState.xp}")
        Text("XP Spent: ${uiState.xpSpent}")
        val earnedPoints = uiState.xp / 10
        val usedPoints = uiState.xpSpent / 10
        Text("Available Points: ${earnedPoints - usedPoints}")

        Spacer(modifier = Modifier.height(32.dp))
    }
}
