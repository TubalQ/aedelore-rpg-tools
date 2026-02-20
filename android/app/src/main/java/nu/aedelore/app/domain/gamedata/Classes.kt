package nu.aedelore.app.domain.gamedata

object Classes {

    data class CharacterClass(
        val name: String,
        val bonuses: List<String>,
        val hpBonus: Int,
        val worthiness: Int,
        val abilitySlots: Int,
        val isMagicClass: Boolean,
        val gold: Int = 0,
        val food: String = "",
        val ammo: String = "",
        val arcanaMax: Int = 0,
        val arcanaStart: Int = 0
    )

    val all: List<CharacterClass> = listOf(
        CharacterClass(
            name = "Warrior",
            bonuses = listOf(
                "+1 Strength", "+1 Toughness", "+1 Athletics", "+1 Endurance",
                "+1 Unarmed", "+1 Intimidation", "+1 Raw Power", "+1 Resistance"
            ),
            hpBonus = 5,
            worthiness = 3,
            abilitySlots = 3,
            isMagicClass = false,
            gold = 2
        ),
        CharacterClass(
            name = "Thief/Rogue",
            bonuses = listOf(
                "+2 Dexterity", "+1 Sleight of Hand", "+1 Stealth", "+1 Investigation",
                "+1 Acrobatics", "+1 Perception", "+1 Deception"
            ),
            hpBonus = 2,
            worthiness = -4,
            abilitySlots = 3,
            isMagicClass = false,
            gold = 7
        ),
        CharacterClass(
            name = "Outcast",
            bonuses = listOf(
                "+1 Strength", "+2 Toughness", "+2 Stealth", "+1 Resistance",
                "+1 Investigation", "+1 Nature"
            ),
            hpBonus = 4,
            worthiness = -2,
            abilitySlots = 3,
            isMagicClass = false,
            gold = 2,
            food = "1D10"
        ),
        CharacterClass(
            name = "Mage",
            bonuses = listOf(
                "+2 Intelligence", "+2 Wisdom", "+1 Arcana", "+2 History",
                "+1 Religion"
            ),
            hpBonus = 2,
            worthiness = 6,
            abilitySlots = 10,
            isMagicClass = true,
            gold = 10,
            arcanaMax = 20,
            arcanaStart = 10
        ),
        CharacterClass(
            name = "Hunter",
            bonuses = listOf(
                "+1 Dexterity", "+1 Wisdom", "+1 Perception", "+1 Animal Handling",
                "+1 Survival", "+1 Insight", "+1 Nature", "+1 Stealth"
            ),
            hpBonus = 3,
            worthiness = 4,
            abilitySlots = 3,
            isMagicClass = false,
            gold = 3,
            food = "1D10",
            ammo = "1D10 Arrows"
        ),
        CharacterClass(
            name = "Druid",
            bonuses = listOf(
                "+1 Dexterity", "+2 Wisdom", "+1 Nature", "+2 Medicine",
                "+2 Animal Handling"
            ),
            hpBonus = 3,
            worthiness = 3,
            abilitySlots = 5,
            isMagicClass = true,
            gold = 2,
            arcanaMax = 16,
            arcanaStart = 8
        )
    )

    fun byName(name: String): CharacterClass? = all.find {
        it.name.equals(name, ignoreCase = true)
    }
}
