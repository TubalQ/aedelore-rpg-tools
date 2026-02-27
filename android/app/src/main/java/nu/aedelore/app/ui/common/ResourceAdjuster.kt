package nu.aedelore.app.ui.common

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.wrapContentWidth
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun ResourceAdjuster(
    label: String,
    value: Int,
    min: Int,
    max: Int,
    onValueChange: (Int) -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f),
        )

        Row(verticalAlignment = Alignment.CenterVertically) {
            FilledTonalIconButton(
                onClick = { if (value > min) onValueChange(value - 1) },
                enabled = enabled && value > min,
                modifier = Modifier.size(36.dp),
            ) {
                Text("-", fontWeight = FontWeight.Bold)
            }

            Text(
                text = "$value",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .widthIn(min = 40.dp)
                    .wrapContentWidth(Alignment.CenterHorizontally),
            )

            FilledTonalIconButton(
                onClick = { if (value < max) onValueChange(value + 1) },
                enabled = enabled && value < max,
                modifier = Modifier.size(36.dp),
            ) {
                Text("+", fontWeight = FontWeight.Bold)
            }
        }
    }
}
