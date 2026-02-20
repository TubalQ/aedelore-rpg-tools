package nu.aedelore.app.domain.util

/**
 * Maps worthiness values (-10 to +10) to descriptive text.
 *
 * Worthiness represents a character's reputation in society.
 * It is calculated from race + class + religion bonuses, then adjusted
 * during gameplay by the DM.
 *
 * Two description styles are provided, matching the web implementation:
 *   - [describeShort] from getSimpleWorthiness() in dashboard.js
 *   - [describeLong]  from getWorthinessDescription() in sliders.js
 */
object WorthinessDescriptor {

    /**
     * Short single-word/phrase label for status bars and compact displays.
     * Exact values from getSimpleWorthiness() in dashboard.js.
     */
    fun describeShort(value: Int): String {
        return when {
            value == 10  -> "Esteemed"
            value >= 9   -> "Trustworthy"
            value >= 7   -> "Respected"
            value >= 5   -> "Ordinary"
            value >= 3   -> "Watched"
            value >= 1   -> "Stranger"
            value == 0   -> "Unremarkable"
            value >= -2  -> "Distrusted"
            value >= -5  -> "Bad Rep"
            value >= -8  -> "Notorious"
            value == -10 -> "Public Enemy"
            else         -> "Hunted"       // -9
        }
    }

    /**
     * Full descriptive sentence for the worthiness detail view.
     * Exact values from getWorthinessDescription() in sliders.js.
     */
    fun describeLong(value: Int): String {
        return when {
            value == 10  -> "You are highly esteemed and treated with great respect everywhere"
            value >= 9   -> "You seem trustworthy and are welcomed in most cities"
            value >= 7   -> "People respect you and listen to what you have to say"
            value >= 5   -> "Nobody has anything against you, you are an ordinary citizen"
            value >= 3   -> "People accept you but keep an eye on you"
            value >= 1   -> "You are a stranger, people are cautious around you"
            value == 0   -> "You are unremarkable, people barely notice you"
            value >= -2  -> "Distrust follows you, people keep their distance"
            value >= -5  -> "Bad reputation, guards are keeping tabs on you"
            value >= -8  -> "You are notorious, many cities don't want you here"
            value == -10 -> "You are a public enemy, actively hunted with a bounty on your head"
            else         -> "You are hunted from cities and have wanted posters up"  // -9
        }
    }

    /**
     * Calculate starting worthiness from race + class + religion bonuses.
     *
     * Mirrors autoFillWorthiness() in character-sheet.html:
     *   total = race.worthiness + class.worthiness + religion worthiness bonuses
     *   clamped to [-10, 10]
     */
    fun calculateStartingWorthiness(
        raceWorthiness: Int,
        classWorthiness: Int,
        religionBonuses: List<String> = emptyList()
    ): Int {
        var total = raceWorthiness + classWorthiness

        // Parse religion bonuses for worthiness modifiers
        for (bonus in religionBonuses) {
            val match = Regex("""^([+-]\d+)\s+Worthiness$""", RegexOption.IGNORE_CASE)
                .find(bonus.trim())
            if (match != null) {
                total += match.groupValues[1].toIntOrNull() ?: 0
            }
        }

        // Clamp to slider range
        return total.coerceIn(-10, 10)
    }
}
