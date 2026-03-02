// Armor data organized by body part
// AC system (D20-based) - converted 2026-03-01
// Total AC = 10 + Σ armor slot AC + shield AC

const ARMOR_DATA = {
    // HEAD ARMOR
    "Cloth Hood": { bodypart: "head", type: "Light", hp: "1", ac: 0, disadvantage: "None" },
    "Leather Cap": { bodypart: "head", type: "Light", hp: "2", ac: 0, disadvantage: "-1 Per" },
    "Chain Coif": { bodypart: "head", type: "Medium", hp: "8", ac: 1, disadvantage: "-1 Per" },
    "Light Helmet": { bodypart: "head", type: "Medium", hp: "10", ac: 1, disadvantage: "-1 Per" },
    "Heavy Helmet": { bodypart: "head", type: "Heavy", hp: "12", ac: 1, disadvantage: "-2 Per" },
    "Great Helm": { bodypart: "head", type: "Heavy", hp: "14", ac: 1, disadvantage: "-2 Per" },

    // SHOULDER ARMOR
    "Cloth Mantle": { bodypart: "shoulders", type: "Light", hp: "1", ac: 0, disadvantage: "None" },
    "Leather Pauldrons": { bodypart: "shoulders", type: "Light", hp: "3", ac: 1, disadvantage: "None" },
    "Studded Pauldrons": { bodypart: "shoulders", type: "Light", hp: "3", ac: 1, disadvantage: "None" },
    "Chain Pauldrons": { bodypart: "shoulders", type: "Medium", hp: "10", ac: 1, disadvantage: "-1 Acro" },
    "Plate Pauldrons": { bodypart: "shoulders", type: "Heavy", hp: "14", ac: 1, disadvantage: "-2 Acro" },

    // CHEST ARMOR (Main armor - where starting armor goes)
    "Cloth": { bodypart: "chest", type: "Cloth", hp: "2", ac: 0, disadvantage: "None" },
    "Padded": { bodypart: "chest", type: "Light", hp: "3", ac: 1, disadvantage: "None" },
    "Leather": { bodypart: "chest", type: "Light", hp: "5", ac: 1, disadvantage: "None" },
    "Studded Leather": { bodypart: "chest", type: "Light", hp: "6", ac: 1, disadvantage: "None" },
    "Hide": { bodypart: "chest", type: "Medium", hp: "10", ac: 1, disadvantage: "-1 Stl" },
    "Chain Shirt": { bodypart: "chest", type: "Medium", hp: "15", ac: 2, disadvantage: "-1 Stl" },
    "Scale Mail": { bodypart: "chest", type: "Medium", hp: "18", ac: 2, disadvantage: "-1 Stl" },
    "Breastplate": { bodypart: "chest", type: "Medium", hp: "20", ac: 2, disadvantage: "-1 Stl" },
    "Half Plate": { bodypart: "chest", type: "Medium", hp: "25", ac: 2, disadvantage: "-1 Stl, -1 Acro" },
    "Ring Mail": { bodypart: "chest", type: "Heavy", hp: "16", ac: 2, disadvantage: "-1 Stl, -1 Acro" },
    "Chainmail": { bodypart: "chest", type: "Heavy", hp: "22", ac: 2, disadvantage: "-2 Stl, -1 Acro" },
    "Splint": { bodypart: "chest", type: "Heavy", hp: "28", ac: 3, disadvantage: "-2 Stl, -1 Acro, -1 Ath" },
    "Plate": { bodypart: "chest", type: "Heavy", hp: "35", ac: 3, disadvantage: "-2 Stl, -2 Acro, -1 Ath" },

    // HAND ARMOR
    "Cloth Gloves": { bodypart: "hands", type: "Light", hp: "1", ac: 0, disadvantage: "None" },
    "Leather Gloves": { bodypart: "hands", type: "Light", hp: "2", ac: 0, disadvantage: "None" },
    "Studded Gloves": { bodypart: "hands", type: "Light", hp: "3", ac: 1, disadvantage: "None" },
    "Chain Gloves": { bodypart: "hands", type: "Medium", hp: "8", ac: 1, disadvantage: "-1 SoH" },
    "Plate Gauntlets": { bodypart: "hands", type: "Heavy", hp: "12", ac: 1, disadvantage: "-2 SoH" },

    // LEG ARMOR
    "Cloth Pants": { bodypart: "legs", type: "Light", hp: "1", ac: 0, disadvantage: "None" },
    "Leather Greaves": { bodypart: "legs", type: "Light", hp: "3", ac: 1, disadvantage: "None" },
    "Studded Greaves": { bodypart: "legs", type: "Light", hp: "3", ac: 1, disadvantage: "None" },
    "Chain Greaves": { bodypart: "legs", type: "Medium", hp: "10", ac: 1, disadvantage: "-1 Ath" },
    "Plate Greaves": { bodypart: "legs", type: "Heavy", hp: "14", ac: 1, disadvantage: "-2 Ath, -1 Acro" }
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

// Shield data - ac replaces old block/defence
const SHIELD_DATA = {
    "Shield (Wooden)": { hp: "15", ac: 13, damage: "1d6" },
    "Shield (Metal)": { hp: "22", ac: 15, damage: "1d6" },
    "Shield (Tower)": { hp: "45", ac: 20, damage: "1d6", disadvantage: "Dexterity checks" },
    "Small Shield": { hp: "5", ac: 10, damage: "1d6" },
    "Spiked Shield": { hp: "18", ac: 14, damage: "1d10" }
};

const SHIELDS = Object.keys(SHIELD_DATA);

// Calculate Total AC from equipped armor (passive, no shield)
// Formula: 10 + Σ armor_X_ac
function getTotalAC() {
    var total = 10;
    for (var i = 1; i <= 5; i++) {
        var el = document.getElementById('armor_' + i + '_ac');
        if (el && el.value) total += parseInt(el.value) || 0;
    }
    return total;
}

// Get Shield Block AC (separate, used for Block defense)
function getShieldBlockAC() {
    var el = document.getElementById('shield_ac');
    return (el && el.value) ? (parseInt(el.value) || 0) : 0;
}

// Update Total AC and Shield Block AC displays
function updateTotalAC() {
    var display = document.getElementById('total-ac-value');
    if (display) display.textContent = getTotalAC();
    var shieldDisplay = document.getElementById('shield-block-ac-value');
    if (shieldDisplay) shieldDisplay.textContent = getShieldBlockAC();
}
