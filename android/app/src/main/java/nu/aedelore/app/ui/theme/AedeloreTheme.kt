package nu.aedelore.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

@Immutable
data class AedeloreAccentColors(
    val gold: Color = AccentGold,
    val cyan: Color = AccentCyan,
    val red: Color = AccentRed,
    val green: Color = AccentGreen,
    val orange: Color = AccentOrange,
    val purple: Color = AccentPurple,
    val hpGreen: Color = HpGreen,
    val hpOrange: Color = HpOrange,
    val hpRed: Color = HpRed,
)

val LocalAedeloreColors = staticCompositionLocalOf { AedeloreAccentColors() }

@Composable
fun AedeloreTheme(
    themeName: String = "aedelore",
    content: @Composable () -> Unit,
) {
    val palette = themeMap[themeName] ?: themeMap["aedelore"]!!

    val colorScheme = darkColorScheme(
        primary = palette.primary,
        onPrimary = palette.onPrimary,
        surface = palette.surface,
        onSurface = palette.onSurface,
        surfaceVariant = palette.surfaceVariant,
        onSurfaceVariant = palette.onSurfaceVariant,
        background = palette.background,
        onBackground = palette.onSurface,
        outline = palette.outline,
        error = AedeloreError,
        onError = Color.White,
        surfaceContainerLowest = palette.background,
        surfaceContainerLow = palette.surface,
        surfaceContainer = palette.surface,
        surfaceContainerHigh = palette.surfaceVariant,
        surfaceContainerHighest = palette.surfaceVariant,
        inverseSurface = palette.onSurface,
        inverseOnSurface = palette.background,
        inversePrimary = palette.primary,
        secondaryContainer = palette.surfaceVariant,
        onSecondaryContainer = palette.onSurface,
        tertiaryContainer = palette.surfaceVariant,
        onTertiaryContainer = palette.onSurface,
    )

    val accentColors = AedeloreAccentColors(
        gold = palette.accentGold,
        cyan = palette.accentCyan,
        red = palette.accentRed,
        green = palette.accentGreen,
        orange = palette.accentOrange,
        purple = palette.accentPurple,
        hpGreen = palette.accentGreen,
        hpOrange = palette.accentOrange,
        hpRed = palette.accentRed,
    )

    CompositionLocalProvider(LocalAedeloreColors provides accentColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = AedeloreTypography,
            shapes = AedeloreShapes,
            content = content,
        )
    }
}
