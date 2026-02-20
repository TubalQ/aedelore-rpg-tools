package nu.aedelore.app.domain.util

import nu.aedelore.app.domain.gamedata.Classes
import nu.aedelore.app.domain.gamedata.Races
import nu.aedelore.app.domain.gamedata.Religions

/**
 * Handles attribute point distribution logic.
 *
 * Character creation flow (from progression.js):
 * 1. Select race + class + religion -> base attribute values are auto-filled from bonuses
 * 2. Lock race/class -> enables free point distribution
 * 3. Distribute 10 free points (max 5 total per attribute/skill)
 * 4. Lock attributes -> character is set
 * 5. Later: earn XP, spend 10 XP per additional attribute point
 *
 * Constants from the web code:
 *   FREE_POINTS_TOTAL = 10
 *   MAX_POINTS_PER_ATTRIBUTE = 5
 *   XP per attribute point = 10
 */
object AttributeDistributor {

    const val FREE_POINTS_TOTAL = 10
    const val MAX_POINTS_PER_ATTRIBUTE = 5
    const val XP_PER_ATTRIBUTE_POINT = 10

    /**
     * All attribute and skill field IDs that participate in point distribution.
     * Mirrors ALL_ATTRIBUTE_IDS from progression.js.
     */
    val ALL_ATTRIBUTE_IDS: List<String> = listOf(
        // Primary attributes
        "strength_value", "dexterity_value", "toughness_value",
        "intelligence_value", "wisdom_value", "force_of_will_value",
        // Strength skills
        "strength_athletics", "strength_raw_power", "strength_unarmed",
        // Dexterity skills
        "dexterity_endurance", "dexterity_acrobatics",
        "dexterity_sleight_of_hand", "dexterity_stealth",
        // Toughness skills
        "toughness_bonus_while_injured", "toughness_resistance",
        // Intelligence skills
        "intelligence_arcana", "intelligence_history",
        "intelligence_investigation", "intelligence_nature", "intelligence_religion",
        // Wisdom skills
        "wisdom_luck", "wisdom_animal_handling", "wisdom_insight",
        "wisdom_medicine", "wisdom_perception", "wisdom_survival",
        // Force of Will skills
        "force_of_will_deception", "force_of_will_intimidation",
        "force_of_will_performance", "force_of_will_persuasion"
    )

    /**
     * Calculate the base attribute values from race + class + religion bonuses.
     * These are the starting values before the player distributes free points.
     *
     * Mirrors calculateBaseAttributeValues() in progression.js.
     *
     * @return a map of field ID -> base value.
     */
    fun calculateBaseValues(
        raceName: String,
        className: String,
        religionName: String
    ): Map<String, Int> {
        val base = ALL_ATTRIBUTE_IDS.associateWith { 0 }.toMutableMap()

        val race = Races.byName(raceName)
        val cls = Classes.byName(className)
        val religion = Religions.byName(religionName)

        fun applyBonuses(bonuses: List<String>?) {
            bonuses?.forEach { bonusStr ->
                val parsed = BonusParser.parse(bonusStr) ?: return@forEach
                val fieldId = BonusParser.attributeToField(parsed.attribute) ?: return@forEach
                if (base.containsKey(fieldId)) {
                    base[fieldId] = (base[fieldId] ?: 0) + parsed.value
                }
            }
        }

        applyBonuses(race?.bonuses)
        applyBonuses(cls?.bonuses)
        applyBonuses(religion?.bonuses)

        return base
    }

    /**
     * Calculate the total of all attribute/skill values in the given map.
     */
    fun getTotalPoints(values: Map<String, Int>): Int {
        return ALL_ATTRIBUTE_IDS.sumOf { values[it] ?: 0 }
    }

    /**
     * Calculate how many free points have been spent.
     * Free points = current totals - base totals (from race/class/religion).
     */
    fun getFreePointsUsed(
        currentValues: Map<String, Int>,
        baseValues: Map<String, Int>
    ): Int {
        return getTotalPoints(currentValues) - getTotalPoints(baseValues)
    }

    /**
     * Get remaining free points available for distribution.
     */
    fun getFreePointsRemaining(
        currentValues: Map<String, Int>,
        baseValues: Map<String, Int>
    ): Int {
        return FREE_POINTS_TOTAL - getFreePointsUsed(currentValues, baseValues)
    }

    /**
     * Check if a point can be added to a specific attribute/skill.
     *
     * Rules (from canAddAttributePoint in progression.js):
     * - During free distribution: max 5 per attribute, max 10 total free points
     * - During XP spending: limited by available XP points
     * - Can never decrease below base value
     *
     * @param fieldId        The field to modify.
     * @param currentValue   The current value of that field.
     * @param baseValue      The base value (from race/class/religion bonuses).
     * @param freePointsUsed Total free points already spent across all fields.
     * @param isLocked       Whether attributes are locked (post initial distribution).
     * @param xpPointsAvailable Available XP-earned attribute points (0 if not in XP mode).
     * @param xpPointsSpent  XP points spent in current spending session.
     * @return true if the point can be added.
     */
    fun canAddPoint(
        fieldId: String,
        currentValue: Int,
        baseValue: Int,
        freePointsUsed: Int,
        isLocked: Boolean,
        xpPointsAvailable: Int = 0,
        xpPointsSpent: Int = 0
    ): Boolean {
        // Only manage known attribute/skill fields
        if (fieldId !in ALL_ATTRIBUTE_IDS) return true

        if (isLocked) {
            // Locked mode: can only add via XP spending
            return xpPointsSpent < xpPointsAvailable
        }

        // Free distribution mode
        if (freePointsUsed >= FREE_POINTS_TOTAL) return false
        if (currentValue >= MAX_POINTS_PER_ATTRIBUTE) return false
        return true
    }

    /**
     * Check if a point can be removed from a specific attribute/skill.
     * Cannot go below the base value provided by race/class/religion.
     */
    fun canRemovePoint(
        fieldId: String,
        currentValue: Int,
        baseValue: Int
    ): Boolean {
        if (fieldId !in ALL_ATTRIBUTE_IDS) return true
        return currentValue > baseValue
    }

    /**
     * Calculate how many attribute points are available from earned XP.
     * Every 10 XP earns 1 attribute point.
     *
     * @param totalXp     Total XP earned by the character.
     * @param xpSpent     Total XP already spent on attribute points.
     * @return number of attribute points available to spend.
     */
    fun getXpAttributePoints(totalXp: Int, xpSpent: Int): Int {
        val earned = totalXp / XP_PER_ATTRIBUTE_POINT
        val used = xpSpent / XP_PER_ATTRIBUTE_POINT
        return (earned - used).coerceAtLeast(0)
    }
}
