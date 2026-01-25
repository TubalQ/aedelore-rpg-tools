// Starting equipment based on Race + Class combination
// Used by autoFillStartingEquipment() in character-sheet.html

const STARTING_EQUIPMENT = {
    // WARRIOR
    "Human_Warrior": { weapon: "Longsword", armor: { chest: "Breastplate", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: "Shield (Metal)" },
    "Dwarf_Warrior": { weapon: "Warhammer", armor: { chest: "Chainmail", shoulders: "Chain Pauldrons", legs: "Chain Greaves" }, shield: "Shield (Metal)" },
    "Halfling_Warrior": { weapon: "Shortsword", armor: { chest: "Chain Shirt", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: "Shield (Wooden)" },
    "High Elf_Warrior": { weapon: "Rapier", armor: { chest: "Scale Mail", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: "Shield (Metal)" },
    "Moon Elf_Warrior": { weapon: "Katana", armor: { chest: "Chain Shirt", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Orc_Warrior": { weapon: "Greataxe", armor: { chest: "Chainmail", shoulders: "Chain Pauldrons", legs: "Chain Greaves" }, shield: null },
    "Troll_Warrior": { weapon: "Quarterstaff", armor: { chest: "Scale Mail", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },

    // THIEF/ROGUE
    "Human_Thief/Rogue": { weapon: "Dagger", armor: { head: "Cloth Hood", chest: "Leather", shoulders: "Cloth Mantle", legs: "Leather Greaves" }, shield: null },
    "Dwarf_Thief/Rogue": { weapon: "Handaxe", armor: { head: "Leather Cap", chest: "Studded Leather", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Halfling_Thief/Rogue": { weapon: "Dagger", armor: { head: "Cloth Hood", chest: "Leather", shoulders: "Cloth Mantle", legs: "Leather Greaves" }, shield: null },
    "High Elf_Thief/Rogue": { weapon: "Rapier", armor: { head: "Cloth Hood", chest: "Studded Leather", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Moon Elf_Thief/Rogue": { weapon: "Dagger", armor: { head: "Cloth Hood", chest: "Leather", shoulders: "Cloth Mantle", legs: "Leather Greaves" }, shield: null },
    "Orc_Thief/Rogue": { weapon: "Handaxe", armor: { chest: "Hide", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Troll_Thief/Rogue": { weapon: "Dagger", armor: { chest: "Hide", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },

    // OUTCAST
    "Human_Outcast": { weapon: "Mace", armor: { chest: "Leather", legs: "Cloth Pants" }, shield: null },
    "Dwarf_Outcast": { weapon: "War Pick", armor: { chest: "Chain Shirt", legs: "Leather Greaves" }, shield: null },
    "Halfling_Outcast": { weapon: "Light Hammer", armor: { chest: "Padded", legs: "Cloth Pants" }, shield: null },
    "High Elf_Outcast": { weapon: "Scimitar", armor: { chest: "Leather", legs: "Leather Greaves" }, shield: null },
    "Moon Elf_Outcast": { weapon: "Shortsword", armor: { chest: "Leather", legs: "Cloth Pants" }, shield: null },
    "Orc_Outcast": { weapon: "Morningstar", armor: { chest: "Chain Shirt", legs: "Leather Greaves" }, shield: null },
    "Troll_Outcast": { weapon: "Quarterstaff", armor: { chest: "Hide", legs: "Leather Greaves" }, shield: null },

    // MAGE
    "Human_Mage": { weapon: "Quarterstaff", armor: { chest: "Cloth", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },
    "Dwarf_Mage": { weapon: "Quarterstaff", armor: { chest: "Padded", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },
    "Halfling_Mage": { weapon: "Quarterstaff", armor: { chest: "Cloth", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },
    "High Elf_Mage": { weapon: "Quarterstaff", armor: { chest: "Cloth", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },
    "Moon Elf_Mage": { weapon: "Quarterstaff", armor: { chest: "Cloth", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },
    "Orc_Mage": { weapon: "Quarterstaff", armor: { chest: "Padded", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },
    "Troll_Mage": { weapon: "Quarterstaff", armor: { chest: "Padded", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },

    // HUNTER
    "Human_Hunter": { weapon: "Longbow", armor: { chest: "Leather", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Dwarf_Hunter": { weapon: "Crossbow (Heavy)", armor: { chest: "Studded Leather", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Halfling_Hunter": { weapon: "Shortbow", armor: { chest: "Leather", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "High Elf_Hunter": { weapon: "Longbow", armor: { chest: "Studded Leather", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Moon Elf_Hunter": { weapon: "Shortbow", armor: { chest: "Leather", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Orc_Hunter": { weapon: "Crossbow (Heavy)", armor: { chest: "Hide", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Troll_Hunter": { weapon: "Shortbow", armor: { chest: "Hide", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },

    // DRUID
    "Human_Druid": { weapon: "Spear", armor: { chest: "Leather", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },
    "Dwarf_Druid": { weapon: "Spear", armor: { chest: "Hide", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Halfling_Druid": { weapon: "Sickle", armor: { chest: "Padded", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },
    "High Elf_Druid": { weapon: "Quarterstaff", armor: { chest: "Leather", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },
    "Moon Elf_Druid": { weapon: "Quarterstaff", armor: { chest: "Leather", shoulders: "Cloth Mantle", legs: "Cloth Pants" }, shield: null },
    "Orc_Druid": { weapon: "Glaive", armor: { chest: "Hide", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null },
    "Troll_Druid": { weapon: "Quarterstaff", armor: { chest: "Hide", shoulders: "Leather Pauldrons", legs: "Leather Greaves" }, shield: null }
};
