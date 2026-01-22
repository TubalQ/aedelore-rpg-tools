const RACES = {
    "Human": {
        name: "Human",
        bonuses: [
            "+1 Strength",
            "+1 Dexterity",
            "+1 Toughness",
            "+1 Intelligence",
            "+1 Wisdom",
            "+1 Athletics",
            "+1 Perception",
            "+1 Performance",
            "+1 Survival",
            "+1 Investigation",
            "Starting Weapon: Longsword",
            "Starting Food: 1D6",
            "Starting Worthiness: 7",
            "Starting HP: 20"
        ],
        startingEquipment: {
            weapon: "Longsword",
            food: "1D6",
            gold: 0,
            worthiness: 7,
            hp: 20
        }
    },
    "Dwarf": {
        name: "Dwarf",
        bonuses: [
            "+2 Strength",
            "+1 Toughness",
            "+1 Force of Will",
            "+1 Raw Power",
            "+2 History",
            "+2 Survival",
            "+1 Resistance",
            "Starting Weapon: Warhammer",
            "Starting Food: 1D10",
            "Starting Worthiness: 7",
            "Starting HP: 22"
        ],
        startingEquipment: {
            weapon: "Warhammer",
            food: "1D10",
            gold: 0,
            worthiness: 7,
            hp: 22
        }
    },
    "Halfling": {
        name: "Halfling",
        bonuses: [
            "+2 Dexterity",
            "+1 Strength",
            "+1 Toughness",
            "+1 Intelligence",
            "+1 Wisdom",
            "+1 Acrobatics",
            "+1 Stealth",
            "+1 Sleight of Hand",
            "+1 Perception",
            "Starting Weapon: Sling",
            "Starting Food: 1D6",
            "Starting Worthiness: 8",
            "Starting HP: 14"
        ],
        startingEquipment: {
            weapon: "Sling",
            food: "1D6",
            gold: 0,
            worthiness: 8,
            hp: 14
        }
    },
    "High Elf": {
        name: "High Elf",
        bonuses: [
            "+1 Dexterity",
            "+2 Intelligence",
            "+2 Wisdom",
            "+1 Acrobatics",
            "+2 History",
            "+2 Nature",
            "+1 Medicine",
            "+1 Perception",
            "Starting Weapon: Scimitar",
            "Starting Food: 1D10",
            "Starting Worthiness: 10",
            "Starting HP: 16"
        ],
        startingEquipment: {
            weapon: "Scimitar",
            food: "1D10",
            gold: 0,
            worthiness: 10,
            hp: 16
        }
    },
    "Moon Elf": {
        name: "Moon Elf",
        bonuses: [
            "+2 Dexterity",
            "+1 Wisdom",
            "+2 Acrobatics",
            "+1 Stealth",
            "+1 Unarmed",
            "+1 Endurance",
            "+1 Animal Handling",
            "+1 Insight",
            "Starting Weapon: Shortsword",
            "Starting Food: 1D6",
            "Starting Worthiness: 4",
            "Starting HP: 18"
        ],
        startingEquipment: {
            weapon: "Shortsword",
            food: "1D6",
            gold: 0,
            worthiness: 4,
            hp: 18
        }
    },
    "Orc": {
        name: "Orc",
        bonuses: [
            "+2 Strength",
            "+2 Toughness",
            "+2 Raw Power",
            "+1 Endurance",
            "+1 Unarmed",
            "+2 Intimidation",
            "Starting Weapon: Greatclub",
            "Starting Food: 1D6",
            "Starting Worthiness: -5",
            "Starting HP: 24"
        ],
        startingEquipment: {
            weapon: "Greatclub",
            food: "1D6",
            gold: 0,
            worthiness: -5,
            hp: 24
        }
    },
    "Troll": {
        name: "Troll",
        bonuses: [
            "+1 Dexterity",
            "+2 Toughness",
            "+2 Athletics",
            "+1 Endurance",
            "+2 Resistance",
            "+2 Survival",
            "Starting Weapon: Club",
            "Starting Food: 1D6",
            "Starting Worthiness: 2",
            "Starting HP: 20"
        ],
        startingEquipment: {
            weapon: "Club",
            food: "1D6",
            gold: 0,
            worthiness: 2,
            hp: 20
        }
    }
};
