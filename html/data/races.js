const RACES = {
    "Human": {
        name: "Human",
        bonuses: [
            "+1 Strength",
            "+1 Toughness",
            "+1 Force of Will",
            "+1 Perception",
            "+1 Performance",
            "+1 Insight",
            "+1 Endurance",
            "+1 Resistance",
            "+1 Raw Power",
            "+1 Intimidation",
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
            "+2 Toughness",
            "+1 Force of Will",
            "+2 Raw Power",
            "+2 Resistance",
            "+1 Endurance",
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
            "+1 Strength",
            "+1 Toughness",
            "+1 Force of Will",
            "+2 Perception",
            "+2 Insight",
            "+1 Performance",
            "+1 Endurance",
            "+1 Resistance",
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
            "+1 Strength",
            "+1 Toughness",
            "+2 Force of Will",
            "+2 Perception",
            "+2 Insight",
            "+2 Performance",
            "+1 Endurance",
            "+1 Resistance",
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
            "+1 Strength",
            "+1 Toughness",
            "+1 Force of Will",
            "+2 Insight",
            "+2 Endurance",
            "+1 Perception",
            "+1 Intimidation",
            "+1 Resistance",
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
            "+2 Intimidation",
            "+1 Endurance",
            "+1 Resistance",
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
            "+1 Strength",
            "+2 Toughness",
            "+1 Force of Will",
            "+2 Endurance",
            "+2 Resistance",
            "+1 Raw Power",
            "+1 Perception",
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
