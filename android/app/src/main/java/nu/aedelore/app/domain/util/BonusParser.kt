package nu.aedelore.app.domain.util

/**
 * Represents a parsed bonus from a string like "+1 Strength" or "+2 Dexterity".
 *
 * @param value      The numeric modifier (positive or negative).
 * @param attribute  The attribute or skill name, e.g. "Strength", "Athletics", "Stealth".
 * @param skill      Present only when the bonus targets a sub-skill via parenthetical
 *                   notation, e.g. "+1 Intelligence (Arcana)" -> skill = "Arcana".
 *                   Currently unused in game data but supported for future extensions.
 */
data class ParsedBonus(
    val value: Int,
    val attribute: String,
    val skill: String? = null
)

/**
 * Parses bonus strings used by races, classes, and religions into structured data.
 *
 * Bonus format examples:
 * - "+1 Strength"
 * - "+2 Dexterity"
 * - "+1 Intelligence (Arcana)"   (parenthetical sub-skill)
 * - "+1 Sleight of Hand"         (multi-word skill)
 * - "+1 Bonus While Injured"     (multi-word skill)
 *
 * Also provides mappings from human-readable attribute/skill names to the
 * CharacterData field names used throughout the app and server API.
 */
object BonusParser {

    private val BONUS_REGEX =
        Regex("""^([+-]?\d+)\s+([\w][\w\s]*?)(?:\s*\(([\w][\w\s]*?)\))?\s*$""")

    /**
     * Complete mapping of attribute and skill names to CharacterData field names.
     * Mirrors the web attributeMapping in character-sheet.html and
     * ATTRIBUTE_NAME_TO_ID in progression.js.
     */
    private val ATTRIBUTE_TO_FIELD: Map<String, String> = mapOf(
        // Primary attributes
        "Strength"     to "strength_value",
        "Dexterity"    to "dexterity_value",
        "Agility"      to "dexterity_value",      // Alias used by some religions
        "Toughness"    to "toughness_value",
        "Intelligence" to "intelligence_value",
        "Wisdom"       to "wisdom_value",
        "Force of Will" to "force_of_will_value",

        // Strength skills
        "Athletics"    to "strength_athletics",
        "Raw Power"    to "strength_raw_power",
        "Unarmed"      to "strength_unarmed",

        // Dexterity skills
        "Endurance"       to "dexterity_endurance",
        "Acrobatics"      to "dexterity_acrobatics",
        "Sleight of Hand" to "dexterity_sleight_of_hand",
        "Stealth"         to "dexterity_stealth",

        // Toughness skills
        "Bonus While Injured" to "toughness_bonus_while_injured",
        "Resistance"          to "toughness_resistance",

        // Intelligence skills
        "Arcana"        to "intelligence_arcana",
        "History"       to "intelligence_history",
        "Investigation" to "intelligence_investigation",
        "Nature"        to "intelligence_nature",
        "Religion"      to "intelligence_religion",

        // Wisdom skills
        "Luck"            to "wisdom_luck",
        "Animal Handling" to "wisdom_animal_handling",
        "Insight"         to "wisdom_insight",
        "Medicine"        to "wisdom_medicine",
        "Perception"      to "wisdom_perception",
        "Survival"        to "wisdom_survival",

        // Force of Will skills
        "Deception"    to "force_of_will_deception",
        "Intimidation" to "force_of_will_intimidation",
        "Performance"  to "force_of_will_performance",
        "Persuasion"   to "force_of_will_persuasion"
    )

    /**
     * Parse a bonus string into a [ParsedBonus].
     *
     * @return parsed result, or `null` if the string does not start with +/- or
     *         cannot be parsed (e.g. "Starting Weapon: Battleaxe").
     */
    fun parse(bonusString: String): ParsedBonus? {
        val trimmed = bonusString.trim()
        // Skip non-bonus strings (e.g. "Starting Weapon: ...")
        if (!trimmed.startsWith('+') && !trimmed.startsWith('-')) return null

        val match = BONUS_REGEX.find(trimmed) ?: return null
        val value = match.groupValues[1].toIntOrNull() ?: return null
        val attribute = match.groupValues[2].trim()
        val skill = match.groupValues[3].trim().ifEmpty { null }
        return ParsedBonus(value, attribute, skill)
    }

    /**
     * Map a human-readable attribute or skill name to the corresponding
     * CharacterData field name.
     *
     * @return the field name (e.g. "strength_value", "dexterity_stealth"),
     *         or `null` if the name is not recognized.
     */
    fun attributeToField(attribute: String): String? {
        return ATTRIBUTE_TO_FIELD[attribute]
    }

    /**
     * Collect all bonuses from a list of bonus strings into a map of
     * field name -> total bonus value.
     *
     * Unrecognized attribute names are silently skipped (matches web behaviour
     * where unknown names simply don't have a matching DOM element).
     */
    fun collectBonuses(bonusStrings: List<String>): Map<String, Int> {
        val result = mutableMapOf<String, Int>()
        for (str in bonusStrings) {
            val parsed = parse(str) ?: continue
            val fieldName = attributeToField(parsed.attribute) ?: continue
            result[fieldName] = (result[fieldName] ?: 0) + parsed.value
        }
        return result
    }
}
