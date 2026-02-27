package nu.aedelore.app.ui.common

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import nu.aedelore.app.ui.theme.LocalAedeloreColors

@Composable
fun HpBar(
    current: Int,
    max: Int,
    modifier: Modifier = Modifier,
) {
    val fraction = if (max > 0) (current.toFloat() / max).coerceIn(0f, 1f) else 0f
    val colors = LocalAedeloreColors.current
    val barColor = when {
        fraction >= 0.6f -> colors.hpGreen
        fraction >= 0.3f -> colors.hpOrange
        else -> colors.hpRed
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(24.dp),
    ) {
        // Background
        Box(
            modifier = Modifier
                .fillMaxSize()
                .clip(RoundedCornerShape(4.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant),
        )
        // Fill
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .fillMaxWidth(fraction)
                .clip(RoundedCornerShape(4.dp))
                .background(barColor),
        )
        // Text
        Text(
            text = "$current / $max",
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.align(Alignment.Center),
        )
    }
}
