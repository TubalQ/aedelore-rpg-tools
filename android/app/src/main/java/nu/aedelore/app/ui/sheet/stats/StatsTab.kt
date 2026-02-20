package nu.aedelore.app.ui.sheet.stats

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
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
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
import nu.aedelore.app.domain.util.AttributeDistributor
import nu.aedelore.app.ui.common.ResourceAdjuster
import nu.aedelore.app.ui.sheet.CharacterSheetViewModel

@Composable
fun StatsTab(viewModel: CharacterSheetViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val data = uiState.data
    val isLocked = uiState.lockState.attributesLocked

    // Build current values map for point tracking
    val currentValues = mapOf(
        "strength_value" to data.strength_value,
        "dexterity_value" to data.dexterity_value,
        "toughness_value" to data.toughness_value,
        "intelligence_value" to data.intelligence_value,
        "wisdom_value" to data.wisdom_value,
        "force_of_will_value" to data.force_of_will_value,
        "strength_athletics" to data.strength_athletics,
        "strength_raw_power" to data.strength_raw_power,
        "strength_unarmed" to data.strength_unarmed,
        "dexterity_endurance" to data.dexterity_endurance,
        "dexterity_acrobatics" to data.dexterity_acrobatics,
        "dexterity_sleight_of_hand" to data.dexterity_sleight_of_hand,
        "dexterity_stealth" to data.dexterity_stealth,
        "toughness_bonus_while_injured" to data.toughness_bonus_while_injured,
        "toughness_resistance" to data.toughness_resistance,
        "intelligence_arcana" to data.intelligence_arcana,
        "intelligence_history" to data.intelligence_history,
        "intelligence_investigation" to data.intelligence_investigation,
        "intelligence_nature" to data.intelligence_nature,
        "intelligence_religion" to data.intelligence_religion,
        "wisdom_luck" to data.wisdom_luck,
        "wisdom_animal_handling" to data.wisdom_animal_handling,
        "wisdom_insight" to data.wisdom_insight,
        "wisdom_medicine" to data.wisdom_medicine,
        "wisdom_perception" to data.wisdom_perception,
        "wisdom_survival" to data.wisdom_survival,
        "force_of_will_deception" to data.force_of_will_deception,
        "force_of_will_intimidation" to data.force_of_will_intimidation,
        "force_of_will_performance" to data.force_of_will_performance,
        "force_of_will_persuasion" to data.force_of_will_persuasion,
    )

    val baseValues = AttributeDistributor.calculateBaseValues(
        data.race, data.characterClass, data.religion
    )
    val freePointsUsed = AttributeDistributor.getFreePointsUsed(currentValues, baseValues)
    val freePointsRemaining = AttributeDistributor.getFreePointsRemaining(currentValues, baseValues)
    val xpPoints = AttributeDistributor.getXpAttributePoints(uiState.xp, uiState.xpSpent)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // Point tracker
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    "Attribute Points",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )
                if (!isLocked) {
                    Text(
                        "Free Points: $freePointsRemaining / ${AttributeDistributor.FREE_POINTS_TOTAL} remaining"
                    )
                } else {
                    Text("Attributes locked. XP points available: $xpPoints")
                }
            }
        }

        // HP
        ResourceAdjuster(
            label = "HP",
            value = data.hp_value,
            min = 0,
            max = data.hp_max,
            onValueChange = { viewModel.updateData { d -> d.copy(hp_value = it) } },
        )

        // Willpower
        ResourceAdjuster(
            label = "Willpower",
            value = data.willpower_value,
            min = 0,
            max = 3,
            onValueChange = { viewModel.updateData { d -> d.copy(willpower_value = it) } },
        )

        HorizontalDivider()

        // Attributes
        AttributeSection(
            name = "Strength",
            value = data.strength_value,
            onValueChange = { viewModel.updateData { d -> d.copy(strength_value = it) } },
            enabled = !isLocked && freePointsRemaining > 0,
            isLocked = isLocked,
            skills = mapOf(
                "Athletics" to data.strength_athletics,
                "Raw Power" to data.strength_raw_power,
                "Unarmed" to data.strength_unarmed,
            ),
            onSkillChange = { skill, value ->
                viewModel.updateData { d ->
                    when (skill) {
                        "Athletics" -> d.copy(strength_athletics = value)
                        "Raw Power" -> d.copy(strength_raw_power = value)
                        "Unarmed" -> d.copy(strength_unarmed = value)
                        else -> d
                    }
                }
            },
        )

        AttributeSection(
            name = "Dexterity",
            value = data.dexterity_value,
            onValueChange = { viewModel.updateData { d -> d.copy(dexterity_value = it) } },
            enabled = !isLocked && freePointsRemaining > 0,
            isLocked = isLocked,
            skills = mapOf(
                "Endurance" to data.dexterity_endurance,
                "Acrobatics" to data.dexterity_acrobatics,
                "Sleight of Hand" to data.dexterity_sleight_of_hand,
                "Stealth" to data.dexterity_stealth,
            ),
            onSkillChange = { skill, value ->
                viewModel.updateData { d ->
                    when (skill) {
                        "Endurance" -> d.copy(dexterity_endurance = value)
                        "Acrobatics" -> d.copy(dexterity_acrobatics = value)
                        "Sleight of Hand" -> d.copy(dexterity_sleight_of_hand = value)
                        "Stealth" -> d.copy(dexterity_stealth = value)
                        else -> d
                    }
                }
            },
        )

        AttributeSection(
            name = "Toughness",
            value = data.toughness_value,
            onValueChange = { viewModel.updateData { d -> d.copy(toughness_value = it) } },
            enabled = !isLocked && freePointsRemaining > 0,
            isLocked = isLocked,
            skills = mapOf(
                "Bonus While Injured" to data.toughness_bonus_while_injured,
                "Resistance" to data.toughness_resistance,
            ),
            onSkillChange = { skill, value ->
                viewModel.updateData { d ->
                    when (skill) {
                        "Bonus While Injured" -> d.copy(toughness_bonus_while_injured = value)
                        "Resistance" -> d.copy(toughness_resistance = value)
                        else -> d
                    }
                }
            },
        )

        AttributeSection(
            name = "Intelligence",
            value = data.intelligence_value,
            onValueChange = { viewModel.updateData { d -> d.copy(intelligence_value = it) } },
            enabled = !isLocked && freePointsRemaining > 0,
            isLocked = isLocked,
            skills = mapOf(
                "Arcana" to data.intelligence_arcana,
                "History" to data.intelligence_history,
                "Investigation" to data.intelligence_investigation,
                "Nature" to data.intelligence_nature,
                "Religion" to data.intelligence_religion,
            ),
            onSkillChange = { skill, value ->
                viewModel.updateData { d ->
                    when (skill) {
                        "Arcana" -> d.copy(intelligence_arcana = value)
                        "History" -> d.copy(intelligence_history = value)
                        "Investigation" -> d.copy(intelligence_investigation = value)
                        "Nature" -> d.copy(intelligence_nature = value)
                        "Religion" -> d.copy(intelligence_religion = value)
                        else -> d
                    }
                }
            },
        )

        AttributeSection(
            name = "Wisdom",
            value = data.wisdom_value,
            onValueChange = { viewModel.updateData { d -> d.copy(wisdom_value = it) } },
            enabled = !isLocked && freePointsRemaining > 0,
            isLocked = isLocked,
            skills = mapOf(
                "Luck" to data.wisdom_luck,
                "Animal Handling" to data.wisdom_animal_handling,
                "Insight" to data.wisdom_insight,
                "Medicine" to data.wisdom_medicine,
                "Perception" to data.wisdom_perception,
                "Survival" to data.wisdom_survival,
            ),
            onSkillChange = { skill, value ->
                viewModel.updateData { d ->
                    when (skill) {
                        "Luck" -> d.copy(wisdom_luck = value)
                        "Animal Handling" -> d.copy(wisdom_animal_handling = value)
                        "Insight" -> d.copy(wisdom_insight = value)
                        "Medicine" -> d.copy(wisdom_medicine = value)
                        "Perception" -> d.copy(wisdom_perception = value)
                        "Survival" -> d.copy(wisdom_survival = value)
                        else -> d
                    }
                }
            },
        )

        AttributeSection(
            name = "Force of Will",
            value = data.force_of_will_value,
            onValueChange = { viewModel.updateData { d -> d.copy(force_of_will_value = it) } },
            enabled = !isLocked && freePointsRemaining > 0,
            isLocked = isLocked,
            skills = mapOf(
                "Deception" to data.force_of_will_deception,
                "Intimidation" to data.force_of_will_intimidation,
                "Performance" to data.force_of_will_performance,
                "Persuasion" to data.force_of_will_persuasion,
            ),
            onSkillChange = { skill, value ->
                viewModel.updateData { d ->
                    when (skill) {
                        "Deception" -> d.copy(force_of_will_deception = value)
                        "Intimidation" -> d.copy(force_of_will_intimidation = value)
                        "Performance" -> d.copy(force_of_will_performance = value)
                        "Persuasion" -> d.copy(force_of_will_persuasion = value)
                        else -> d
                    }
                }
            },
        )

        // Third Eye is not in AttributeDistributor.ALL_ATTRIBUTE_IDS, shown separately
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                ResourceAdjuster(
                    label = "Third Eye",
                    value = data.third_eye_value,
                    min = 0,
                    max = 5,
                    onValueChange = { viewModel.updateData { d -> d.copy(third_eye_value = it) } },
                    enabled = !isLocked,
                )
            }
        }

        // Lock Attributes button
        if (uiState.lockState.raceClassLocked && !isLocked) {
            Button(
                onClick = { viewModel.lockAttributes() },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Lock Attributes")
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun AttributeSection(
    name: String,
    value: Int,
    onValueChange: (Int) -> Unit,
    enabled: Boolean,
    isLocked: Boolean,
    skills: Map<String, Int>,
    onSkillChange: (String, Int) -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            ResourceAdjuster(
                label = name,
                value = value,
                min = 0,
                max = AttributeDistributor.MAX_POINTS_PER_ATTRIBUTE,
                onValueChange = onValueChange,
                enabled = enabled || (isLocked), // XP spending handled by VM
            )

            TextButton(onClick = { expanded = !expanded }) {
                Text(if (expanded) "Hide Skills" else "Show Skills")
            }

            if (expanded) {
                skills.forEach { (skillName, skillValue) ->
                    ResourceAdjuster(
                        label = "  $skillName",
                        value = skillValue,
                        min = 0,
                        max = AttributeDistributor.MAX_POINTS_PER_ATTRIBUTE,
                        onValueChange = { onSkillChange(skillName, it) },
                        enabled = enabled || (isLocked),
                    )
                }
            }
        }
    }
}
