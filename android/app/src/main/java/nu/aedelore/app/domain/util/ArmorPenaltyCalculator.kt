package nu.aedelore.app.domain.util

import nu.aedelore.app.domain.gamedata.Armors
import nu.aedelore.app.domain.model.CharacterData

/**
 * Calculates skill penalties from equipped armor.
 *
 * Each armor piece may have a disadvantage string like "-1 Stl", "-2 Per",
 * "-1 Stl, -1 Acro", etc. These penalties apply to the corresponding skills
 * as long as the armor is not broken (current HP > 0).
 *
 * The disadvantage format from the armor data uses abbreviations:
 *   Stl  = Stealth      (dexterity_stealth)
 *   Acro = Acrobatics    (dexterity_acrobatics)
 *   Ath  = Athletics     (strength_athletics)
 *   Per  = Perception    (wisdom_perception)
 *   SoH  = Sleight of Hand (dexterity_sleight_of_hand)
 *
 * Mirrors calculateArmorPenalties() in dashboard.js.
 */
object ArmorPenaltyCalculator {

    data class SkillPenalty(
        val fieldName: String,
        val skillLabel: String,
        val penalty: Int
    )

    /**
     * Maps both abbreviated and full skill names used in armor disadvantage
     * strings to the CharacterData field names.
     */
    private val SKILL_NAME_TO_FIELD: Map<String, String> = mapOf(
        // Full names
        "Stealth"         to "dexterity_stealth",
        "Acrobatics"      to "dexterity_acrobatics",
        "Athletics"       to "strength_athletics",
        "Perception"      to "wisdom_perception",
        "Sleight of Hand" to "dexterity_sleight_of_hand",
        // Abbreviations (used in Armors game data)
        "Stl"  to "dexterity_stealth",
        "Acro" to "dexterity_acrobatics",
        "Ath"  to "strength_athletics",
        "Per"  to "wisdom_perception",
        "SoH"  to "dexterity_sleight_of_hand"
    )

    /**
     * Maps field names back to human-readable skill labels.
     */
    private val FIELD_TO_LABEL: Map<String, String> = mapOf(
        "dexterity_stealth"         to "Stealth",
        "dexterity_acrobatics"      to "Acrobatics",
        "strength_athletics"        to "Athletics",
        "wisdom_perception"         to "Perception",
        "dexterity_sleight_of_hand" to "Sleight of Hand"
    )

    private val DISADVANTAGE_REGEX = Regex("""(-?\d+)\s+(.+)""")

    /**
     * Calculate all skill penalties from the character's currently equipped armor.
     *
     * Broken armor (current HP <= 0) does not apply penalties, matching the
     * web logic which checks `armorCurrent <= 0` before processing.
     *
     * @return a list of skill penalties, aggregated across all armor slots.
     */
    fun calculatePenalties(data: CharacterData): List<SkillPenalty> {
        return calculate(data).map { (field, penalty) ->
            SkillPenalty(
                fieldName = field,
                skillLabel = FIELD_TO_LABEL[field] ?: field,
                penalty = penalty
            )
        }
    }

    /**
     * Calculate penalty map from all equipped, non-broken armor + shield.
     *
     * @return Map of field name to cumulative penalty value.
     */
    fun calculate(data: CharacterData): Map<String, Int> {
        val penaltyMap = mutableMapOf<String, Int>()

        val armorSlots = listOf(
            ArmorSlot(data.armor_1_type, data.armor_1_hp, data.armor_1_current),
            ArmorSlot(data.armor_2_type, data.armor_2_hp, data.armor_2_current),
            ArmorSlot(data.armor_3_type, data.armor_3_hp, data.armor_3_current),
            ArmorSlot(data.armor_4_type, data.armor_4_hp, data.armor_4_current),
            ArmorSlot(data.armor_5_type, data.armor_5_hp, data.armor_5_current)
        )

        for (slot in armorSlots) {
            if (slot.type.isBlank()) continue

            // Skip broken or empty-HP armor
            val hp = slot.hp.toIntOrNull() ?: 0
            val current = slot.current.toIntOrNull() ?: 0
            if (hp <= 0 || current <= 0) continue

            // Look up disadvantage from game data
            val armor = Armors.byName(slot.type) ?: continue
            if (armor.disadvantage.isBlank()) continue

            parseDisadvantage(armor.disadvantage, penaltyMap)
        }

        // Check shield
        if (data.shield_type.isNotBlank()) {
            val shieldHp = data.shield_hp.toIntOrNull() ?: 0
            val shieldCurrent = data.shield_current.toIntOrNull() ?: 0
            if (shieldHp > 0 && shieldCurrent > 0) {
                val shield = Armors.shieldByName(data.shield_type)
                if (shield != null && shield.disadvantage.isNotBlank()) {
                    parseDisadvantage(shield.disadvantage, penaltyMap)
                }
            }
        }

        return penaltyMap
    }

    private fun parseDisadvantage(disadvantage: String, penaltyMap: MutableMap<String, Int>) {
        val parts = disadvantage.split(",").map { it.trim() }
        for (part in parts) {
            val match = DISADVANTAGE_REGEX.find(part) ?: continue
            val penalty = match.groupValues[1].toIntOrNull() ?: continue
            val skillName = match.groupValues[2].trim()
            val fieldName = SKILL_NAME_TO_FIELD[skillName] ?: continue
            penaltyMap[fieldName] = (penaltyMap[fieldName] ?: 0) + penalty
        }
    }

    /**
     * Get the effective skill value (base + armor penalty) for a specific field.
     *
     * @return a Pair of (base value, effective value after penalty).
     */
    fun getEffectiveSkillValue(
        fieldName: String,
        baseValue: Int,
        penalties: List<SkillPenalty>
    ): Pair<Int, Int> {
        val penalty = penalties.find { it.fieldName == fieldName }?.penalty ?: 0
        return baseValue to (baseValue + penalty)
    }

    private data class ArmorSlot(
        val type: String,
        val hp: String,
        val current: String
    )
}
