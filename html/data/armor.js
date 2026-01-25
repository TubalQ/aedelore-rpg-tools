// Armor data organized by body part
// HP values rebalanced 2026-01-21 (medium/heavy armor increased)

const ARMOR_DATA = {
    // HEAD ARMOR
    "Cloth Hood": { bodypart: "head", type: "Light", hp: "1", bonus: "0+block", disadvantage: "None" },
    "Leather Cap": { bodypart: "head", type: "Light", hp: "2", bonus: "0+block", disadvantage: "-1 Per" },
    "Chain Coif": { bodypart: "head", type: "Medium", hp: "8", bonus: "1+block", disadvantage: "-1 Per" },
    "Light Helmet": { bodypart: "head", type: "Medium", hp: "10", bonus: "1+block", disadvantage: "-1 Per" },
    "Heavy Helmet": { bodypart: "head", type: "Heavy", hp: "12", bonus: "2+block", disadvantage: "-2 Per" },
    "Great Helm": { bodypart: "head", type: "Heavy", hp: "14", bonus: "2+block", disadvantage: "-2 Per" },

    // SHOULDER ARMOR
    "Cloth Mantle": { bodypart: "shoulders", type: "Light", hp: "1", bonus: "0+block", disadvantage: "None" },
    "Leather Pauldrons": { bodypart: "shoulders", type: "Light", hp: "3", bonus: "1+block", disadvantage: "None" },
    "Studded Pauldrons": { bodypart: "shoulders", type: "Light", hp: "3", bonus: "1+block", disadvantage: "None" },
    "Chain Pauldrons": { bodypart: "shoulders", type: "Medium", hp: "10", bonus: "1+block", disadvantage: "-1 Acro" },
    "Plate Pauldrons": { bodypart: "shoulders", type: "Heavy", hp: "14", bonus: "2+block", disadvantage: "-2 Acro" },

    // CHEST ARMOR (Main armor - where starting armor goes)
    "Cloth": { bodypart: "chest", type: "Cloth", hp: "2", bonus: "0+block", disadvantage: "None" },
    "Padded": { bodypart: "chest", type: "Light", hp: "3", bonus: "1+block", disadvantage: "None" },
    "Leather": { bodypart: "chest", type: "Light", hp: "5", bonus: "1+block", disadvantage: "None" },
    "Studded Leather": { bodypart: "chest", type: "Light", hp: "6", bonus: "2+block", disadvantage: "None" },
    "Hide": { bodypart: "chest", type: "Medium", hp: "10", bonus: "2+block", disadvantage: "-1 Stl" },
    "Chain Shirt": { bodypart: "chest", type: "Medium", hp: "15", bonus: "3+block", disadvantage: "-1 Stl" },
    "Scale Mail": { bodypart: "chest", type: "Medium", hp: "18", bonus: "3+block", disadvantage: "-1 Stl" },
    "Breastplate": { bodypart: "chest", type: "Medium", hp: "20", bonus: "3+block", disadvantage: "-1 Stl" },
    "Half Plate": { bodypart: "chest", type: "Medium", hp: "25", bonus: "4+block", disadvantage: "-1 Stl, -1 Acro" },
    "Ring Mail": { bodypart: "chest", type: "Heavy", hp: "16", bonus: "3+block", disadvantage: "-1 Stl, -1 Acro" },
    "Chainmail": { bodypart: "chest", type: "Heavy", hp: "22", bonus: "4+block", disadvantage: "-2 Stl, -1 Acro" },
    "Splint": { bodypart: "chest", type: "Heavy", hp: "28", bonus: "5+block", disadvantage: "-2 Stl, -1 Acro, -1 Ath" },
    "Plate": { bodypart: "chest", type: "Heavy", hp: "35", bonus: "6+block", disadvantage: "-2 Stl, -2 Acro, -1 Ath" },

    // HAND ARMOR
    "Cloth Gloves": { bodypart: "hands", type: "Light", hp: "1", bonus: "0+block", disadvantage: "None" },
    "Leather Gloves": { bodypart: "hands", type: "Light", hp: "2", bonus: "0+block", disadvantage: "None" },
    "Studded Gloves": { bodypart: "hands", type: "Light", hp: "3", bonus: "1+block", disadvantage: "None" },
    "Chain Gloves": { bodypart: "hands", type: "Medium", hp: "8", bonus: "1+block", disadvantage: "-1 SoH" },
    "Plate Gauntlets": { bodypart: "hands", type: "Heavy", hp: "12", bonus: "2+block", disadvantage: "-2 SoH" },

    // LEG ARMOR
    "Cloth Pants": { bodypart: "legs", type: "Light", hp: "1", bonus: "0+block", disadvantage: "None" },
    "Leather Greaves": { bodypart: "legs", type: "Light", hp: "3", bonus: "1+block", disadvantage: "None" },
    "Studded Greaves": { bodypart: "legs", type: "Light", hp: "3", bonus: "1+block", disadvantage: "None" },
    "Chain Greaves": { bodypart: "legs", type: "Medium", hp: "10", bonus: "1+block", disadvantage: "-1 Ath" },
    "Plate Greaves": { bodypart: "legs", type: "Heavy", hp: "14", bonus: "2+block", disadvantage: "-2 Ath, -1 Acro" }
};

// Organize armor by body part for easy dropdown population
const ARMOR_BY_BODYPART = {
    head: Object.keys(ARMOR_DATA).filter(name => ARMOR_DATA[name].bodypart === "head"),
    shoulders: Object.keys(ARMOR_DATA).filter(name => ARMOR_DATA[name].bodypart === "shoulders"),
    chest: Object.keys(ARMOR_DATA).filter(name => ARMOR_DATA[name].bodypart === "chest"),
    hands: Object.keys(ARMOR_DATA).filter(name => ARMOR_DATA[name].bodypart === "hands"),
    legs: Object.keys(ARMOR_DATA).filter(name => ARMOR_DATA[name].bodypart === "legs")
};

// Simple array for datalist (backward compatibility)
const ARMOR = Object.keys(ARMOR_DATA);

// Shield data
const SHIELD_DATA = {
    "Shield (Wooden)": { hp: "15", block: "3", defence: "2", damage: "1d6" },
    "Shield (Metal)": { hp: "22", block: "5", defence: "3", damage: "1d6" },
    "Shield (Tower)": { hp: "45", block: "10", defence: "5", damage: "1d6", disadvantage: "Dexterity checks" },
    "Small Shield": { hp: "5", block: "1", defence: "1", damage: "1d6" },
    "Spiked Shield": { hp: "18", block: "4", defence: "2", damage: "1d10" }
};

const SHIELDS = Object.keys(SHIELD_DATA);
