package nu.aedelore.app.ui.sheet.tools

import android.content.Intent
import android.net.Uri
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.SegmentedButton
import androidx.compose.material3.SegmentedButtonDefaults
import androidx.compose.material3.SingleChoiceSegmentedButtonRow
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import nu.aedelore.app.domain.model.DiceResult
import nu.aedelore.app.domain.model.DiceRoll
import nu.aedelore.app.ui.common.ResourceAdjuster
import nu.aedelore.app.ui.sheet.CharacterSheetViewModel
import nu.aedelore.app.ui.wiki.WikiSearchDialog
import nu.aedelore.app.ui.wiki.WikiViewModel
import kotlin.random.Random

enum class DiceMode(val title: String) {
    SUCCESSES("Successes"),
    INITIATIVE("Initiative"),
    FOOD_WATER("Food & Water"),
    ARROWS("Arrows"),
}

@Composable
fun ToolsTab(viewModel: CharacterSheetViewModel) {
    var selectedMode by remember { mutableStateOf(DiceMode.SUCCESSES) }
    var d10Count by remember { mutableIntStateOf(0) }
    var d12Count by remember { mutableIntStateOf(0) }
    var d20Count by remember { mutableIntStateOf(0) }
    var results by remember { mutableStateOf<List<DiceRoll>>(emptyList()) }
    var totalResult by remember { mutableStateOf("") }
    var showWikiSearch by remember { mutableStateOf(false) }
    val context = LocalContext.current

    // Wiki search dialog
    if (showWikiSearch) {
        val wikiViewModel: WikiViewModel = hiltViewModel()
        WikiSearchDialog(
            viewModel = wikiViewModel,
            onResultClick = { url ->
                showWikiSearch = false
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                context.startActivity(intent)
            },
            onDismiss = { showWikiSearch = false },
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // Wiki Search Button
        OutlinedButton(
            onClick = { showWikiSearch = true },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Search Wiki")
        }

        HorizontalDivider()

        Text(
            "Dice Roller",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )

        // Mode selector
        SingleChoiceSegmentedButtonRow(modifier = Modifier.fillMaxWidth()) {
            DiceMode.entries.forEachIndexed { index, mode ->
                SegmentedButton(
                    selected = selectedMode == mode,
                    onClick = {
                        selectedMode = mode
                        results = emptyList()
                        totalResult = ""
                    },
                    shape = SegmentedButtonDefaults.itemShape(index, DiceMode.entries.size),
                ) {
                    Text(mode.title, style = MaterialTheme.typography.labelSmall)
                }
            }
        }

        when (selectedMode) {
            DiceMode.SUCCESSES -> {
                ResourceAdjuster(
                    label = "D10",
                    value = d10Count,
                    min = 0,
                    max = 10,
                    onValueChange = { d10Count = it },
                )
                ResourceAdjuster(
                    label = "D12",
                    value = d12Count,
                    min = 0,
                    max = 10,
                    onValueChange = { d12Count = it },
                )
                ResourceAdjuster(
                    label = "D20",
                    value = d20Count,
                    min = 0,
                    max = 10,
                    onValueChange = { d20Count = it },
                )

                Button(
                    onClick = {
                        results = rollSuccessPool(d10Count, d12Count, d20Count)
                        val criticals = results.count { it.result == DiceResult.CRITICAL }
                        val successes = results.count { it.result == DiceResult.SUCCESS }
                        val barelys = results.count { it.result == DiceResult.BARELY }
                        val failures = results.count { it.result == DiceResult.FAILURE }
                        totalResult = "Criticals: $criticals | Successes: $successes | Barely: $barelys | Failures: $failures"
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = d10Count + d12Count + d20Count > 0,
                ) {
                    Text("Roll!")
                }
            }
            DiceMode.INITIATIVE -> {
                Button(
                    onClick = {
                        val d6 = Random.nextInt(1, 7)
                        val d10 = Random.nextInt(1, 11)
                        totalResult = "Initiative: D6=$d6, D10=$d10 -> Total: ${d6 + d10}"
                        results = emptyList()
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Roll Initiative")
                }
            }
            DiceMode.FOOD_WATER -> {
                Button(
                    onClick = {
                        val d1 = Random.nextInt(1, 7)
                        val d2 = Random.nextInt(1, 7)
                        totalResult = "Food & Water: $d1 + $d2 = ${d1 + d2}"
                        results = emptyList()
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Roll Food & Water")
                }
            }
            DiceMode.ARROWS -> {
                Button(
                    onClick = {
                        val d = Random.nextInt(1, 7)
                        totalResult = "Arrows: $d"
                        results = emptyList()
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Roll Arrows")
                }
            }
        }

        // Results
        if (totalResult.isNotBlank()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant,
                ),
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(totalResult, fontWeight = FontWeight.Bold)
                    if (results.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            results.forEach { roll ->
                                val color = when (roll.result) {
                                    DiceResult.CRITICAL -> Color(0xFFFFD700)
                                    DiceResult.SUCCESS -> Color(0xFF4CAF50)
                                    DiceResult.BARELY -> Color(0xFFFF9800)
                                    DiceResult.FAILURE -> Color(0xFFF44336)
                                }
                                Card(
                                    colors = CardDefaults.cardColors(
                                        containerColor = color.copy(alpha = 0.2f),
                                    ),
                                ) {
                                    Text(
                                        text = "${roll.value}",
                                        modifier = Modifier.padding(
                                            horizontal = 8.dp,
                                            vertical = 4.dp,
                                        ),
                                        color = color,
                                        fontWeight = FontWeight.Bold,
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        HorizontalDivider()

        // Rules Reference
        Text(
            "Rules Reference",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
        )

        ExpandableRule(
            title = "Dice Results",
            content = "D10: 1-4 Failure, 5-6 Barely, 7-9 Success, 10 Critical\n" +
                "D12: 1-4 Failure, 5-7 Barely, 8-11 Success, 12 Critical\n" +
                "D20: 1-8 Failure, 9-12 Barely, 13-19 Success, 20 Critical\n" +
                "Critical: Die explodes (re-roll and add result)",
        )

        ExpandableRule(
            title = "Combat",
            content = "Attack: Roll D10 pool (weapon bonus + attribute)\n" +
                "Damage: Based on weapon type\n" +
                "Armor reduces damage by its bonus value\n" +
                "When armor HP reaches 0, it is broken",
        )

        ExpandableRule(
            title = "Bleed & Weakened",
            content = "Bleed: Gained from physical damage. At 6, you die.\n" +
                "Weakened: Gained from magical effects or abilities. At 6, you die.\n" +
                "Rest removes bleed/weakened (full rest clears all, half rest halves).",
        )

        ExpandableRule(
            title = "Resting",
            content = "Full Rest: Restore all HP, clear all bleed and weakened.\n" +
                "Half Rest: Restore half HP, halve bleed and weakened (round down).\n" +
                "Potions: Can be used to restore HP or remove conditions.",
        )

        ExpandableRule(
            title = "Worthiness",
            content = "Range: -10 to +10\n" +
                "Affects how NPCs and cities treat you.\n" +
                "+10 Esteemed: Treated with great respect\n" +
                "0 Unremarkable: People barely notice you\n" +
                "-10 Public Enemy: Actively hunted with a bounty",
        )

        Spacer(modifier = Modifier.height(32.dp))
    }
}

@Composable
private fun ExpandableRule(
    title: String,
    content: String,
) {
    var expanded by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { expanded = !expanded }
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                )
                Icon(
                    imageVector = if (expanded) Icons.Default.KeyboardArrowUp
                    else Icons.Default.KeyboardArrowDown,
                    contentDescription = if (expanded) "Collapse" else "Expand",
                )
            }
            AnimatedVisibility(visible = expanded) {
                Text(
                    text = content,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(start = 16.dp, end = 16.dp, bottom = 16.dp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

// ── Dice rolling logic ────────────────────────────────────────────────────────

/**
 * D10 success thresholds (from diceroller.js):
 *   1-4 = Failure, 5-6 = Barely, 7-9 = Success, 10 = Critical
 */
private fun classifyD10(value: Int): DiceResult = when {
    value == 10 -> DiceResult.CRITICAL
    value >= 7 -> DiceResult.SUCCESS
    value >= 5 -> DiceResult.BARELY
    else -> DiceResult.FAILURE
}

/**
 * D12 success thresholds:
 *   1-4 = Failure, 5-7 = Barely, 8-11 = Success, 12 = Critical
 */
private fun classifyD12(value: Int): DiceResult = when {
    value == 12 -> DiceResult.CRITICAL
    value >= 8 -> DiceResult.SUCCESS
    value >= 5 -> DiceResult.BARELY
    else -> DiceResult.FAILURE
}

/**
 * D20 success thresholds:
 *   1-8 = Failure, 9-12 = Barely, 13-19 = Success, 20 = Critical
 */
private fun classifyD20(value: Int): DiceResult = when {
    value == 20 -> DiceResult.CRITICAL
    value >= 13 -> DiceResult.SUCCESS
    value >= 9 -> DiceResult.BARELY
    else -> DiceResult.FAILURE
}

/**
 * Roll a pool of success dice. Criticals (max value) explode: the die is counted as a
 * critical success and re-rolled, chaining until a non-critical is rolled.
 */
private fun rollSuccessPool(d10: Int, d12: Int, d20: Int): List<DiceRoll> {
    val rolls = mutableListOf<DiceRoll>()

    fun rollExploding(sides: Int, classify: (Int) -> DiceResult) {
        var value = Random.nextInt(1, sides + 1)
        var result = classify(value)
        rolls.add(DiceRoll(value, sides, result))
        while (result == DiceResult.CRITICAL) {
            value = Random.nextInt(1, sides + 1)
            result = classify(value)
            rolls.add(DiceRoll(value, sides, result))
        }
    }

    repeat(d10) { rollExploding(10, ::classifyD10) }
    repeat(d12) { rollExploding(12, ::classifyD12) }
    repeat(d20) { rollExploding(20, ::classifyD20) }

    return rolls
}
