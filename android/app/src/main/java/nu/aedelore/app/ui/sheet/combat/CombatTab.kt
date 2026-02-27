package nu.aedelore.app.ui.sheet.combat

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import nu.aedelore.app.domain.gamedata.Armors
import nu.aedelore.app.domain.gamedata.Weapons
import nu.aedelore.app.ui.common.DropdownSelector
import nu.aedelore.app.ui.common.ResourceAdjuster
import nu.aedelore.app.ui.sheet.CharacterSheetViewModel

@Composable
fun CombatTab(viewModel: CharacterSheetViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val data = uiState.data

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // Shield Section
        Text("Shield", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                DropdownSelector(
                    label = "Shield Type",
                    options = listOf("") + Armors.shields.map { it.name },
                    selected = data.shield_type,
                    onSelected = { name ->
                        val shield = Armors.shieldByName(name)
                        viewModel.updateData { d ->
                            d.copy(
                                shield_type = name,
                                shield_hp = (shield?.hp ?: 0).toString(),
                                shield_block = (shield?.block ?: 0).toString(),
                                shield_defence = (shield?.defence ?: 0).toString(),
                                shield_damage = shield?.damage ?: "",
                                shield_current = (shield?.hp ?: 0).toString(),
                                shield_broken = false,
                            )
                        }
                    },
                )
                if (data.shield_type.isNotBlank()) {
                    val shieldHp = data.shield_hp.toIntOrNull() ?: 0
                    val shieldCurrent = data.shield_current.toIntOrNull() ?: 0
                    ResourceAdjuster(
                        label = "Shield HP",
                        value = shieldCurrent,
                        min = 0,
                        max = shieldHp,
                        onValueChange = { newVal ->
                            viewModel.updateData { d ->
                                d.copy(
                                    shield_current = newVal.toString(),
                                    shield_broken = newVal <= 0,
                                )
                            }
                        },
                    )
                    Text(
                        "Block: ${data.shield_block} | Defence: ${data.shield_defence} | Damage: ${data.shield_damage}",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    if (data.shield_broken) {
                        Text(
                            "BROKEN",
                            color = MaterialTheme.colorScheme.error,
                            fontWeight = FontWeight.Bold,
                        )
                    }
                }
            }
        }

        // Armor Slots
        Text("Armor", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)

        val armorSlotNames = listOf("Head", "Shoulders", "Chest", "Hands", "Legs")
        val armorSlots = listOf(
            ArmorSlotData(data.armor_1_type, data.armor_1_hp, data.armor_1_bonus, data.armor_1_current, data.armor_1_broken, data.armor_1_disadvantage),
            ArmorSlotData(data.armor_2_type, data.armor_2_hp, data.armor_2_bonus, data.armor_2_current, data.armor_2_broken, data.armor_2_disadvantage),
            ArmorSlotData(data.armor_3_type, data.armor_3_hp, data.armor_3_bonus, data.armor_3_current, data.armor_3_broken, data.armor_3_disadvantage),
            ArmorSlotData(data.armor_4_type, data.armor_4_hp, data.armor_4_bonus, data.armor_4_current, data.armor_4_broken, data.armor_4_disadvantage),
            ArmorSlotData(data.armor_5_type, data.armor_5_hp, data.armor_5_bonus, data.armor_5_current, data.armor_5_broken, data.armor_5_disadvantage),
        )

        armorSlotNames.forEachIndexed { index, slotName ->
            val slot = armorSlots[index]
            val bodyPartArmors = Armors.forBodyPart(slotName)
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(slotName, fontWeight = FontWeight.SemiBold)
                    DropdownSelector(
                        label = "$slotName Armor",
                        options = listOf("") + bodyPartArmors.map { it.name },
                        selected = slot.type,
                        onSelected = { name ->
                            val armor = Armors.byName(name)
                            viewModel.updateData { d ->
                                val hp = (armor?.hp ?: 0).toString()
                                val bonus = (armor?.bonus ?: 0).toString()
                                val disadvantage = armor?.disadvantage ?: ""
                                when (index) {
                                    0 -> d.copy(armor_1_type = name, armor_1_hp = hp, armor_1_bonus = bonus, armor_1_current = hp, armor_1_broken = false, armor_1_disadvantage = disadvantage)
                                    1 -> d.copy(armor_2_type = name, armor_2_hp = hp, armor_2_bonus = bonus, armor_2_current = hp, armor_2_broken = false, armor_2_disadvantage = disadvantage)
                                    2 -> d.copy(armor_3_type = name, armor_3_hp = hp, armor_3_bonus = bonus, armor_3_current = hp, armor_3_broken = false, armor_3_disadvantage = disadvantage)
                                    3 -> d.copy(armor_4_type = name, armor_4_hp = hp, armor_4_bonus = bonus, armor_4_current = hp, armor_4_broken = false, armor_4_disadvantage = disadvantage)
                                    4 -> d.copy(armor_5_type = name, armor_5_hp = hp, armor_5_bonus = bonus, armor_5_current = hp, armor_5_broken = false, armor_5_disadvantage = disadvantage)
                                    else -> d
                                }
                            }
                        },
                    )
                    if (slot.type.isNotBlank()) {
                        val slotHp = slot.hp.toIntOrNull() ?: 0
                        val slotCurrent = slot.current.toIntOrNull() ?: 0
                        ResourceAdjuster(
                            label = "HP",
                            value = slotCurrent,
                            min = 0,
                            max = slotHp,
                            onValueChange = { newVal ->
                                viewModel.updateData { d ->
                                    val newValStr = newVal.toString()
                                    when (index) {
                                        0 -> d.copy(armor_1_current = newValStr, armor_1_broken = newVal <= 0)
                                        1 -> d.copy(armor_2_current = newValStr, armor_2_broken = newVal <= 0)
                                        2 -> d.copy(armor_3_current = newValStr, armor_3_broken = newVal <= 0)
                                        3 -> d.copy(armor_4_current = newValStr, armor_4_broken = newVal <= 0)
                                        4 -> d.copy(armor_5_current = newValStr, armor_5_broken = newVal <= 0)
                                        else -> d
                                    }
                                }
                            },
                        )
                        Text("Bonus: +${slot.bonus}", style = MaterialTheme.typography.bodySmall)
                        if (slot.disadvantage.isNotBlank()) {
                            Text(
                                "Disadvantage: ${slot.disadvantage}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.error,
                            )
                        }
                        if (slot.broken) {
                            Text(
                                "BROKEN",
                                color = MaterialTheme.colorScheme.error,
                                fontWeight = FontWeight.Bold,
                            )
                        }
                    }
                }
            }
        }

        // Weapons
        HorizontalDivider()
        Text("Weapons", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)

        // Weapon 1
        WeaponSlot(
            label = "Weapon 1",
            type = data.weapon_1_type,
            atkBonus = data.weapon_1_atk_bonus,
            damage = data.weapon_1_damage,
            range = data.weapon_1_range,
            breakVal = data.weapon_1_break,
            onTypeSelected = { name ->
                val weapon = Weapons.byName(name)
                viewModel.updateData { d ->
                    d.copy(
                        weapon_1_type = name,
                        weapon_1_atk_bonus = (weapon?.bonus ?: 0).toString(),
                        weapon_1_damage = weapon?.damage ?: "",
                        weapon_1_range = weapon?.range ?: "",
                        weapon_1_break = (weapon?.breakValue ?: 0).toString(),
                    )
                }
            },
        )

        // Weapon 2
        WeaponSlot(
            label = "Weapon 2",
            type = data.weapon_2_type,
            atkBonus = data.weapon_2_atk_bonus,
            damage = data.weapon_2_damage,
            range = data.weapon_2_range,
            breakVal = data.weapon_2_break,
            onTypeSelected = { name ->
                val weapon = Weapons.byName(name)
                viewModel.updateData { d ->
                    d.copy(
                        weapon_2_type = name,
                        weapon_2_atk_bonus = (weapon?.bonus ?: 0).toString(),
                        weapon_2_damage = weapon?.damage ?: "",
                        weapon_2_range = weapon?.range ?: "",
                        weapon_2_break = (weapon?.breakValue ?: 0).toString(),
                    )
                }
            },
        )

        // Weapon 3
        WeaponSlot(
            label = "Weapon 3",
            type = data.weapon_3_type,
            atkBonus = data.weapon_3_atk_bonus,
            damage = data.weapon_3_damage,
            range = data.weapon_3_range,
            breakVal = data.weapon_3_break,
            onTypeSelected = { name ->
                val weapon = Weapons.byName(name)
                viewModel.updateData { d ->
                    d.copy(
                        weapon_3_type = name,
                        weapon_3_atk_bonus = (weapon?.bonus ?: 0).toString(),
                        weapon_3_damage = weapon?.damage ?: "",
                        weapon_3_range = weapon?.range ?: "",
                        weapon_3_break = (weapon?.breakValue ?: 0).toString(),
                    )
                }
            },
        )

        // Equipment text fields
        HorizontalDivider()
        OutlinedTextField(
            value = data.equipment_1,
            onValueChange = { viewModel.updateData { d -> d.copy(equipment_1 = it) } },
            label = { Text("Equipment 1") },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 3,
        )
        OutlinedTextField(
            value = data.equipment_2,
            onValueChange = { viewModel.updateData { d -> d.copy(equipment_2 = it) } },
            label = { Text("Equipment 2") },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 3,
        )

        // Bleed & Weakened
        HorizontalDivider()
        ResourceAdjuster(
            label = "Bleed",
            value = data.bleed_value,
            min = 0,
            max = 6,
            onValueChange = { viewModel.updateData { d -> d.copy(bleed_value = it) } },
        )
        if (data.bleed_value >= 6) {
            Text(
                "DEATH: Bleed has reached maximum!",
                color = MaterialTheme.colorScheme.error,
                fontWeight = FontWeight.Bold,
            )
        }

        ResourceAdjuster(
            label = "Weakened",
            value = data.weakened_value,
            min = 0,
            max = 6,
            onValueChange = { viewModel.updateData { d -> d.copy(weakened_value = it) } },
        )
        if (data.weakened_value >= 6) {
            Text(
                "DEATH: Weakened has reached maximum!",
                color = MaterialTheme.colorScheme.error,
                fontWeight = FontWeight.Bold,
            )
        }

        // Injuries
        OutlinedTextField(
            value = data.injuries_text,
            onValueChange = { viewModel.updateData { d -> d.copy(injuries_text = it) } },
            label = { Text("Injuries") },
            modifier = Modifier.fillMaxWidth(),
            maxLines = 3,
        )

        Spacer(modifier = Modifier.height(32.dp))
    }
}

private data class ArmorSlotData(
    val type: String,
    val hp: String,
    val bonus: String,
    val current: String,
    val broken: Boolean,
    val disadvantage: String,
)

@Composable
private fun WeaponSlot(
    label: String,
    type: String,
    atkBonus: String,
    damage: String,
    range: String,
    breakVal: String,
    onTypeSelected: (String) -> Unit,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            DropdownSelector(
                label = label,
                options = listOf("") + Weapons.all.map { it.name },
                selected = type,
                onSelected = onTypeSelected,
            )
            if (type.isNotBlank()) {
                Text(
                    "ATK: +$atkBonus | DMG: $damage | Range: $range | Break: $breakVal",
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}
