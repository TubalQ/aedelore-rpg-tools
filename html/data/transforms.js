// Transform definitions per class
// Generic system: supports "replace" (swap stats) and future "modify" (additive buffs)

const TRANSFORMS = {
    Druid: {
        name: "Wildshape",
        triggerSpell: "Wildshape",
        maxCharges: 2,
        resetOn: "rest",
        disableArcana: true,
        forms: {
            bear: {
                name: "Bear", icon: "\u{1F43B}", type: "replace",
                attributes: { strength_value: 5, dexterity_value: 2, toughness_value: 5 },
                skills: {
                    strength_athletics: 3, strength_raw_power: 3, strength_unarmed: 2,
                    toughness_resistance: 3, toughness_bonus_while_injured: 0,
                    dexterity_acrobatics: 0, dexterity_stealth: 0,
                    dexterity_endurance: 0, dexterity_sleight_of_hand: 0
                },
                hp: 30, block: 2,
                attack: { name: "Claws", atk: "+2", damage: "2d6", range: "Melee" }
            },
            wolf: {
                name: "Wolf", icon: "\u{1F43A}", type: "replace",
                attributes: { strength_value: 3, dexterity_value: 4, toughness_value: 3 },
                skills: {
                    strength_athletics: 3, strength_raw_power: 1, strength_unarmed: 2,
                    toughness_resistance: 0, toughness_bonus_while_injured: 0,
                    dexterity_acrobatics: 2, dexterity_stealth: 3,
                    dexterity_endurance: 2, dexterity_sleight_of_hand: 0
                },
                hp: 22, block: 0,
                attack: { name: "Bite", atk: "+2", damage: "1d10", range: "Melee" }
            },
            eagle: {
                name: "Eagle", icon: "\u{1F985}", type: "replace",
                attributes: { strength_value: 1, dexterity_value: 5, toughness_value: 1 },
                skills: {
                    strength_athletics: 1, strength_raw_power: 0, strength_unarmed: 0,
                    toughness_resistance: 0, toughness_bonus_while_injured: 0,
                    dexterity_acrobatics: 4, dexterity_stealth: 2,
                    dexterity_endurance: 1, dexterity_sleight_of_hand: 0
                },
                hp: 10, block: 0,
                attack: { name: "Talons", atk: "+1", damage: "1d6", range: "Melee" }
            },
            cat: {
                name: "Cat", icon: "\u{1F431}", type: "replace",
                attributes: { strength_value: 1, dexterity_value: 5, toughness_value: 2 },
                skills: {
                    strength_athletics: 2, strength_raw_power: 0, strength_unarmed: 1,
                    toughness_resistance: 0, toughness_bonus_while_injured: 0,
                    dexterity_acrobatics: 3, dexterity_stealth: 4,
                    dexterity_endurance: 1, dexterity_sleight_of_hand: 0
                },
                hp: 14, block: 0,
                attack: { name: "Claws", atk: "+1", damage: "1d6", range: "Melee" }
            }
        }
    }
    // Future: Warrior: { name: "Berserk", type: "modify", ... }
};
