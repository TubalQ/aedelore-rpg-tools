package nu.aedelore.app.domain.gamedata

object Weapons {

    data class Weapon(
        val name: String,
        val type: String,
        val ability: String,
        val bonus: Int,
        val damage: String,
        val range: String,
        val breakValue: Int
    )

    val all: List<Weapon> = listOf(
        // Simple Melee
        Weapon("Club", "Simple Melee", "Strength", 1, "1d6", "1", 1),
        Weapon("Dagger", "Simple Melee", "Dexterity", 1, "1d6", "1", 0),
        Weapon("Greatclub", "Simple Melee", "Strength", 2, "1d10", "2", 3),
        Weapon("Handaxe", "Simple Melee", "Strength", 1, "1d6", "1", 2),
        Weapon("Javelin", "Simple Melee/Ranged", "Strength", 1, "1d6", "3/10", 1),
        Weapon("Light Hammer", "Simple Melee", "Strength", 1, "1d6", "1", 2),
        Weapon("Mace", "Simple Melee", "Strength", 1, "1d6", "1", 2),
        Weapon("Quarterstaff", "Simple Melee", "Dexterity", 1, "1d6", "3", 1),
        Weapon("Sickle", "Simple Melee", "Strength", 1, "1d6", "1", 0),
        Weapon("Spear", "Simple Melee", "Strength", 1, "1d6", "3", 1),

        // Martial Melee
        Weapon("Battleaxe", "Martial Melee", "Strength", 2, "1d10", "1", 3),
        Weapon("Flail", "Martial Melee", "Strength", 2, "1d10", "1", 2),
        Weapon("Glaive", "Martial Melee (Reach)", "Strength", 2, "1d10", "3", 2),
        Weapon("Greataxe", "Martial Melee", "Strength", 3, "2d6", "2", 5),
        Weapon("Greatsword", "Martial Melee", "Strength", 3, "2d6", "2", 3),
        Weapon("Halberd", "Martial Melee (Reach)", "Strength", 2, "1d10", "3", 3),
        Weapon("Lance", "Martial Melee (Reach)", "Strength", 2, "2d6", "3", 2),
        Weapon("Longsword", "Martial Melee", "Strength", 2, "1d10", "2", 2),
        Weapon("Maul", "Martial Melee", "Strength", 3, "2d6", "2", 5),
        Weapon("Morningstar", "Martial Melee", "Strength", 2, "1d10", "1", 3),
        Weapon("Pike", "Martial Melee (Reach)", "Strength", 2, "1d10", "3", 2),
        Weapon("Rapier", "Martial Melee", "Dexterity", 2, "1d10", "2", 0),
        Weapon("Scimitar", "Martial Melee", "Dexterity", 2, "1d6", "1", 1),
        Weapon("Shortsword", "Martial Melee", "Dexterity", 2, "1d6", "1", 1),
        Weapon("Trident", "Martial Melee", "Strength", 1, "1d6", "3", 1),
        Weapon("War Pick", "Martial Melee", "Strength", 2, "1d10", "1", 4),
        Weapon("Warhammer", "Martial Melee", "Strength", 2, "1d10", "1", 4),
        Weapon("Whip", "Martial Melee (Reach)", "Dexterity", 1, "1d6", "3", 0),

        // Ranged
        Weapon("Crossbow (Light)", "Ranged", "Dexterity", 2, "1d6", "20/40", 0),
        Weapon("Dart", "Ranged", "Dexterity", 1, "1d6", "5/15", 0),
        Weapon("Shortbow", "Ranged", "Dexterity", 2, "1d6", "20/40", 0),
        Weapon("Sling", "Ranged", "Dexterity", 1, "1d6", "10/30", 0),
        Weapon("Blowgun", "Ranged", "Dexterity", 1, "1", "8/24", 0),
        Weapon("Crossbow (Hand)", "Ranged", "Dexterity", 2, "1d6", "10/30", 0),
        Weapon("Crossbow (Heavy)", "Ranged", "Strength", 2, "1d10", "30/60", 1),
        Weapon("Longbow", "Ranged", "Dexterity", 2, "1d10", "40/80", 0),
        Weapon("Net", "Ranged", "Dexterity", 0, "-", "2/5", 0),

        // Fantasy
        Weapon("Falchion", "Fantasy Melee", "Strength", 2, "1d10", "1", 2),
        Weapon("Claymore", "Fantasy Melee", "Strength", 3, "2d6", "2", 4),
        Weapon("Katana", "Fantasy Melee", "Strength/Dexterity", 2, "1d10", "2", 2),
        Weapon("Guisarme", "Fantasy Melee (Reach)", "Strength", 2, "1d10", "3", 3),
        Weapon("Scythe", "Fantasy Melee", "Strength", 1, "1d10", "2", 1),
        Weapon("Throwing Axe", "Fantasy Ranged", "Dexterity", 2, "1d6", "5/15", 1),
        Weapon("Spiked Shield", "Fantasy Melee", "Strength", 1, "1d6", "1", 1),
        Weapon("Chakram", "Fantasy Ranged", "Dexterity", 2, "1d6", "10/30", 0),
        Weapon("Flamberge", "Fantasy Melee", "Strength", 2, "2d6", "2", 3),
        Weapon("Bone Club", "Fantasy Melee", "Strength", 1, "1d6", "1", 1)
    )

    fun byName(name: String): Weapon? = all.find {
        it.name.equals(name, ignoreCase = true)
    }
}
