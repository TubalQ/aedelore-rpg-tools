const CLASSES = {
    "Warrior": {
        name: "Warrior",
        bonuses: [
            "+1 Strength",
            "+1 Toughness",
            "+1 Athletics",
            "+1 Endurance",
            "+1 Unarmed",
            "+1 Intimidation",
            "+1 Raw Power",
            "+1 Resistance",
            "Starting Armor: Chainmail (chest), Leather (shoulders, legs)",
            "Starting Shield: Shield (Metal)",
            "Starting Weapon: Battleaxe",
            "Starting Gold: 2",
            "Starting Worthiness: 3",
            "Ability Capacity: 3 (melee abilities)",
            "Proficiency with all weapons and armor",
            "HP Bonus: +5"
        ],
        startingEquipment: {
            armor: {
                chest: "Chainmail",
                shoulders: "Leather Pauldrons",
                legs: "Leather Greaves"
            },
            shield: "Shield (Metal)",
            weapon: "Battleaxe",
            gold: 2,
            worthiness: 3,
            abilities: 3,
            hpBonus: 5
        },
        abilityType: "weakened"
    },
    "Thief/Rogue": {
        name: "Thief/Rogue",
        bonuses: [
            "+2 Dexterity",
            "+1 Sleight of Hand",
            "+1 Stealth",
            "+1 Investigation",
            "+1 Acrobatics",
            "+1 Perception",
            "+1 Deception",
            "Starting Armor: Leather (chest, legs), Cloth (head, shoulders)",
            "Starting Weapon: Dagger",
            "Starting Gold: 7",
            "Starting Worthiness: -4",
            "Ability Capacity: 3 (melee abilities)",
            "Expertise in lockpicking and trap detection",
            "HP Bonus: +2"
        ],
        startingEquipment: {
            armor: {
                head: "Cloth Hood",
                chest: "Leather",
                shoulders: "Cloth Mantle",
                legs: "Leather Greaves"
            },
            weapon: "Dagger",
            gold: 7,
            worthiness: -4,
            abilities: 3,
            hpBonus: 2
        },
        abilityType: "weakened"
    },
    "Outcast": {
        name: "Outcast",
        bonuses: [
            "+1 Strength",
            "+2 Toughness",
            "+2 Stealth",
            "+1 Resistance",
            "+1 Investigation",
            "+1 Nature",
            "Starting Armor: Leather (chest), Cloth (legs)",
            "Starting Weapon: Mace",
            "Starting Gold: 2",
            "Starting Food: 1D10",
            "Starting Worthiness: -2",
            "Ability Capacity: 3 (melee abilities)",
            "Can use both melee and ranged effectively",
            "HP Bonus: +4"
        ],
        startingEquipment: {
            armor: {
                chest: "Leather",
                legs: "Cloth Pants"
            },
            weapon: "Mace",
            gold: 2,
            food: "1D10",
            worthiness: -2,
            abilities: 3,
            hpBonus: 4
        },
        abilityType: "weakened"
    },
    "Mage": {
        name: "Mage",
        bonuses: [
            "+2 Intelligence",
            "+2 Wisdom",
            "+1 Arcana",
            "+2 History",
            "+1 Religion",
            "Starting Armor: Cloth (chest, shoulders, legs)",
            "Starting Weapon: Quarterstaff",
            "Starting Gold: 10",
            "Starting Worthiness: 6",
            "Spell Capacity: 10 (mage spells)",
            "Full Arcana (1D10)",
            "Arcana regeneration: 1/round or 2/rest",
            "HP Bonus: +2"
        ],
        startingEquipment: {
            armor: {
                chest: "Cloth",
                shoulders: "Cloth Mantle",
                legs: "Cloth Pants"
            },
            weapon: "Quarterstaff",
            gold: 10,
            worthiness: 6,
            arcana: "1D10",
            spells: 10,
            hpBonus: 2
        },
        abilityType: "arcana"
    },
    "Hunter": {
        name: "Hunter",
        bonuses: [
            "+1 Dexterity",
            "+1 Wisdom",
            "+1 Perception",
            "+1 Animal Handling",
            "+1 Survival",
            "+1 Insight",
            "+1 Nature",
            "+1 Stealth",
            "Starting Armor: Leather (chest, shoulders, legs)",
            "Starting Weapon: Longbow",
            "Starting Arrows: 1D10",
            "Starting Gold: 3",
            "Starting Food: 1D10",
            "Starting Worthiness: 4",
            "Ability Capacity: 3 (melee abilities)",
            "Expertise with bows and tracking",
            "HP Bonus: +3"
        ],
        startingEquipment: {
            armor: {
                chest: "Leather",
                shoulders: "Leather Pauldrons",
                legs: "Leather Greaves"
            },
            weapon: "Longbow",
            ammo: "1D10 Arrows",
            gold: 3,
            food: "1D10",
            worthiness: 4,
            abilities: 3,
            hpBonus: 3
        },
        abilityType: "weakened"
    },
    "Druid": {
        name: "Druid",
        bonuses: [
            "+1 Dexterity",
            "+2 Wisdom",
            "+1 Nature",
            "+2 Medicine",
            "+2 Animal Handling",
            "Starting Armor: Leather (chest), Cloth (shoulders, legs)",
            "Starting Weapon: Spear",
            "Starting Gold: 2",
            "Starting Worthiness: 3",
            "Spell/Ability Capacity: 5",
            "Access to nature-based spells and melee abilities",
            "Arcana regeneration: 1/round or 2/rest",
            "HP Bonus: +3"
        ],
        startingEquipment: {
            armor: {
                chest: "Leather",
                shoulders: "Cloth Mantle",
                legs: "Cloth Pants"
            },
            weapon: "Spear",
            gold: 2,
            worthiness: 3,
            spells: 5,
            hpBonus: 3
        },
        abilityType: "arcana"
    }
};
