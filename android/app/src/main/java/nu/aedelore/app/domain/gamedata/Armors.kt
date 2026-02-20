package nu.aedelore.app.domain.gamedata

object Armors {

    data class Armor(
        val name: String,
        val bodyPart: String,
        val type: String,
        val hp: Int,
        val bonus: Int,
        val disadvantage: String
    )

    data class Shield(
        val name: String,
        val hp: Int,
        val block: Int,
        val defence: Int,
        val damage: String,
        val disadvantage: String
    )

    val all: List<Armor> = listOf(
        // Head
        Armor("Cloth Hood", "Head", "Light", 1, 0, ""),
        Armor("Leather Cap", "Head", "Light", 2, 0, "-1 Per"),
        Armor("Chain Coif", "Head", "Medium", 8, 1, "-1 Per"),
        Armor("Light Helmet", "Head", "Medium", 10, 1, "-1 Per"),
        Armor("Heavy Helmet", "Head", "Heavy", 12, 2, "-2 Per"),
        Armor("Great Helm", "Head", "Heavy", 14, 2, "-2 Per"),

        // Shoulders
        Armor("Cloth Mantle", "Shoulders", "Light", 1, 0, ""),
        Armor("Leather Pauldrons", "Shoulders", "Light", 3, 1, ""),
        Armor("Studded Pauldrons", "Shoulders", "Light", 3, 1, ""),
        Armor("Chain Pauldrons", "Shoulders", "Medium", 10, 1, "-1 Acro"),
        Armor("Plate Pauldrons", "Shoulders", "Heavy", 14, 2, "-2 Acro"),

        // Chest
        Armor("Cloth", "Chest", "Cloth", 2, 0, ""),
        Armor("Padded", "Chest", "Light", 3, 1, ""),
        Armor("Leather", "Chest", "Light", 5, 1, ""),
        Armor("Studded Leather", "Chest", "Light", 6, 2, ""),
        Armor("Hide", "Chest", "Medium", 10, 2, "-1 Stl"),
        Armor("Chain Shirt", "Chest", "Medium", 15, 3, "-1 Stl"),
        Armor("Scale Mail", "Chest", "Medium", 18, 3, "-1 Stl"),
        Armor("Breastplate", "Chest", "Medium", 20, 3, "-1 Stl"),
        Armor("Half Plate", "Chest", "Medium", 25, 4, "-1 Stl, -1 Acro"),
        Armor("Ring Mail", "Chest", "Heavy", 16, 3, "-1 Stl, -1 Acro"),
        Armor("Chainmail", "Chest", "Heavy", 22, 4, "-2 Stl, -1 Acro"),
        Armor("Splint", "Chest", "Heavy", 28, 5, "-2 Stl, -1 Acro, -1 Ath"),
        Armor("Plate", "Chest", "Heavy", 35, 6, "-2 Stl, -2 Acro, -1 Ath"),

        // Hands
        Armor("Cloth Gloves", "Hands", "Light", 1, 0, ""),
        Armor("Leather Gloves", "Hands", "Light", 2, 0, ""),
        Armor("Studded Gloves", "Hands", "Light", 3, 1, ""),
        Armor("Chain Gloves", "Hands", "Medium", 8, 1, "-1 SoH"),
        Armor("Plate Gauntlets", "Hands", "Heavy", 12, 2, "-2 SoH"),

        // Legs
        Armor("Cloth Pants", "Legs", "Light", 1, 0, ""),
        Armor("Leather Greaves", "Legs", "Light", 3, 1, ""),
        Armor("Studded Greaves", "Legs", "Light", 3, 1, ""),
        Armor("Chain Greaves", "Legs", "Medium", 10, 1, "-1 Ath"),
        Armor("Plate Greaves", "Legs", "Heavy", 14, 2, "-2 Ath, -1 Acro")
    )

    val shields: List<Shield> = listOf(
        Shield("Shield (Wooden)", 15, 3, 2, "1d6", ""),
        Shield("Shield (Metal)", 22, 5, 3, "1d6", ""),
        Shield("Shield (Tower)", 45, 10, 5, "1d6", "Dexterity checks"),
        Shield("Small Shield", 5, 1, 1, "1d6", ""),
        Shield("Spiked Shield", 18, 4, 2, "1d10", "")
    )

    fun byName(name: String): Armor? = all.find {
        it.name.equals(name, ignoreCase = true)
    }

    fun shieldByName(name: String): Shield? = shields.find {
        it.name.equals(name, ignoreCase = true)
    }

    fun forBodyPart(part: String): List<Armor> = all.filter {
        it.bodyPart.equals(part, ignoreCase = true)
    }
}
