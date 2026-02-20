package nu.aedelore.app.ui.sheet.abilities

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import nu.aedelore.app.domain.gamedata.Classes
import nu.aedelore.app.domain.gamedata.Spells
import nu.aedelore.app.ui.common.DropdownSelector
import nu.aedelore.app.ui.common.ResourceAdjuster
import nu.aedelore.app.ui.sheet.CharacterSheetViewModel

@Composable
fun AbilitiesTab(viewModel: CharacterSheetViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val data = uiState.data
    val isLocked = uiState.lockState.abilitiesLocked
    val cls = Classes.byName(data.characterClass)
    val isMagicClass = cls?.isMagicClass == true

    // Get available spells for this class
    val availableSpells = Spells.forClass(data.characterClass)
    val spellNames = listOf("") + availableSpells.map { it.name }

    // Get currently selected spells to prevent duplicates
    val selectedSpells = listOf(
        data.spell_1, data.spell_2, data.spell_3, data.spell_4, data.spell_5,
        data.spell_6, data.spell_7, data.spell_8, data.spell_9, data.spell_10,
    )

    val slotCount = cls?.abilitySlots ?: if (isMagicClass) 10 else 3

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            text = if (isMagicClass) "Spells" else "Abilities",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )

        // Arcana (only for Mage/Druid)
        if (isMagicClass) {
            ResourceAdjuster(
                label = "Arcana",
                value = data.arcana_value,
                min = 0,
                max = data.arcana_max,
                onValueChange = { viewModel.updateData { d -> d.copy(arcana_value = it) } },
            )
            Spacer(modifier = Modifier.height(8.dp))
        }

        // Spell slots
        for (i in 1..slotCount) {
            val currentSpellName = when (i) {
                1 -> data.spell_1; 2 -> data.spell_2; 3 -> data.spell_3
                4 -> data.spell_4; 5 -> data.spell_5; 6 -> data.spell_6
                7 -> data.spell_7; 8 -> data.spell_8; 9 -> data.spell_9
                10 -> data.spell_10; else -> ""
            }

            // Filter out already selected spells (except current slot's spell)
            val filteredSpells = listOf("") + availableSpells
                .filter { it.name == currentSpellName || it.name !in selectedSpells }
                .map { it.name }

            val spell = availableSpells.find { it.name == currentSpellName }

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    DropdownSelector(
                        label = "Slot $i",
                        options = filteredSpells,
                        selected = currentSpellName,
                        onSelected = { name ->
                            val selectedSpell = availableSpells.find { it.name == name }
                            viewModel.updateData { d ->
                                when (i) {
                                    1 -> d.copy(
                                        spell_1 = name,
                                        spell_1_damage = selectedSpell?.damage ?: "",
                                        spell_1_arcana = selectedSpell?.arcana ?: "",
                                        spell_1_weakened = selectedSpell?.weakened ?: "",
                                    )
                                    2 -> d.copy(
                                        spell_2 = name,
                                        spell_2_damage = selectedSpell?.damage ?: "",
                                        spell_2_arcana = selectedSpell?.arcana ?: "",
                                        spell_2_weakened = selectedSpell?.weakened ?: "",
                                    )
                                    3 -> d.copy(
                                        spell_3 = name,
                                        spell_3_damage = selectedSpell?.damage ?: "",
                                        spell_3_arcana = selectedSpell?.arcana ?: "",
                                        spell_3_weakened = selectedSpell?.weakened ?: "",
                                    )
                                    4 -> d.copy(
                                        spell_4 = name,
                                        spell_4_damage = selectedSpell?.damage ?: "",
                                        spell_4_arcana = selectedSpell?.arcana ?: "",
                                        spell_4_weakened = selectedSpell?.weakened ?: "",
                                    )
                                    5 -> d.copy(
                                        spell_5 = name,
                                        spell_5_damage = selectedSpell?.damage ?: "",
                                        spell_5_arcana = selectedSpell?.arcana ?: "",
                                        spell_5_weakened = selectedSpell?.weakened ?: "",
                                    )
                                    6 -> d.copy(
                                        spell_6 = name,
                                        spell_6_damage = selectedSpell?.damage ?: "",
                                        spell_6_arcana = selectedSpell?.arcana ?: "",
                                        spell_6_weakened = selectedSpell?.weakened ?: "",
                                    )
                                    7 -> d.copy(
                                        spell_7 = name,
                                        spell_7_damage = selectedSpell?.damage ?: "",
                                        spell_7_arcana = selectedSpell?.arcana ?: "",
                                        spell_7_weakened = selectedSpell?.weakened ?: "",
                                    )
                                    8 -> d.copy(
                                        spell_8 = name,
                                        spell_8_damage = selectedSpell?.damage ?: "",
                                        spell_8_arcana = selectedSpell?.arcana ?: "",
                                        spell_8_weakened = selectedSpell?.weakened ?: "",
                                    )
                                    9 -> d.copy(
                                        spell_9 = name,
                                        spell_9_damage = selectedSpell?.damage ?: "",
                                        spell_9_arcana = selectedSpell?.arcana ?: "",
                                        spell_9_weakened = selectedSpell?.weakened ?: "",
                                    )
                                    10 -> d.copy(
                                        spell_10 = name,
                                        spell_10_damage = selectedSpell?.damage ?: "",
                                        spell_10_arcana = selectedSpell?.arcana ?: "",
                                        spell_10_weakened = selectedSpell?.weakened ?: "",
                                    )
                                    else -> d
                                }
                            }
                        },
                        enabled = !isLocked,
                    )
                    if (spell != null) {
                        Text(
                            text = spell.desc,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        if (isMagicClass) {
                            Text(
                                "Arcana cost: ${spell.arcana} | Damage: ${spell.damage}",
                                style = MaterialTheme.typography.bodySmall,
                            )
                        } else {
                            Text(
                                "Weakened: ${spell.weakened} | Damage: ${spell.damage}",
                                style = MaterialTheme.typography.bodySmall,
                            )
                        }
                    }
                }
            }
        }

        // Lock Abilities button
        if (uiState.lockState.attributesLocked && !isLocked) {
            Button(
                onClick = { viewModel.lockAbilities() },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Lock Abilities")
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}
