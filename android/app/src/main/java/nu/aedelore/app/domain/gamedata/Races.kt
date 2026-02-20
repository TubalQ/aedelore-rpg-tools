package nu.aedelore.app.domain.gamedata

object Races {

    data class Race(
        val name: String,
        val bonuses: List<String>,
        val hp: Int,
        val worthiness: Int,
        val food: String
    )

    val all: List<Race> = listOf(
        Race(
            name = "Human",
            bonuses = listOf(
                "+1 Strength", "+1 Dexterity", "+1 Toughness", "+1 Intelligence",
                "+1 Wisdom", "+1 Athletics", "+1 Perception", "+1 Performance",
                "+1 Survival", "+1 Investigation"
            ),
            hp = 20,
            worthiness = 7,
            food = "1D6"
        ),
        Race(
            name = "Dwarf",
            bonuses = listOf(
                "+2 Strength", "+1 Toughness", "+1 Force of Will", "+1 Raw Power",
                "+2 History", "+2 Survival", "+1 Resistance"
            ),
            hp = 22,
            worthiness = 7,
            food = "1D10"
        ),
        Race(
            name = "Halfling",
            bonuses = listOf(
                "+2 Dexterity", "+1 Strength", "+1 Toughness", "+1 Intelligence",
                "+1 Wisdom", "+1 Acrobatics", "+1 Stealth", "+1 Sleight of Hand",
                "+1 Perception"
            ),
            hp = 14,
            worthiness = 8,
            food = "1D6"
        ),
        Race(
            name = "High Elf",
            bonuses = listOf(
                "+1 Dexterity", "+2 Intelligence", "+2 Wisdom", "+1 Acrobatics",
                "+2 History", "+2 Nature", "+1 Medicine", "+1 Perception"
            ),
            hp = 16,
            worthiness = 10,
            food = "1D10"
        ),
        Race(
            name = "Moon Elf",
            bonuses = listOf(
                "+2 Dexterity", "+1 Wisdom", "+2 Acrobatics", "+1 Stealth",
                "+1 Unarmed", "+1 Endurance", "+1 Animal Handling", "+1 Insight"
            ),
            hp = 18,
            worthiness = 4,
            food = "1D6"
        ),
        Race(
            name = "Orc",
            bonuses = listOf(
                "+2 Strength", "+2 Toughness", "+2 Raw Power", "+1 Endurance",
                "+1 Unarmed", "+2 Intimidation"
            ),
            hp = 24,
            worthiness = -5,
            food = "1D6"
        ),
        Race(
            name = "Troll",
            bonuses = listOf(
                "+1 Dexterity", "+2 Toughness", "+2 Athletics", "+1 Endurance",
                "+2 Resistance", "+2 Survival"
            ),
            hp = 20,
            worthiness = 2,
            food = "1D6"
        )
    )

    fun byName(name: String): Race? = all.find {
        it.name.equals(name, ignoreCase = true)
    }
}
