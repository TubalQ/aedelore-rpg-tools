package nu.aedelore.app.ui.theme

import androidx.compose.ui.graphics.Color

// Aedelore (default purple theme)
val AedelorePrimary = Color(0xFF8B5CF6)
val AedeloreSurface = Color(0xFF1A1A2E)
val AedeloreSurfaceVariant = Color(0xFF252542)
val AedeloreBackground = Color(0xFF0F0F1A)
val AedeloreOnPrimary = Color(0xFFFFFFFF)
val AedeloreOnSurface = Color(0xFFE2E8F0)
val AedeloreOnSurfaceVariant = Color(0xFF94A3B8)
val AedeloreOutline = Color(0xFF334155)
val AedeloreError = Color(0xFFEF4444)

// Accent colors used across all themes
val AccentGold = Color(0xFFD4A843)
val AccentCyan = Color(0xFF22D3EE)
val AccentRed = Color(0xFFEF4444)
val AccentGreen = Color(0xFF10B981)
val AccentOrange = Color(0xFFF59E0B)
val AccentPurple = Color(0xFF8B5CF6)

// HP bar colors
val HpGreen = Color(0xFF10B981)
val HpOrange = Color(0xFFF59E0B)
val HpRed = Color(0xFFEF4444)

// Theme color palettes
data class ThemeColors(
    val primary: Color,
    val surface: Color,
    val surfaceVariant: Color,
    val background: Color,
    val onPrimary: Color = Color.White,
    val onSurface: Color = Color(0xFFE2E8F0),
    val onSurfaceVariant: Color = Color(0xFF94A3B8),
    val outline: Color = Color(0xFF334155),
    val accentGreen: Color = Color(0xFF10B981),
    val accentRed: Color = Color(0xFFEF4444),
    val accentGold: Color = Color(0xFFD4A843),
    val accentCyan: Color = Color(0xFF22D3EE),
    val accentOrange: Color = Color(0xFFF59E0B),
    val accentPurple: Color = Color(0xFF8B5CF6),
)

val themeMap = mapOf(
    "aedelore" to ThemeColors(
        primary = Color(0xFF8B5CF6), surface = Color(0xFF1A1A2E),
        surfaceVariant = Color(0xFF252542), background = Color(0xFF0F0F1A),
    ),
    "midnight" to ThemeColors(
        primary = Color(0xFF3B82F6), surface = Color(0xFF0A1628),
        surfaceVariant = Color(0xFF0F1D32), background = Color(0xFF060E1A),
        accentGreen = Color(0xFF50D890), accentRed = Color(0xFFFF6080),
        accentGold = Color(0xFFFFA050), accentCyan = Color(0xFF60D8E8),
        accentOrange = Color(0xFFFFA050), accentPurple = Color(0xFFA080FF),
    ),
    "dark-glass" to ThemeColors(
        primary = Color(0xFF64748B), surface = Color(0xFF1A1A1F),
        surfaceVariant = Color(0xFF252528), background = Color(0xFF0F0F12),
        accentGreen = Color(0xFF00E676), accentRed = Color(0xFFFF5252),
        accentGold = Color(0xFFFFC942), accentCyan = Color(0xFF18FFFF),
        accentOrange = Color(0xFFFFAB00), accentPurple = Color(0xFFB388FF),
    ),
    "ember" to ThemeColors(
        primary = Color(0xFFF97316), surface = Color(0xFF1A0C08),
        surfaceVariant = Color(0xFF251510), background = Color(0xFF0F0804),
        accentGreen = Color(0xFFA0FF00), accentRed = Color(0xFFFF2A2A),
        accentGold = Color(0xFFFFAA00), accentCyan = Color(0xFFFFE033),
        accentOrange = Color(0xFFFF6A00), accentPurple = Color(0xFFFF8C00),
    ),
    "forest" to ThemeColors(
        primary = Color(0xFF22C55E), surface = Color(0xFF0A1208),
        surfaceVariant = Color(0xFF101A0E), background = Color(0xFF060C04),
        accentGreen = Color(0xFF22C55E), accentRed = Color(0xFFEF4444),
        accentGold = Color(0xFFD4A017), accentCyan = Color(0xFF2DD4BF),
        accentOrange = Color(0xFFD97706), accentPurple = Color(0xFFD4A017),
    ),
    "frost" to ThemeColors(
        primary = Color(0xFF06B6D4), surface = Color(0xFF0A1018),
        surfaceVariant = Color(0xFF0F1620), background = Color(0xFF06080E),
        accentGreen = Color(0xFF4ADE80), accentRed = Color(0xFFF472B6),
        accentGold = Color(0xFFFBBF24), accentCyan = Color(0xFF67E8F9),
        accentOrange = Color(0xFFFBBF24), accentPurple = Color(0xFFA78BFA),
    ),
    "void" to ThemeColors(
        primary = Color(0xFF6366F1), surface = Color(0xFF050510),
        surfaceVariant = Color(0xFF0A0A18), background = Color(0xFF020208),
        accentGreen = Color(0xFF4ADE80), accentRed = Color(0xFFFB7185),
        accentGold = Color(0xFFFCD34D), accentCyan = Color(0xFFA5B4FC),
        accentOrange = Color(0xFFFCD34D), accentPurple = Color(0xFFC084FC),
    ),
    "pure-darkness" to ThemeColors(
        primary = Color(0xFF9CA3AF), surface = Color(0xFF0A0A0A),
        surfaceVariant = Color(0xFF141414), background = Color(0xFF000000),
        accentGreen = Color(0xFF22C55E), accentRed = Color(0xFFEF4444),
        accentGold = Color(0xFFD4AF37), accentCyan = Color(0xFFC0C0C0),
        accentOrange = Color(0xFFF59E0B), accentPurple = Color(0xFFA855F7),
    ),
    "blood" to ThemeColors(
        primary = Color(0xFFDC2626), surface = Color(0xFF080404),
        surfaceVariant = Color(0xFF120808), background = Color(0xFF040202),
        accentGreen = Color(0xFF22C55E), accentRed = Color(0xFFB91C1C),
        accentGold = Color(0xFF94A3B8), accentCyan = Color(0xFFA0A0A0),
        accentOrange = Color(0xFFB45309), accentPurple = Color(0xFF7C3AED),
    ),
    "necro" to ThemeColors(
        primary = Color(0xFF4ADE80), surface = Color(0xFF050805),
        surfaceVariant = Color(0xFF0A100A), background = Color(0xFF020402),
        accentGreen = Color(0xFF65A30D), accentRed = Color(0xFFF87171),
        accentGold = Color(0xFFA16207), accentCyan = Color(0xFFBEF264),
        accentOrange = Color(0xFFA16207), accentPurple = Color(0xFF65A30D),
    ),
    "royal" to ThemeColors(
        primary = Color(0xFFA855F7), surface = Color(0xFF0A0610),
        surfaceVariant = Color(0xFF100C18), background = Color(0xFF060408),
        accentGreen = Color(0xFF22C55E), accentRed = Color(0xFFE11D48),
        accentGold = Color(0xFFFBBF24), accentCyan = Color(0xFFC084FC),
        accentOrange = Color(0xFFF59E0B), accentPurple = Color(0xFF9333EA),
    ),
    "crimson" to ThemeColors(
        primary = Color(0xFFE11D48), surface = Color(0xFF0C0506),
        surfaceVariant = Color(0xFF140A0E), background = Color(0xFF060204),
        accentGreen = Color(0xFF22C55E), accentRed = Color(0xFFDC2626),
        accentGold = Color(0xFFD97706), accentCyan = Color(0xFF9CA3AF),
        accentOrange = Color(0xFFD97706), accentPurple = Color(0xFFB45309),
    ),
)
