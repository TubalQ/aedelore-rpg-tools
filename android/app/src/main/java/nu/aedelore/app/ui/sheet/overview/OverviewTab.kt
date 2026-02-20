package nu.aedelore.app.ui.sheet.overview

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay
import nu.aedelore.app.domain.model.CharacterData
import nu.aedelore.app.domain.util.ArmorPenaltyCalculator
import nu.aedelore.app.domain.util.HpCalculator
import nu.aedelore.app.domain.util.WorthinessDescriptor
import nu.aedelore.app.ui.common.AvatarDisplay
import nu.aedelore.app.ui.common.HpBar
import nu.aedelore.app.ui.common.ResourceAdjuster
import nu.aedelore.app.ui.sheet.CharacterSheetViewModel
import nu.aedelore.app.ui.sheet.SheetTab

// ── Skill definitions for expandable attribute cards ─────────────────────────

private data class SkillDef(val name: String, val fieldId: String)

private val ATTRIBUTE_SKILLS = linkedMapOf(
    "Strength" to listOf(
        SkillDef("Athletics", "strength_athletics"),
        SkillDef("Raw Power", "strength_raw_power"),
        SkillDef("Unarmed", "strength_unarmed"),
    ),
    "Dexterity" to listOf(
        SkillDef("Endurance", "dexterity_endurance"),
        SkillDef("Acrobatics", "dexterity_acrobatics"),
        SkillDef("Sleight of Hand", "dexterity_sleight_of_hand"),
        SkillDef("Stealth", "dexterity_stealth"),
    ),
    "Toughness" to listOf(
        SkillDef("Bonus While Injured", "toughness_bonus_while_injured"),
        SkillDef("Resistance", "toughness_resistance"),
    ),
    "Intelligence" to listOf(
        SkillDef("Arcana", "intelligence_arcana"),
        SkillDef("History", "intelligence_history"),
        SkillDef("Investigation", "intelligence_investigation"),
        SkillDef("Nature", "intelligence_nature"),
        SkillDef("Religion", "intelligence_religion"),
    ),
    "Wisdom" to listOf(
        SkillDef("Luck", "wisdom_luck"),
        SkillDef("Animal Handling", "wisdom_animal_handling"),
        SkillDef("Insight", "wisdom_insight"),
        SkillDef("Medicine", "wisdom_medicine"),
        SkillDef("Perception", "wisdom_perception"),
        SkillDef("Survival", "wisdom_survival"),
    ),
    "Force of Will" to listOf(
        SkillDef("Deception", "force_of_will_deception"),
        SkillDef("Intimidation", "force_of_will_intimidation"),
        SkillDef("Performance", "force_of_will_performance"),
        SkillDef("Persuasion", "force_of_will_persuasion"),
    ),
)

private fun CharacterData.getSkillValue(fieldId: String): Int = when (fieldId) {
    "strength_athletics" -> strength_athletics
    "strength_raw_power" -> strength_raw_power
    "strength_unarmed" -> strength_unarmed
    "dexterity_endurance" -> dexterity_endurance
    "dexterity_acrobatics" -> dexterity_acrobatics
    "dexterity_sleight_of_hand" -> dexterity_sleight_of_hand
    "dexterity_stealth" -> dexterity_stealth
    "toughness_bonus_while_injured" -> toughness_bonus_while_injured
    "toughness_resistance" -> toughness_resistance
    "intelligence_arcana" -> intelligence_arcana
    "intelligence_history" -> intelligence_history
    "intelligence_investigation" -> intelligence_investigation
    "intelligence_nature" -> intelligence_nature
    "intelligence_religion" -> intelligence_religion
    "wisdom_luck" -> wisdom_luck
    "wisdom_animal_handling" -> wisdom_animal_handling
    "wisdom_insight" -> wisdom_insight
    "wisdom_medicine" -> wisdom_medicine
    "wisdom_perception" -> wisdom_perception
    "wisdom_survival" -> wisdom_survival
    "force_of_will_deception" -> force_of_will_deception
    "force_of_will_intimidation" -> force_of_will_intimidation
    "force_of_will_performance" -> force_of_will_performance
    "force_of_will_persuasion" -> force_of_will_persuasion
    else -> 0
}

private fun CharacterData.getAttributeValue(name: String): Int = when (name) {
    "Strength" -> strength_value
    "Dexterity" -> dexterity_value
    "Toughness" -> toughness_value
    "Intelligence" -> intelligence_value
    "Wisdom" -> wisdom_value
    "Force of Will" -> force_of_will_value
    "Third Eye" -> third_eye_value
    else -> 0
}

// ── Helper data classes ──────────────────────────────────────────────────────

private data class EquipmentSlot(
    val bodyPart: String,
    val type: String,
    val current: String,
    val max: String,
    val onValueChange: (Int) -> Unit,
)

private data class WeaponInfo(
    val type: String,
    val atkBonus: String,
    val damage: String,
    val range: String,
)

private data class SpellInfo(
    val name: String,
    val arcana: String,
    val weakened: String,
    val damage: String,
    val gain: String,
)

// ── Main composable ──────────────────────────────────────────────────────────

@Composable
fun OverviewTab(viewModel: CharacterSheetViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val data = uiState.data
    val maxHp = HpCalculator.calculateMaxHp(data.race, data.characterClass)
    val effectiveMaxHp = if (maxHp > 0) maxHp else data.hp_max
    val isMagicClass = data.characterClass == "Mage" || data.characterClass == "Druid"

    val armorPenalties = remember(data) { ArmorPenaltyCalculator.calculate(data) }

    var feedbackMessage by remember { mutableStateOf<String?>(null) }
    var showPotionDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // ── Hero Card ────────────────────────────────────────────────────
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) {
            Row(modifier = Modifier.padding(16.dp)) {
                AvatarDisplay(avatarId = data.avatar?.value, size = 56)
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = data.character_name.ifBlank { "Unnamed" },
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                    )
                    if (data.race.isNotBlank() || data.characterClass.isNotBlank()) {
                        Text(
                            text = listOfNotNull(
                                data.race.takeIf { it.isNotBlank() },
                                data.characterClass.takeIf { it.isNotBlank() },
                            ).joinToString(" "),
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    if (data.religion.isNotBlank()) {
                        Text(
                            text = data.religion,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }

        // ── Quick Actions ────────────────────────────────────────────────
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    "Quick Actions",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    FilledTonalButton(
                        onClick = {
                            val newHp = (data.hp_value + 2).coerceAtMost(effectiveMaxHp)
                            var newArcana = data.arcana_value
                            if (isMagicClass) {
                                newArcana = (newArcana + 2).coerceAtMost(data.arcana_max)
                            }
                            viewModel.updateData { d ->
                                d.copy(
                                    hp_value = newHp,
                                    arcana_value = newArcana,
                                    willpower_value = 3,
                                )
                            }
                            feedbackMessage = if (isMagicClass) "Rest: HP +2, Arcana +2, Willpower restored"
                            else "Rest: HP +2, Willpower restored"
                        },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Rest", style = MaterialTheme.typography.labelMedium)
                    }

                    FilledTonalButton(
                        onClick = {
                            val newHp = (data.hp_value + 1).coerceAtMost(effectiveMaxHp)
                            var newArcana = data.arcana_value
                            if (isMagicClass) {
                                newArcana = (newArcana + 1).coerceAtMost(data.arcana_max)
                            }
                            viewModel.updateData { d ->
                                d.copy(
                                    hp_value = newHp,
                                    arcana_value = newArcana,
                                )
                            }
                            feedbackMessage = if (isMagicClass) "Half Rest: HP +1, Arcana +1"
                            else "Half Rest: HP +1"
                        },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Half Rest", style = MaterialTheme.typography.labelMedium)
                    }

                    FilledTonalButton(
                        onClick = { showPotionDialog = true },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Potion", style = MaterialTheme.typography.labelMedium)
                    }

                    FilledTonalButton(
                        onClick = { viewModel.selectTab(SheetTab.TOOLS) },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Dice", style = MaterialTheme.typography.labelMedium)
                    }
                }
            }
        }

        // ── Feedback message ─────────────────────────────────────────────
        feedbackMessage?.let { msg ->
            Text(
                text = msg,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary,
            )
            LaunchedEffect(msg) {
                delay(3000)
                feedbackMessage = null
            }
        }

        // ── HP Section ───────────────────────────────────────────────────
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    "Hit Points",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(8.dp))
                HpBar(current = data.hp_value, max = effectiveMaxHp)
                Spacer(modifier = Modifier.height(8.dp))
                ResourceAdjuster(
                    label = "HP",
                    value = data.hp_value,
                    min = 0,
                    max = effectiveMaxHp,
                    onValueChange = { newVal ->
                        viewModel.updateData { it.copy(hp_value = newVal) }
                    },
                )
            }
        }

        // ── Resources ────────────────────────────────────────────────────
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text(
                    "Resources",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )

                if (isMagicClass) {
                    ResourceAdjuster(
                        label = "Arcana",
                        value = data.arcana_value,
                        min = 0,
                        max = data.arcana_max,
                        onValueChange = {
                            viewModel.updateData { d -> d.copy(arcana_value = it) }
                        },
                    )
                }

                ResourceAdjuster(
                    label = "Willpower",
                    value = data.willpower_value,
                    min = 0,
                    max = 3,
                    onValueChange = {
                        viewModel.updateData { d -> d.copy(willpower_value = it) }
                    },
                )

                ResourceAdjuster(
                    label = "Bleed",
                    value = data.bleed_value,
                    min = 0,
                    max = 6,
                    onValueChange = {
                        viewModel.updateData { d -> d.copy(bleed_value = it) }
                    },
                )

                if (data.bleed_value >= 6) {
                    Text(
                        text = "DEATH: Bleed has reached maximum!",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                    )
                }

                ResourceAdjuster(
                    label = "Weakened",
                    value = data.weakened_value,
                    min = 0,
                    max = 6,
                    onValueChange = {
                        viewModel.updateData { d -> d.copy(weakened_value = it) }
                    },
                )

                if (data.weakened_value >= 6) {
                    Text(
                        text = "DEATH: Weakened has reached maximum!",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                    )
                }

                ResourceAdjuster(
                    label = "Worthiness",
                    value = data.worthiness_value,
                    min = -10,
                    max = 10,
                    onValueChange = {
                        viewModel.updateData { d -> d.copy(worthiness_value = it) }
                    },
                )
                Text(
                    text = WorthinessDescriptor.describeLong(data.worthiness_value),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                )
            }
        }

        // ── Equipment Damage ─────────────────────────────────────────────
        EquipmentDamageSection(data, viewModel)

        // ── Weapons & Abilities ──────────────────────────────────────────
        WeaponsAbilitiesSection(data)

        // ── Attributes with expandable skills ────────────────────────────
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    "Attributes",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                )
                Spacer(modifier = Modifier.height(8.dp))

                ATTRIBUTE_SKILLS.forEach { (attrName, skills) ->
                    ExpandableAttributeRow(
                        name = attrName,
                        value = data.getAttributeValue(attrName),
                        skills = skills,
                        data = data,
                        armorPenalties = armorPenalties,
                    )
                }

                // Third Eye has no sub-skills
                AttributeRow("Third Eye", data.third_eye_value)
            }
        }
    }

    // ── Potion Dialog ────────────────────────────────────────────────────
    if (showPotionDialog) {
        PotionDialog(
            data = data,
            isMagicClass = isMagicClass,
            onUse = { potionType ->
                when (potionType) {
                    "adrenaline" -> {
                        viewModel.updateData { d ->
                            d.copy(pot_adrenaline_slider = d.pot_adrenaline_slider - 1)
                        }
                        feedbackMessage = "Used Adrenaline potion"
                    }
                    "antidote" -> {
                        viewModel.updateData { d ->
                            d.copy(pot_antidote_slider = d.pot_antidote_slider - 1)
                        }
                        feedbackMessage = "Used Antidote potion"
                    }
                    "poison" -> {
                        viewModel.updateData { d ->
                            d.copy(pot_poison_slider = d.pot_poison_slider - 1)
                        }
                        feedbackMessage = "Used Poison potion"
                    }
                    "arcane" -> {
                        viewModel.updateData { d ->
                            d.copy(
                                pot_arcane_slider = d.pot_arcane_slider - 1,
                                arcana_value = (d.arcana_value + 10).coerceAtMost(d.arcana_max),
                            )
                        }
                        feedbackMessage = "Used Arcane Elixir: Arcana +10"
                    }
                }
                showPotionDialog = false
            },
            onDismiss = { showPotionDialog = false },
        )
    }
}

// ── Potion Dialog ────────────────────────────────────────────────────────────

@Composable
private fun PotionDialog(
    data: CharacterData,
    isMagicClass: Boolean,
    onUse: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    val potions = buildList {
        if (data.pot_adrenaline_slider > 0) add("adrenaline" to "Adrenaline (${data.pot_adrenaline_slider})")
        if (data.pot_antidote_slider > 0) add("antidote" to "Antidote (${data.pot_antidote_slider})")
        if (data.pot_poison_slider > 0) add("poison" to "Poison (${data.pot_poison_slider})")
        if (data.pot_arcane_slider > 0) add("arcane" to "Arcane Elixir (${data.pot_arcane_slider})")
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Use Potion") },
        text = {
            if (potions.isEmpty()) {
                Text("No potions available")
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    potions.forEach { (type, label) ->
                        TextButton(
                            onClick = { onUse(type) },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(label)
                        }
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
    )
}

// ── Equipment Damage Section ─────────────────────────────────────────────────

@Composable
private fun EquipmentDamageSection(data: CharacterData, viewModel: CharacterSheetViewModel) {
    val slots = buildList {
        if (data.shield_type.isNotBlank()) add(
            EquipmentSlot("Shield", data.shield_type, data.shield_current, data.shield_hp) { value ->
                viewModel.updateData { d -> d.copy(shield_current = value.toString()) }
            }
        )
        if (data.armor_1_type.isNotBlank()) add(
            EquipmentSlot("Head", data.armor_1_type, data.armor_1_current, data.armor_1_hp) { value ->
                viewModel.updateData { d -> d.copy(armor_1_current = value.toString()) }
            }
        )
        if (data.armor_2_type.isNotBlank()) add(
            EquipmentSlot("Shoulders", data.armor_2_type, data.armor_2_current, data.armor_2_hp) { value ->
                viewModel.updateData { d -> d.copy(armor_2_current = value.toString()) }
            }
        )
        if (data.armor_3_type.isNotBlank()) add(
            EquipmentSlot("Chest", data.armor_3_type, data.armor_3_current, data.armor_3_hp) { value ->
                viewModel.updateData { d -> d.copy(armor_3_current = value.toString()) }
            }
        )
        if (data.armor_4_type.isNotBlank()) add(
            EquipmentSlot("Hands", data.armor_4_type, data.armor_4_current, data.armor_4_hp) { value ->
                viewModel.updateData { d -> d.copy(armor_4_current = value.toString()) }
            }
        )
        if (data.armor_5_type.isNotBlank()) add(
            EquipmentSlot("Legs", data.armor_5_type, data.armor_5_current, data.armor_5_hp) { value ->
                viewModel.updateData { d -> d.copy(armor_5_current = value.toString()) }
            }
        )
    }

    if (slots.isEmpty()) return

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                "Equipment",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )
            slots.forEach { slot ->
                val current = slot.current.toIntOrNull() ?: 0
                val max = slot.max.toIntOrNull() ?: 0
                ResourceAdjuster(
                    label = "${slot.bodyPart} (${slot.type})",
                    value = current,
                    min = 0,
                    max = max,
                    onValueChange = slot.onValueChange,
                )
                if (current <= 0 && max > 0) {
                    Text(
                        text = "BROKEN",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}

// ── Weapons & Abilities Section ──────────────────────────────────────────────

@Composable
private fun WeaponsAbilitiesSection(data: CharacterData) {
    val weapons = buildList {
        if (data.weapon_1_type.isNotBlank()) add(
            WeaponInfo(data.weapon_1_type, data.weapon_1_atk_bonus, data.weapon_1_damage, data.weapon_1_range)
        )
        if (data.weapon_2_type.isNotBlank()) add(
            WeaponInfo(data.weapon_2_type, data.weapon_2_atk_bonus, data.weapon_2_damage, data.weapon_2_range)
        )
        if (data.weapon_3_type.isNotBlank()) add(
            WeaponInfo(data.weapon_3_type, data.weapon_3_atk_bonus, data.weapon_3_damage, data.weapon_3_range)
        )
    }

    val spells = buildList {
        if (data.spell_1.isNotBlank()) add(SpellInfo(data.spell_1, data.spell_1_arcana, data.spell_1_weakened, data.spell_1_damage, data.spell_1_gain))
        if (data.spell_2.isNotBlank()) add(SpellInfo(data.spell_2, data.spell_2_arcana, data.spell_2_weakened, data.spell_2_damage, data.spell_2_gain))
        if (data.spell_3.isNotBlank()) add(SpellInfo(data.spell_3, data.spell_3_arcana, data.spell_3_weakened, data.spell_3_damage, data.spell_3_gain))
        if (data.spell_4.isNotBlank()) add(SpellInfo(data.spell_4, data.spell_4_arcana, data.spell_4_weakened, data.spell_4_damage, data.spell_4_gain))
        if (data.spell_5.isNotBlank()) add(SpellInfo(data.spell_5, data.spell_5_arcana, data.spell_5_weakened, data.spell_5_damage, data.spell_5_gain))
        if (data.spell_6.isNotBlank()) add(SpellInfo(data.spell_6, data.spell_6_arcana, data.spell_6_weakened, data.spell_6_damage, data.spell_6_gain))
        if (data.spell_7.isNotBlank()) add(SpellInfo(data.spell_7, data.spell_7_arcana, data.spell_7_weakened, data.spell_7_damage, data.spell_7_gain))
        if (data.spell_8.isNotBlank()) add(SpellInfo(data.spell_8, data.spell_8_arcana, data.spell_8_weakened, data.spell_8_damage, data.spell_8_gain))
        if (data.spell_9.isNotBlank()) add(SpellInfo(data.spell_9, data.spell_9_arcana, data.spell_9_weakened, data.spell_9_damage, data.spell_9_gain))
        if (data.spell_10.isNotBlank()) add(SpellInfo(data.spell_10, data.spell_10_arcana, data.spell_10_weakened, data.spell_10_damage, data.spell_10_gain))
    }

    if (weapons.isEmpty() && spells.isEmpty()) return

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                "Weapons & Abilities",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
            )

            weapons.forEach { w ->
                Text(
                    text = "${w.type} — ATK +${w.atkBonus} | DMG ${w.damage} | Range ${w.range}",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }

            if (weapons.isNotEmpty() && spells.isNotEmpty()) {
                HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
            }

            spells.forEach { s ->
                val costParts = buildList {
                    if (s.arcana.isNotBlank() && s.arcana != "-") add("${s.arcana} Arcana")
                    if (s.weakened.isNotBlank() && s.weakened != "-") add("${s.weakened} Weakened")
                }
                val cost = costParts.joinToString(" | ").ifBlank { "Passive" }
                val dmg = if (s.damage.isNotBlank() && s.damage != "0") " | ${s.damage} dmg" else ""
                val gain = if (s.gain.isNotBlank() && s.gain != "0") " | +${s.gain} gain" else ""
                Text(
                    text = "${s.name} — $cost$dmg$gain",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }
    }
}

// ── Expandable Attribute Row ─────────────────────────────────────────────────

@Composable
private fun ExpandableAttributeRow(
    name: String,
    value: Int,
    skills: List<SkillDef>,
    data: CharacterData,
    armorPenalties: Map<String, Int>,
) {
    var expanded by remember { mutableStateOf(false) }

    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = !expanded }
                .padding(vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = if (expanded) "\u25BC $name" else "\u25B6 $name",
                style = MaterialTheme.typography.bodyMedium,
            )
            Text(
                text = value.toString(),
                style = MaterialTheme.typography.bodyMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
            )
        }

        AnimatedVisibility(visible = expanded) {
            Column(modifier = Modifier.padding(start = 16.dp)) {
                skills.forEach { skill ->
                    val baseValue = data.getSkillValue(skill.fieldId)
                    val penalty = armorPenalties[skill.fieldId] ?: 0
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 2.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(
                            text = skill.name,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        if (penalty != 0) {
                            Text(
                                text = "$baseValue ($penalty)",
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.error,
                            )
                        } else {
                            Text(
                                text = baseValue.toString(),
                                style = MaterialTheme.typography.bodySmall,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary,
                            )
                        }
                    }
                }
            }
        }
    }
}

// ── Simple Attribute Row (no sub-skills) ─────────────────────────────────────

@Composable
private fun AttributeRow(name: String, value: Int) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(name, style = MaterialTheme.typography.bodyMedium)
        Text(
            text = value.toString(),
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
        )
    }
}
