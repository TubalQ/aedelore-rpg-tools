package nu.aedelore.app.ui.common

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import nu.aedelore.app.domain.model.CharacterData
import nu.aedelore.app.domain.util.HpCalculator
import nu.aedelore.app.domain.util.WorthinessDescriptor
import nu.aedelore.app.ui.theme.LocalAedeloreColors

@Composable
fun StatusBar(
    data: CharacterData,
    modifier: Modifier = Modifier,
) {
    val colors = LocalAedeloreColors.current
    val maxHp = HpCalculator.calculateMaxHp(data.race, data.characterClass)
    val effectiveMaxHp = if (maxHp > 0) maxHp else data.hp_max
    val hpFraction = if (effectiveMaxHp > 0) data.hp_value.toFloat() / effectiveMaxHp else 0f
    val hpColor = when {
        hpFraction >= 0.6f -> colors.hpGreen
        hpFraction >= 0.3f -> colors.hpOrange
        else -> colors.hpRed
    }
    val isMagicClass = data.characterClass == "Mage" || data.characterClass == "Druid"

    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surface)
            .windowInsetsPadding(WindowInsets.navigationBars)
            .padding(horizontal = 12.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // HP
        StatusItem(
            label = "HP",
            value = "${data.hp_value}/${effectiveMaxHp}",
            color = hpColor,
        )

        // Arcana (only for Mage/Druid)
        if (isMagicClass) {
            StatusItem(
                label = "ARC",
                value = "${data.arcana_value}/${data.arcana_max}",
                color = colors.cyan,
            )
        }

        // Willpower dots
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "WP",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontSize = 9.sp,
            )
            Row(horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                repeat(3) { index ->
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(
                                if (index < data.willpower_value)
                                    colors.gold
                                else
                                    MaterialTheme.colorScheme.outline
                            ),
                    )
                }
            }
        }

        // Bleed
        if (data.bleed_value > 0) {
            StatusItem(
                label = "BLD",
                value = data.bleed_value.toString(),
                color = colors.red,
            )
        }

        // Weakened
        if (data.weakened_value > 0) {
            StatusItem(
                label = "WKN",
                value = data.weakened_value.toString(),
                color = colors.orange,
            )
        }

        // Worthiness
        StatusItem(
            label = "WRT",
            value = "${data.worthiness_value}",
            color = colors.purple,
            subLabel = WorthinessDescriptor.describeShort(data.worthiness_value),
        )
    }
}

@Composable
private fun StatusItem(
    label: String,
    value: String,
    color: Color,
    subLabel: String? = null,
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            fontSize = 9.sp,
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.Bold,
            color = color,
        )
        if (subLabel != null) {
            Text(
                text = subLabel,
                style = MaterialTheme.typography.labelSmall,
                color = color.copy(alpha = 0.7f),
                fontSize = 8.sp,
            )
        }
    }
}
