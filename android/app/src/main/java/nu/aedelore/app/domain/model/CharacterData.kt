package nu.aedelore.app.domain.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Maps to the JSONB character data stored on the server.
 * All fields have sensible defaults so the class can be instantiated empty.
 */
@Serializable
data class CharacterData(

    // ── Basic Info ──────────────────────────────────────────────────────

    val character_name: String = "",
    val player_name: String = "",
    val race: String = "",
    @SerialName("class")
    val characterClass: String = "",
    val religion: String = "",
    val background: String = "",
    val miscs: String = "",

    // ── Attributes (7) ─────────────────────────────────────────────────

    val strength_value: Int = 0,
    val dexterity_value: Int = 0,
    val toughness_value: Int = 0,
    val intelligence_value: Int = 0,
    val wisdom_value: Int = 0,
    val force_of_will_value: Int = 0,
    val third_eye_value: Int = 0,

    // ── Skills: Strength ───────────────────────────────────────────────

    val strength_athletics: Int = 0,
    val strength_raw_power: Int = 0,
    val strength_unarmed: Int = 0,

    // ── Skills: Dexterity ──────────────────────────────────────────────

    val dexterity_endurance: Int = 0,
    val dexterity_acrobatics: Int = 0,
    val dexterity_sleight_of_hand: Int = 0,
    val dexterity_stealth: Int = 0,

    // ── Skills: Toughness ──────────────────────────────────────────────

    val toughness_bonus_while_injured: Int = 0,
    val toughness_resistance: Int = 0,

    // ── Skills: Intelligence ───────────────────────────────────────────

    val intelligence_arcana: Int = 0,
    val intelligence_history: Int = 0,
    val intelligence_investigation: Int = 0,
    val intelligence_nature: Int = 0,
    val intelligence_religion: Int = 0,

    // ── Skills: Wisdom ─────────────────────────────────────────────────

    val wisdom_luck: Int = 0,
    val wisdom_animal_handling: Int = 0,
    val wisdom_insight: Int = 0,
    val wisdom_medicine: Int = 0,
    val wisdom_perception: Int = 0,
    val wisdom_survival: Int = 0,

    // ── Skills: Force of Will ──────────────────────────────────────────

    val force_of_will_deception: Int = 0,
    val force_of_will_intimidation: Int = 0,
    val force_of_will_performance: Int = 0,
    val force_of_will_persuasion: Int = 0,

    // ── Resources ──────────────────────────────────────────────────────

    val hp_value: Int = 0,
    val hp_max: Int = 20,
    val arcana_value: Int = 0,
    val arcana_max: Int = 10,
    val willpower_value: Int = 3,    // range 0-3, starts at max
    val bleed_value: Int = 0,        // range 0-6
    val weakened_value: Int = 0,     // range 0-6
    val worthiness_value: Int = 0,   // range -10 to 10

    // ── Shield ─────────────────────────────────────────────────────────

    val shield_type: String = "",
    val shield_hp: String = "",
    val shield_block: String = "",
    val shield_defence: String = "",
    val shield_damage: String = "",
    val shield_current: String = "",
    val shield_broken: Boolean = false,

    // ── Armor Slot 1 ───────────────────────────────────────────────────

    val armor_1_type: String = "",
    val armor_1_hp: String = "",
    val armor_1_bonus: String = "",
    val armor_1_current: String = "",
    val armor_1_broken: Boolean = false,
    val armor_1_disadvantage: String = "",

    // ── Armor Slot 2 ───────────────────────────────────────────────────

    val armor_2_type: String = "",
    val armor_2_hp: String = "",
    val armor_2_bonus: String = "",
    val armor_2_current: String = "",
    val armor_2_broken: Boolean = false,
    val armor_2_disadvantage: String = "",

    // ── Armor Slot 3 ───────────────────────────────────────────────────

    val armor_3_type: String = "",
    val armor_3_hp: String = "",
    val armor_3_bonus: String = "",
    val armor_3_current: String = "",
    val armor_3_broken: Boolean = false,
    val armor_3_disadvantage: String = "",

    // ── Armor Slot 4 ───────────────────────────────────────────────────

    val armor_4_type: String = "",
    val armor_4_hp: String = "",
    val armor_4_bonus: String = "",
    val armor_4_current: String = "",
    val armor_4_broken: Boolean = false,
    val armor_4_disadvantage: String = "",

    // ── Armor Slot 5 ───────────────────────────────────────────────────

    val armor_5_type: String = "",
    val armor_5_hp: String = "",
    val armor_5_bonus: String = "",
    val armor_5_current: String = "",
    val armor_5_broken: Boolean = false,
    val armor_5_disadvantage: String = "",

    // ── Weapon Slot 1 ──────────────────────────────────────────────────

    val weapon_1_type: String = "",
    val weapon_1_atk_bonus: String = "",
    val weapon_1_damage: String = "",
    val weapon_1_range: String = "",
    val weapon_1_break: String = "",

    // ── Weapon Slot 2 ──────────────────────────────────────────────────

    val weapon_2_type: String = "",
    val weapon_2_atk_bonus: String = "",
    val weapon_2_damage: String = "",
    val weapon_2_range: String = "",
    val weapon_2_break: String = "",

    // ── Weapon Slot 3 ──────────────────────────────────────────────────

    val weapon_3_type: String = "",
    val weapon_3_atk_bonus: String = "",
    val weapon_3_damage: String = "",
    val weapon_3_range: String = "",
    val weapon_3_break: String = "",

    // ── Spell Slot 1 ───────────────────────────────────────────────────

    val spell_1: String = "",
    val spell_1_damage: String = "",
    val spell_1_arcana: String = "",
    val spell_1_weakened: String = "",
    val spell_1_gain: String = "",

    // ── Spell Slot 2 ───────────────────────────────────────────────────

    val spell_2: String = "",
    val spell_2_damage: String = "",
    val spell_2_arcana: String = "",
    val spell_2_weakened: String = "",
    val spell_2_gain: String = "",

    // ── Spell Slot 3 ───────────────────────────────────────────────────

    val spell_3: String = "",
    val spell_3_damage: String = "",
    val spell_3_arcana: String = "",
    val spell_3_weakened: String = "",
    val spell_3_gain: String = "",

    // ── Spell Slot 4 ───────────────────────────────────────────────────

    val spell_4: String = "",
    val spell_4_damage: String = "",
    val spell_4_arcana: String = "",
    val spell_4_weakened: String = "",
    val spell_4_gain: String = "",

    // ── Spell Slot 5 ───────────────────────────────────────────────────

    val spell_5: String = "",
    val spell_5_damage: String = "",
    val spell_5_arcana: String = "",
    val spell_5_weakened: String = "",
    val spell_5_gain: String = "",

    // ── Spell Slot 6 ───────────────────────────────────────────────────

    val spell_6: String = "",
    val spell_6_damage: String = "",
    val spell_6_arcana: String = "",
    val spell_6_weakened: String = "",
    val spell_6_gain: String = "",

    // ── Spell Slot 7 ───────────────────────────────────────────────────

    val spell_7: String = "",
    val spell_7_damage: String = "",
    val spell_7_arcana: String = "",
    val spell_7_weakened: String = "",
    val spell_7_gain: String = "",

    // ── Spell Slot 8 ───────────────────────────────────────────────────

    val spell_8: String = "",
    val spell_8_damage: String = "",
    val spell_8_arcana: String = "",
    val spell_8_weakened: String = "",
    val spell_8_gain: String = "",

    // ── Spell Slot 9 ───────────────────────────────────────────────────

    val spell_9: String = "",
    val spell_9_damage: String = "",
    val spell_9_arcana: String = "",
    val spell_9_weakened: String = "",
    val spell_9_gain: String = "",

    // ── Spell Slot 10 ──────────────────────────────────────────────────

    val spell_10: String = "",
    val spell_10_damage: String = "",
    val spell_10_arcana: String = "",
    val spell_10_weakened: String = "",
    val spell_10_gain: String = "",

    // ── Currency ───────────────────────────────────────────────────────

    val gold: String = "",
    val silver: String = "",
    val copper: String = "",

    // ── Consumables ────────────────────────────────────────────────────

    val food_water: String = "",
    val pot_adrenaline_slider: Int = 0,
    val pot_antidote_slider: Int = 0,
    val pot_poison_slider: Int = 0,
    val pot_arcane_slider: Int = 0,
    val arrows: String = "",
    val poison_arrow_slider: Int = 0,

    // ── Inventory Slots (10) ───────────────────────────────────────────

    val inventory_1: String = "",
    val inventory_2: String = "",
    val inventory_3: String = "",
    val inventory_4: String = "",
    val inventory_5: String = "",
    val inventory_6: String = "",
    val inventory_7: String = "",
    val inventory_8: String = "",
    val inventory_9: String = "",
    val inventory_10: String = "",

    // ── Reminders (10) ─────────────────────────────────────────────────

    val reminder_1: String = "",
    val reminder_2: String = "",
    val reminder_3: String = "",
    val reminder_4: String = "",
    val reminder_5: String = "",
    val reminder_6: String = "",
    val reminder_7: String = "",
    val reminder_8: String = "",
    val reminder_9: String = "",
    val reminder_10: String = "",

    // ── Notes ──────────────────────────────────────────────────────────

    val inventory_freetext: String = "",
    val notes_freetext: String = "",

    // ── Equipment Text ─────────────────────────────────────────────────

    val equipment_1: String = "",
    val equipment_2: String = "",

    // ── Injuries ───────────────────────────────────────────────────────

    val injuries_text: String = "",

    // ── Avatar ─────────────────────────────────────────────────────────

    @SerialName("_avatar")
    val avatar: AvatarData? = null,

    // ── Quest Items (server-managed, included in GET responses) ────────

    val quest_items: List<QuestItemData> = emptyList(),
    val quest_items_archived: List<QuestItemData> = emptyList()
) {

    @Serializable
    data class AvatarData(
        val type: String = "",
        val value: String = ""
    )

    @Serializable
    data class QuestItemData(
        val name: String = "",
        val description: String = "",
        @SerialName("given_at")
        val givenAt: String? = null,
        @SerialName("session_name")
        val sessionName: String? = null,
        @SerialName("archived_at")
        val archivedAt: String? = null
    )
}
