// Weapon data from wiki.aedelore.nu
// Note: Exact damage values not fully specified in wiki, using general guidelines

const WEAPONS_DATA = {
    // Simple Melee Weapons
    "Club": { type: "Simple Melee", ability: "Strength", bonus: "+1", damage: "1d6", range: "1", break: "1" },
    "Dagger": { type: "Simple Melee", ability: "Dexterity", bonus: "+1", damage: "1d6", range: "1", break: "0" },
    "Greatclub": { type: "Simple Melee", ability: "Strength", bonus: "+2", damage: "1d10", range: "2", break: "3" },
    "Handaxe": { type: "Simple Melee", ability: "Strength", bonus: "+1", damage: "1d6", range: "1", break: "2" },
    "Javelin": { type: "Simple Melee/Ranged", ability: "Strength", bonus: "+1", damage: "1d6", range: "3/10", break: "1" },
    "Light Hammer": { type: "Simple Melee", ability: "Strength", bonus: "+1", damage: "1d6", range: "1", break: "2" },
    "Mace": { type: "Simple Melee", ability: "Strength", bonus: "+1", damage: "1d6", range: "1", break: "2" },
    "Quarterstaff": { type: "Simple Melee", ability: "Strength", bonus: "+1", damage: "1d6", range: "3", break: "1" },
    "Sickle": { type: "Simple Melee", ability: "Strength", bonus: "+1", damage: "1d6", range: "1", break: "0" },
    "Spear": { type: "Simple Melee", ability: "Strength", bonus: "+1", damage: "1d6", range: "3", break: "1" },

    // Martial Melee Weapons
    "Battleaxe": { type: "Martial Melee", ability: "Strength", bonus: "+2", damage: "1d10", range: "1", break: "3" },
    "Flail": { type: "Martial Melee", ability: "Strength", bonus: "+2", damage: "1d10", range: "1", break: "2" },
    "Glaive": { type: "Martial Melee (Reach)", ability: "Strength", bonus: "+2", damage: "1d10", range: "3", break: "2" },
    "Greataxe": { type: "Martial Melee", ability: "Strength", bonus: "+3", damage: "2d6", range: "2", break: "5" },
    "Greatsword": { type: "Martial Melee", ability: "Strength", bonus: "+3", damage: "2d6", range: "2", break: "3" },
    "Halberd": { type: "Martial Melee (Reach)", ability: "Strength", bonus: "+2", damage: "1d10", range: "3", break: "3" },
    "Lance": { type: "Martial Melee (Reach)", ability: "Strength", bonus: "+2", damage: "2d6", range: "3", break: "2" },
    "Longsword": { type: "Martial Melee", ability: "Strength", bonus: "+2", damage: "1d10", range: "2", break: "2" },
    "Maul": { type: "Martial Melee", ability: "Strength", bonus: "+3", damage: "2d6", range: "2", break: "5" },
    "Morningstar": { type: "Martial Melee", ability: "Strength", bonus: "+2", damage: "1d10", range: "1", break: "3" },
    "Pike": { type: "Martial Melee (Reach)", ability: "Strength", bonus: "+2", damage: "1d10", range: "3", break: "2" },
    "Rapier": { type: "Martial Melee", ability: "Dexterity", bonus: "+2", damage: "1d10", range: "2", break: "0" },
    "Scimitar": { type: "Martial Melee", ability: "Dexterity", bonus: "+2", damage: "1d6", range: "1", break: "1" },
    "Shortsword": { type: "Martial Melee", ability: "Dexterity", bonus: "+2", damage: "1d6", range: "1", break: "1" },
    "Trident": { type: "Martial Melee", ability: "Strength", bonus: "+1", damage: "1d6", range: "3", break: "1" },
    "War Pick": { type: "Martial Melee", ability: "Strength", bonus: "+2", damage: "1d10", range: "1", break: "4" },
    "Warhammer": { type: "Martial Melee", ability: "Strength", bonus: "+2", damage: "1d10", range: "1", break: "4" },
    "Whip": { type: "Martial Melee (Reach)", ability: "Dexterity", bonus: "+1", damage: "1d6", range: "3", break: "0" },

    // Ranged Weapons
    "Crossbow (Light)": { type: "Ranged", ability: "Dexterity", bonus: "+2", damage: "1d6", range: "20/40", break: "0" },
    "Dart": { type: "Ranged", ability: "Dexterity", bonus: "+1", damage: "1d6", range: "5/15", break: "0" },
    "Shortbow": { type: "Ranged", ability: "Dexterity", bonus: "+2", damage: "1d6", range: "20/40", break: "0" },
    "Sling": { type: "Ranged", ability: "Dexterity", bonus: "+1", damage: "1d6", range: "10/30", break: "0" },
    "Blowgun": { type: "Ranged", ability: "Dexterity", bonus: "+1", damage: "1", range: "8/24", break: "0" },
    "Crossbow (Hand)": { type: "Ranged", ability: "Dexterity", bonus: "+2", damage: "1d6", range: "10/30", break: "0" },
    "Crossbow (Heavy)": { type: "Ranged", ability: "Strength", bonus: "+2", damage: "1d10", range: "30/60", break: "1" },
    "Longbow": { type: "Ranged", ability: "Dexterity", bonus: "+2", damage: "1d10", range: "40/80", break: "0" },
    "Net": { type: "Ranged", ability: "Dexterity", bonus: "+0", damage: "-", range: "2/5", break: "0" },

    // Fantasy Weapons
    "Falchion": { type: "Fantasy Melee", ability: "Strength", bonus: "+2", damage: "1d10", range: "1", break: "2" },
    "Claymore": { type: "Fantasy Melee", ability: "Strength", bonus: "+3", damage: "2d6", range: "2", break: "4" },
    "Katana": { type: "Fantasy Melee", ability: "Strength/Dexterity", bonus: "+2", damage: "1d10", range: "2", break: "2" },
    "Guisarme": { type: "Fantasy Melee (Reach)", ability: "Strength", bonus: "+2", damage: "1d10", range: "3", break: "3" },
    "Scythe": { type: "Fantasy Melee", ability: "Strength", bonus: "+1", damage: "1d10", range: "2", break: "1" },
    "Throwing Axe": { type: "Fantasy Ranged", ability: "Dexterity", bonus: "+2", damage: "1d6", range: "5/15", break: "1" },
    "Spiked Shield": { type: "Fantasy Melee", ability: "Strength", bonus: "+1", damage: "1d6", range: "1", break: "1" },
    "Chakram": { type: "Fantasy Ranged", ability: "Dexterity", bonus: "+2", damage: "1d6", range: "10/30", break: "0" },
    "Flamberge": { type: "Fantasy Melee", ability: "Strength", bonus: "+2", damage: "2d6", range: "2", break: "3" },
    "Bone Club": { type: "Fantasy Melee", ability: "Strength", bonus: "+1", damage: "1d6", range: "1", break: "1" }
};

// Simple array for datalist (backward compatibility)
const WEAPONS = Object.keys(WEAPONS_DATA);

// Ammunition pricing (from wiki)
const AMMUNITION = {
    "Arrows (20-50)": { cost: "1 gold" },
    "Bolts (20-50)": { cost: "1 gold" },
    "Blowgun Needles (20-50)": { cost: "1 gold" },
    "Sling Bullets (20)": { cost: "4 copper" }
};
