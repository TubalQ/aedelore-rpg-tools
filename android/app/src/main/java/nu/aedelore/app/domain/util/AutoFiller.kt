package nu.aedelore.app.domain.util

import nu.aedelore.app.domain.gamedata.Armors
import nu.aedelore.app.domain.gamedata.Classes
import nu.aedelore.app.domain.gamedata.Races
import nu.aedelore.app.domain.gamedata.Religions
import nu.aedelore.app.domain.gamedata.StartingEquipments
import nu.aedelore.app.domain.gamedata.Weapons
import nu.aedelore.app.domain.model.CharacterData

/**
 * Auto-fills character stats, equipment, worthiness, arcana, gold, and consumables
 * when the player selects race/class/religion. Mirrors the web app's autofill behaviour.
 */
object AutoFiller {

    /**
     * Apply all auto-fill logic based on the current race, class, and religion.
     * If race or class is blank, returns data unchanged.
     */
    fun applyAutoFill(data: CharacterData): CharacterData {
        if (data.race.isBlank() || data.characterClass.isBlank()) return data

        val race = Races.byName(data.race)
        val cls = Classes.byName(data.characterClass)
        val religion = Religions.byName(data.religion)

        if (race == null || cls == null) return data

        // 1. Attributes/skills
        val baseValues = AttributeDistributor.calculateBaseValues(
            data.race, data.characterClass, data.religion
        )
        var result = applyBaseValues(data, baseValues)

        // 2. HP
        val maxHp = HpCalculator.calculateMaxHp(data.race, data.characterClass)
        result = result.copy(hp_max = maxHp, hp_value = maxHp)

        // 3. Worthiness
        val worthiness = WorthinessDescriptor.calculateStartingWorthiness(
            race.worthiness,
            cls.worthiness,
            religion?.bonuses ?: emptyList()
        )
        result = result.copy(worthiness_value = worthiness)

        // 4. Equipment — reset all slots first, then fill from StartingEquipments
        result = result.copy(
            // Reset weapons 1-3
            weapon_1_type = "", weapon_1_atk_bonus = "", weapon_1_damage = "",
            weapon_1_range = "", weapon_1_break = "",
            weapon_2_type = "", weapon_2_atk_bonus = "", weapon_2_damage = "",
            weapon_2_range = "", weapon_2_break = "",
            weapon_3_type = "", weapon_3_atk_bonus = "", weapon_3_damage = "",
            weapon_3_range = "", weapon_3_break = "",
            // Reset shield
            shield_type = "", shield_hp = "", shield_block = "",
            shield_defence = "", shield_damage = "", shield_current = "",
            shield_broken = false,
            // Reset armors 1-5
            armor_1_type = "", armor_1_hp = "", armor_1_bonus = "",
            armor_1_current = "", armor_1_broken = false, armor_1_disadvantage = "",
            armor_2_type = "", armor_2_hp = "", armor_2_bonus = "",
            armor_2_current = "", armor_2_broken = false, armor_2_disadvantage = "",
            armor_3_type = "", armor_3_hp = "", armor_3_bonus = "",
            armor_3_current = "", armor_3_broken = false, armor_3_disadvantage = "",
            armor_4_type = "", armor_4_hp = "", armor_4_bonus = "",
            armor_4_current = "", armor_4_broken = false, armor_4_disadvantage = "",
            armor_5_type = "", armor_5_hp = "", armor_5_bonus = "",
            armor_5_current = "", armor_5_broken = false, armor_5_disadvantage = ""
        )

        val equip = StartingEquipments.forCombination(data.race, data.characterClass)
        if (equip != null) {
            // Weapon 1
            val weapon = Weapons.byName(equip.weapon)
            if (weapon != null) {
                result = result.copy(
                    weapon_1_type = weapon.name,
                    weapon_1_atk_bonus = weapon.bonus.toString(),
                    weapon_1_damage = weapon.damage,
                    weapon_1_range = weapon.range,
                    weapon_1_break = weapon.breakValue.toString()
                )
            }

            // Head armor → slot 1
            if (equip.headArmor.isNotBlank()) {
                val armor = Armors.byName(equip.headArmor)
                if (armor != null) {
                    result = result.copy(
                        armor_1_type = armor.name,
                        armor_1_hp = armor.hp.toString(),
                        armor_1_bonus = armor.bonus.toString(),
                        armor_1_current = armor.hp.toString(),
                        armor_1_disadvantage = armor.disadvantage
                    )
                }
            }

            // Shoulder armor → slot 2
            if (equip.shoulderArmor.isNotBlank()) {
                val armor = Armors.byName(equip.shoulderArmor)
                if (armor != null) {
                    result = result.copy(
                        armor_2_type = armor.name,
                        armor_2_hp = armor.hp.toString(),
                        armor_2_bonus = armor.bonus.toString(),
                        armor_2_current = armor.hp.toString(),
                        armor_2_disadvantage = armor.disadvantage
                    )
                }
            }

            // Chest armor → slot 3
            if (equip.chestArmor.isNotBlank()) {
                val armor = Armors.byName(equip.chestArmor)
                if (armor != null) {
                    result = result.copy(
                        armor_3_type = armor.name,
                        armor_3_hp = armor.hp.toString(),
                        armor_3_bonus = armor.bonus.toString(),
                        armor_3_current = armor.hp.toString(),
                        armor_3_disadvantage = armor.disadvantage
                    )
                }
            }

            // Hand armor → slot 4
            if (equip.handArmor.isNotBlank()) {
                val armor = Armors.byName(equip.handArmor)
                if (armor != null) {
                    result = result.copy(
                        armor_4_type = armor.name,
                        armor_4_hp = armor.hp.toString(),
                        armor_4_bonus = armor.bonus.toString(),
                        armor_4_current = armor.hp.toString(),
                        armor_4_disadvantage = armor.disadvantage
                    )
                }
            }

            // Leg armor → slot 5
            if (equip.legArmor.isNotBlank()) {
                val armor = Armors.byName(equip.legArmor)
                if (armor != null) {
                    result = result.copy(
                        armor_5_type = armor.name,
                        armor_5_hp = armor.hp.toString(),
                        armor_5_bonus = armor.bonus.toString(),
                        armor_5_current = armor.hp.toString(),
                        armor_5_disadvantage = armor.disadvantage
                    )
                }
            }

            // Shield
            if (equip.shield.isNotBlank()) {
                val shield = Armors.shieldByName(equip.shield)
                if (shield != null) {
                    result = result.copy(
                        shield_type = shield.name,
                        shield_hp = shield.hp.toString(),
                        shield_block = shield.block.toString(),
                        shield_defence = shield.defence.toString(),
                        shield_damage = shield.damage,
                        shield_current = shield.hp.toString()
                    )
                }
            }
        }

        // 5. Gold
        result = result.copy(gold = cls.gold.toString())

        // 6. Arcana
        result = result.copy(
            arcana_max = cls.arcanaMax,
            arcana_value = cls.arcanaStart
        )

        // 7. Consumables — class food/ammo takes priority over race food
        val food = cls.food.ifBlank { race.food }
        result = result.copy(
            food_water = food,
            arrows = cls.ammo
        )

        return result
    }

    /**
     * Apply a map of attribute field names to values onto CharacterData.
     */
    private fun applyBaseValues(data: CharacterData, baseValues: Map<String, Int>): CharacterData {
        var d = data
        for ((key, value) in baseValues) {
            d = when (key) {
                // Primary attributes
                "strength_value" -> d.copy(strength_value = value)
                "dexterity_value" -> d.copy(dexterity_value = value)
                "toughness_value" -> d.copy(toughness_value = value)
                "intelligence_value" -> d.copy(intelligence_value = value)
                "wisdom_value" -> d.copy(wisdom_value = value)
                "force_of_will_value" -> d.copy(force_of_will_value = value)
                "third_eye_value" -> d.copy(third_eye_value = value)
                // Strength skills
                "strength_athletics" -> d.copy(strength_athletics = value)
                "strength_raw_power" -> d.copy(strength_raw_power = value)
                "strength_unarmed" -> d.copy(strength_unarmed = value)
                // Dexterity skills
                "dexterity_endurance" -> d.copy(dexterity_endurance = value)
                "dexterity_acrobatics" -> d.copy(dexterity_acrobatics = value)
                "dexterity_sleight_of_hand" -> d.copy(dexterity_sleight_of_hand = value)
                "dexterity_stealth" -> d.copy(dexterity_stealth = value)
                // Toughness skills
                "toughness_bonus_while_injured" -> d.copy(toughness_bonus_while_injured = value)
                "toughness_resistance" -> d.copy(toughness_resistance = value)
                // Intelligence skills
                "intelligence_arcana" -> d.copy(intelligence_arcana = value)
                "intelligence_history" -> d.copy(intelligence_history = value)
                "intelligence_investigation" -> d.copy(intelligence_investigation = value)
                "intelligence_nature" -> d.copy(intelligence_nature = value)
                "intelligence_religion" -> d.copy(intelligence_religion = value)
                // Wisdom skills
                "wisdom_luck" -> d.copy(wisdom_luck = value)
                "wisdom_animal_handling" -> d.copy(wisdom_animal_handling = value)
                "wisdom_insight" -> d.copy(wisdom_insight = value)
                "wisdom_medicine" -> d.copy(wisdom_medicine = value)
                "wisdom_perception" -> d.copy(wisdom_perception = value)
                "wisdom_survival" -> d.copy(wisdom_survival = value)
                // Force of Will skills
                "force_of_will_deception" -> d.copy(force_of_will_deception = value)
                "force_of_will_intimidation" -> d.copy(force_of_will_intimidation = value)
                "force_of_will_performance" -> d.copy(force_of_will_performance = value)
                "force_of_will_persuasion" -> d.copy(force_of_will_persuasion = value)
                else -> d
            }
        }
        return d
    }
}
