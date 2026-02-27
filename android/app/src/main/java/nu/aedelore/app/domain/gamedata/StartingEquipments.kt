package nu.aedelore.app.domain.gamedata

object StartingEquipments {

    data class StartingEquipment(
        val weapon: String,
        val chestArmor: String,
        val headArmor: String = "",
        val shoulderArmor: String = "",
        val legArmor: String = "",
        val handArmor: String = "",
        val shield: String = ""
    )

    val combinations: Map<String, StartingEquipment> = mapOf(
        // Warriors
        "Human_Warrior" to StartingEquipment(
            weapon = "Longsword", chestArmor = "Breastplate",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves",
            shield = "Shield (Metal)"
        ),
        "Dwarf_Warrior" to StartingEquipment(
            weapon = "Warhammer", chestArmor = "Chainmail",
            shoulderArmor = "Chain Pauldrons", legArmor = "Chain Greaves",
            shield = "Shield (Metal)"
        ),
        "Halfling_Warrior" to StartingEquipment(
            weapon = "Shortsword", chestArmor = "Chain Shirt",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves",
            shield = "Shield (Wooden)"
        ),
        "High Elf_Warrior" to StartingEquipment(
            weapon = "Rapier", chestArmor = "Scale Mail",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves",
            shield = "Shield (Metal)"
        ),
        "Moon Elf_Warrior" to StartingEquipment(
            weapon = "Katana", chestArmor = "Chain Shirt",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),
        "Orc_Warrior" to StartingEquipment(
            weapon = "Greataxe", chestArmor = "Chainmail",
            shoulderArmor = "Chain Pauldrons", legArmor = "Chain Greaves"
        ),
        "Troll_Warrior" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Scale Mail",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),

        // Thief/Rogue
        "Human_Thief/Rogue" to StartingEquipment(
            weapon = "Dagger", chestArmor = "Leather",
            headArmor = "Cloth Hood", shoulderArmor = "Cloth Mantle",
            legArmor = "Leather Greaves"
        ),
        "Dwarf_Thief/Rogue" to StartingEquipment(
            weapon = "Handaxe", chestArmor = "Studded Leather",
            headArmor = "Leather Cap", shoulderArmor = "Leather Pauldrons",
            legArmor = "Leather Greaves"
        ),
        "Halfling_Thief/Rogue" to StartingEquipment(
            weapon = "Dagger", chestArmor = "Leather",
            headArmor = "Cloth Hood", shoulderArmor = "Cloth Mantle",
            legArmor = "Leather Greaves"
        ),
        "High Elf_Thief/Rogue" to StartingEquipment(
            weapon = "Rapier", chestArmor = "Studded Leather",
            headArmor = "Cloth Hood", shoulderArmor = "Leather Pauldrons",
            legArmor = "Leather Greaves"
        ),
        "Moon Elf_Thief/Rogue" to StartingEquipment(
            weapon = "Dagger", chestArmor = "Leather",
            headArmor = "Cloth Hood", shoulderArmor = "Cloth Mantle",
            legArmor = "Leather Greaves"
        ),
        "Orc_Thief/Rogue" to StartingEquipment(
            weapon = "Handaxe", chestArmor = "Hide",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),
        "Troll_Thief/Rogue" to StartingEquipment(
            weapon = "Dagger", chestArmor = "Hide",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),

        // Outcast
        "Human_Outcast" to StartingEquipment(
            weapon = "Mace", chestArmor = "Leather",
            legArmor = "Cloth Pants"
        ),
        "Dwarf_Outcast" to StartingEquipment(
            weapon = "War Pick", chestArmor = "Chain Shirt",
            legArmor = "Leather Greaves"
        ),
        "Halfling_Outcast" to StartingEquipment(
            weapon = "Light Hammer", chestArmor = "Padded",
            legArmor = "Cloth Pants"
        ),
        "High Elf_Outcast" to StartingEquipment(
            weapon = "Scimitar", chestArmor = "Leather",
            legArmor = "Leather Greaves"
        ),
        "Moon Elf_Outcast" to StartingEquipment(
            weapon = "Shortsword", chestArmor = "Leather",
            legArmor = "Cloth Pants"
        ),
        "Orc_Outcast" to StartingEquipment(
            weapon = "Morningstar", chestArmor = "Chain Shirt",
            legArmor = "Leather Greaves"
        ),
        "Troll_Outcast" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Hide",
            legArmor = "Leather Greaves"
        ),

        // Mage
        "Human_Mage" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Cloth",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),
        "Dwarf_Mage" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Padded",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),
        "Halfling_Mage" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Cloth",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),
        "High Elf_Mage" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Cloth",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),
        "Moon Elf_Mage" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Cloth",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),
        "Orc_Mage" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Padded",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),
        "Troll_Mage" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Padded",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),

        // Hunter
        "Human_Hunter" to StartingEquipment(
            weapon = "Longbow", chestArmor = "Leather",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),
        "Dwarf_Hunter" to StartingEquipment(
            weapon = "Crossbow (Heavy)", chestArmor = "Studded Leather",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),
        "Halfling_Hunter" to StartingEquipment(
            weapon = "Shortbow", chestArmor = "Leather",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),
        "High Elf_Hunter" to StartingEquipment(
            weapon = "Longbow", chestArmor = "Studded Leather",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),
        "Moon Elf_Hunter" to StartingEquipment(
            weapon = "Shortbow", chestArmor = "Leather",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),
        "Orc_Hunter" to StartingEquipment(
            weapon = "Crossbow (Heavy)", chestArmor = "Hide",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),
        "Troll_Hunter" to StartingEquipment(
            weapon = "Shortbow", chestArmor = "Hide",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),

        // Druid
        "Human_Druid" to StartingEquipment(
            weapon = "Spear", chestArmor = "Leather",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),
        "Dwarf_Druid" to StartingEquipment(
            weapon = "Spear", chestArmor = "Hide",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),
        "Halfling_Druid" to StartingEquipment(
            weapon = "Sickle", chestArmor = "Padded",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),
        "High Elf_Druid" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Leather",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),
        "Moon Elf_Druid" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Leather",
            shoulderArmor = "Cloth Mantle", legArmor = "Cloth Pants"
        ),
        "Orc_Druid" to StartingEquipment(
            weapon = "Glaive", chestArmor = "Hide",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        ),
        "Troll_Druid" to StartingEquipment(
            weapon = "Quarterstaff", chestArmor = "Hide",
            shoulderArmor = "Leather Pauldrons", legArmor = "Leather Greaves"
        )
    )

    fun forCombination(race: String, characterClass: String): StartingEquipment? =
        combinations["${race}_${characterClass}"]
}
