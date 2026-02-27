package nu.aedelore.app.domain.gamedata

object Religions {

    data class Religion(
        val name: String,
        val deity: String,
        val bonuses: List<String>
    )

    val all: List<Religion> = listOf(
        Religion(
            name = "Creed of Shadows (Noctara)",
            deity = "Noctara, Veiled Mistress of Shadows",
            bonuses = listOf("+1 Stealth", "+1 Deception")
        ),
        Religion(
            name = "The Shattered Path (Tatsu)",
            deity = "Tatsu, Dragon God of Exile",
            bonuses = listOf("+1 Perception", "+1 Insight")
        ),
        Religion(
            name = "The Silent Hunt (Groove Guardian)",
            deity = "The Groove Guardian, Wild Spirit",
            bonuses = listOf("+1 Agility", "+1 Survival")
        ),
        Religion(
            name = "The Stone's Heart (Great Mountain)",
            deity = "The Great Mountain, Father of Stone",
            bonuses = listOf("+1 History", "+1 Perception")
        ),
        Religion(
            name = "The Veil of Tohu",
            deity = "Tohu, Dragon Goddess of Magic",
            bonuses = listOf("+1 Arcana", "+1 History")
        ),
        Religion(
            name = "Earthsong Covenant",
            deity = "The Spirit of the Land",
            bonuses = listOf("+1 Medicine", "+1 Nature")
        ),
        Religion(
            name = "The Flame of Taninsam",
            deity = "Taninsam, Dragon God of Fire",
            bonuses = listOf("+1 Toughness", "+1 Endurance")
        ),
        Religion(
            name = "Nature's Embrace (Tiamat)",
            deity = "Tiamat, Steadfast God of Earth",
            bonuses = listOf("+1 Endurance", "+1 Nature")
        ),
        Religion(
            name = "The Soul of the Clan",
            deity = "The Spirit of the Clan",
            bonuses = listOf("+1 Toughness", "+1 Unarmed")
        ),
        Religion(
            name = "The Abyssal Veil",
            deity = "Nyxora & Zelgor",
            bonuses = listOf("+2 Deception", "-5 Worthiness")
        ),
        Religion(
            name = "The Radiant Path",
            deity = "The Eternal Flame",
            bonuses = listOf("+1 Endurance", "+1 Resistance")
        ),
        Religion(
            name = "The Black Rebellion",
            deity = "Malcath, The Fallen Sovereign",
            bonuses = listOf("+2 Deception", "-5 Worthiness")
        ),
        Religion(
            name = "The Arcane Creed",
            deity = "The Arcane Weave",
            bonuses = listOf("+1 Arcana", "+1 History")
        ),
        Religion(
            name = "The Voices of the Forgotten Loa",
            deity = "The Forgotten Loa",
            bonuses = listOf("+1 Survival", "+1 Religion")
        ),
        Religion(
            name = "None",
            deity = "No deity",
            bonuses = emptyList()
        )
    )

    fun byName(name: String): Religion? = all.find {
        it.name.equals(name, ignoreCase = true)
    }
}
