# Aedelore - Complete Rules

> Version 2.0 | 2026-02-23
> A D20-based roleplaying system for World of Aedelore

---

# PART 1: CORE SYSTEM

## 1.1 Philosophy

Aedelore uses a D20-based system.
**The Dungeon Master (DM) always has the final say** - rules are guidelines, not laws.

Focus on:
- Fast, intuitive mechanics
- Creative problem-solving
- Narrative-driven gameplay
- DM flexibility

---

## 1.2 The Dice System

### Points to Modifiers
Ability/skill points convert to modifiers: `modifier = ceil(points / 2)`

| Points | Modifier |
|--------|----------|
| 1 | +1 |
| 2 | +1 |
| 3 | +2 |
| 4 | +2 |
| 5 | +3 |
| 6 | +3 |
| 7 | +4 |
| 8 | +4 |
| 9 | +5 |
| 10 | +5 |

### Checks
Roll **1D20 + modifier** vs a **Difficulty Class (DC)** set by the DM.
Meet or beat the DC = success. Below DC = failure.

### Critical Hits & Misses
- **Natural 20:** Automatic success + critical hit (double damage dice in combat)
- **Natural 1:** Automatic failure + possible negative consequence

### Difficulty Classes

| Difficulty | DC |
|------------|-----|
| Trivial | 5 |
| Easy | 10 |
| Normal | 13 |
| Hard | 16 |
| Very Hard | 19 |
| Nearly Impossible | 22 |

### Attributes vs Skills
The DM chooses either an attribute OR a skill for each check — **never stacked**.

---

## 1.3 Checks

### Simple Check
```
1D20 + Attribute modifier vs DC
```

### Skill Check
```
1D20 + Skill modifier vs DC
```

**Example:** Stealth check DC 13: Roll 1D20 + Stealth modifier (+3) = need 10+ on die.

### Contested Check
Both parties roll 1D20 + modifier. Higher total wins.
On tie: DM decides (usually advantage to defender).

### Damage Dice
Damage still uses D6 and D10 dice (not D20). Weapons specify their damage dice.

---

# PART 2: CHARACTER CREATION

## 2.1 Step by Step

1. Choose **Race** (gives base HP, Worthiness, bonuses)
2. Choose **Class** (gives HP bonus, equipment, abilities)
3. Choose **Religion** (optional, gives bonuses)
4. Distribute **10 extra points** among talents
5. Note starting equipment

**Important:** No single talent may exceed 5 points at start.

---

## 2.2 Races

Available races: Human, Dwarf, Halfling, High Elf, Moon Elf, Orc, Troll.

Each race gives:
- **Base HP** (added to class HP bonus)
- **Worthiness** (starting reputation)
- **Attribute bonuses** (+1 or +2 to various skills)
- **Starting equipment** (weapons, food, etc.)

> **See separate file for complete race list:** `html/data/races.js`

---

## 2.3 Classes

Available classes: Warrior, Thief/Rogue, Outcast, Mage, Hunter, Druid.

Each class gives:
- **HP Bonus** (added to race base HP)
- **Worthiness** (added to race worthiness)
- **Attribute bonuses**
- **Starting equipment** (weapons, armor, gold)
- **Abilities/Spells** (melee abilities or magic)

**Class Types:**
- **Melee classes** (Warrior, Thief, Outcast, Hunter): Use Weakened for abilities
- **Magic classes** (Mage, Druid): Use Arcana for spells

> **See separate file for complete class list:** `html/data/classes.js`

---

## 2.4 HP Calculation

```
Total HP = Race Base HP + Class HP Bonus
```

**Example:** Human (20) + Warrior (+5) = **25 HP**

---

## 2.5 Worthiness Calculation

```
Total Worthiness = Race Worthiness + Class Worthiness
```

**Example:** Human (6) + Thief (-4) = **2 Worthiness**

---

## 2.6 Religions

Religion is optional. Each religion gives:
- **Attribute bonuses** (+1 or +2 to specific skills)
- Some religions give **negative Worthiness** (-5)

> **See separate file for complete religion list:** `html/data/religions.js`

---

# PART 3: ATTRIBUTES & SKILLS

## 3.1 Core Abilities

| Attribute | Used For |
|-----------|----------|
| **Strength** | Melee attacks, lifting, breaking, blocking |
| **Dexterity** | Ranged attacks, dodging, sneaking, fine motor skills |
| **Toughness** | Resisting damage, endurance, bleeding |
| **Intelligence** | Knowledge, logic, magic (Mage) |
| **Wisdom** | Intuition, perception, willpower |
| **Endurance** | Stamina, running, resistance to exhaustion |

---

## 3.2 Skills

### Physical
| Skill | Linked Ability | Usage |
|-------|----------------|-------|
| Athletics | Strength | Climbing, swimming, jumping |
| Acrobatics | Dexterity | Balance, tumbling, dodging |
| Stealth | Dexterity | Sneaking, hiding |
| Raw Power | Strength | Pure physical force |
| Unarmed | Strength/Dex | Unarmed combat |
| Resistance | Toughness | Resisting poison, disease |

### Social
| Skill | Linked Ability | Usage |
|-------|----------------|-------|
| Deception | Wisdom | Lying, deceiving |
| Intimidation | Strength/Wis | Scaring, threatening |
| Persuasion | Wisdom | Convincing, negotiating |
| Insight | Wisdom | Reading intentions |

### Knowledge
| Skill | Linked Ability | Usage |
|-------|----------------|-------|
| Arcana | Intelligence | Magical knowledge |
| History | Intelligence | Historical knowledge |
| Nature | Intelligence/Wis | Nature knowledge |
| Religion | Wisdom | Religious knowledge |
| Medicine | Wisdom | Healing arts |
| Investigation | Intelligence | Examining, finding clues |
| Perception | Wisdom | Noticing, observing |
| Survival | Wisdom | Wilderness survival |
| Animal Handling | Wisdom | Handling animals |

### Other
| Skill | Linked Ability | Usage |
|-------|----------------|-------|
| Sleight of Hand | Dexterity | Pickpocketing, tricks |
| Luck | - | Random fortune |

---

# PART 4: COMBAT

## 4.1 Initiative

At the start of combat:
- **≤6 participants:** Roll 1D6 (1 = slowest, 6 = fastest)
- **>6 participants:** Roll 1D10 instead

On tie: DM decides or reroll.

---

## 4.2 Attack

### Opposed Roll
Combat uses opposed rolls:
```
Attacker: 1D20 + Weapon Attack Bonus (from core ability modifier)
Defender: 1D20 + Defense modifier (varies by defense type)
```

The weapon determines which Core Ability is used (see weapon list):
- **Strength:** Most melee weapons (longsword, axes, clubs, hammers, spears), Heavy Crossbow
- **Dexterity:** Dagger, Rapier, Scimitar, Shortsword, Whip, all bows, light crossbows, throwing knives
- **Strength/Dexterity:** Katana (player's choice)

**Example - Longsword (Strength, +2 attack):**
- Strength 4 → modifier +2
- Longsword Attack Bonus +2
- **Roll:** 1D20 + 4

### Attack Results

| Result | Effect |
|--------|--------|
| Attacker wins | **Hit** - roll full damage |
| Tie or Defender wins | **Miss** - no damage |
| Natural 20 | **Critical Hit** - double damage dice |
| Natural 1 | **Auto-miss** |

---

### Damage Roll

On hit, roll the weapon's damage dice:

```
Damage = Weapon's Damage Dice
```

**Examples:**
- Longsword = 1D10
- Greatsword = 2D6

**On Critical Hit:** Double the damage dice (e.g., 1D10 → 2D10).

---

## 4.3 Defense

When attacked you may choose **one** of the following reactions:

### Dodge
```
1D20 + Acrobatics modifier
```
- **Win:** Avoid the attack completely
- **Lose:** Take full damage

### Parry
```
1D20 + Weapon Attack Bonus
```
- **Win:** Parry the attack, no damage
- **Lose:** Take full damage

### Block
Requires shield.
```
1D20 + Shield Defence value
```
Shield Defence values: Small +1, Wooden +2, Metal +3, Spiked +2, Tower +5.
- **Win:** Block the attack, shield takes the damage to its HP
- **Lose:** Take full damage

**Example:** Enemy rolls 15. You block with Metal Shield (+3), roll 1D20+3 = 16.
- You win → shield absorbs the damage

### Take Hit
```
1D20 + Toughness modifier
```
You always take the hit, but Toughness modifier reduces damage taken.
Each point of modifier reduces damage by 1.

---

## 4.4 Armor & Shields

### Armor Pieces

Armor protects specific body parts: Head, Shoulders, Chest, Hands, Legs.

### Armor Values

| Property | Description |
|----------|-------------|
| **HP** | Armor's durability |
| **Bonus** | Block bonus (e.g., "2+block") |
| **Disadvantage** | Penalties (e.g., "-1 Stealth") |

### Armor HP

When armor takes damage, reduce its HP. At 0 HP the armor is **Broken** and provides no protection.

> **See separate file for complete armor and shield list:** `html/data/armor.js`

---

## 4.5 Weapons

Weapons have the following properties:
- **Ability:** Which ability is used (Strength/Dexterity)
- **Attack Bonus:** Added to attack roll modifier
- **Damage:** Damage dice on hit
- **Range:** Range in meters

> **See separate file for complete weapon list:** `html/data/weapons.js`

---

## 4.6 Combined Actions

Players can combine actions (DM approves):

**Example - Jumping Arrow Shot:**
1. Roll **Athletics/Acrobatics** for the jump
2. On successful jump, roll **attack** with bow
3. Beating the DC by 5+ may give +2 bonus to the attack

---

## 4.7 Assistance in Combat

A character can **give up their action** to assist another:
- Assisted player gets **+2** on their next roll
- Must be narratively justified
- Max 1 assistance per round

---

# PART 5: MAGIC

## 5.1 Arcana (Magic Points)

| Class | Max Arcana | Starting Arcana |
|-------|------------|-----------------|
| Mage | 20 | 10 |
| Druid | 16 | 8 |
| Others | 0 | 0 |

**Regeneration:** +1 Arcana per round, +2 Arcana on rest.

---

## 5.2 Casting Spells

### Spell Check
```
1D20 + INT modifier vs spell DC (each spell has its own DC)
```

| DC | Power Level |
|----|-------------|
| 8 | Basic spells (cantrips, simple utility) |
| 10 | Standard spells (moderate combat/utility) |
| 13 | Powerful spells (strong AoE, summoning, transformation) |
| 16 | Very powerful spells (game-changing effects, high-tier magic) |

### Spell Cost
Each spell costs Arcana. Arcana is consumed whether the spell succeeds or fails.

### Damage Calculation
See the spell's description for damage formula (uses D6/D10 damage dice).

### Critical Success on Magic (Natural 20)
DM decides effect - can be:
- Increased damage (double damage dice)
- Extended duration
- Enhanced secondary effects

### Failed Magic
- **Fail (below DC):** Spell fizzles, Arcana still consumed
- **Natural 1:** Backlash — spell fails with negative side effect (DM decides)

---

## 5.3 Changing Spells

Mages and Druids can learn more spells than they can have active.

**Rules:**
- Changes can only be made in **safe areas** (town, village)
- Not in wilderness or small camps
- Old spells aren't "forgotten" - they become inactive
- Requires time and concentration (DM decides)

---

# PART 6: ABILITIES

## 6.1 Overview

Melee classes (Warrior, Thief, Hunter, Outcast) have access to special abilities that cost **Weakened** to use.

### Usage
1. Check the ability's **Check** (e.g., "1D20 + Stealth, DC 13")
2. Roll 1D20 + relevant stat modifier vs DC
3. On success, pay the **Weakened** cost
4. Gain the ability's **Gain** (modifier bonus) for the action
5. Natural 20 = automatic success, Natural 1 = automatic failure

---

## 6.2 Class Abilities

Each melee class has its own abilities:

| Class | Starting Abilities |
|-------|-------------------|
| **Warrior** | Last Stand, Hero, Battle Cry |
| **Thief/Rogue** | Lockpicking, Sneaking, Backstab |
| **Hunter** | Steady Shot, Tame a Beast, Unveil Path |
| **Outcast** | Shadow Step, Wilderness Survival, Street Smarts |

> **See separate file for complete ability list:** `data/abilities.txt`

---

# PART 7: DAMAGE & STATUS EFFECTS

## 7.1 Weakened (Exhaustion)

Each character has **6 Weakened Points**.

### Consumption
- Using abilities costs Weakened
- Certain extreme actions may cost Weakened
- DM may require Weakened cost for strenuous activities

### When Weakened = 0

Roll **1D20 + Toughness modifier vs DC 10**:

| Result | Effect |
|--------|--------|
| Nat 1 | **Death** - Total collapse |
| Fail | **Unconscious** - Fainted |
| Meet DC | **Exhausted** - Can move but not fight |

### Recovery
- **Short rest:** +1 Weakened
- **Long rest:** All Weakened restored

---

## 7.2 Bleed (Bleeding)

When a character receives a **critical wound** (DM decides when), they start bleeding.

### Bleeding Mechanic
**Each round:** Roll 1D6

| Roll | HP Loss |
|------|---------|
| 1-2 | 3 HP |
| 3-4 | 2 HP |
| 5-6 | 1 HP |

### Bleed Value
Characters can have **Bleed [X]** where X indicates severity:
- **Bleed 1:** Surface bleeding (roll 1D6)
- **Bleed 2:** Serious bleeding (roll 2D6, take highest)
- **Bleed 3+:** Life-threatening (roll 3D6, take highest)

### Stopping Bleeding
- **Medicine check:** 1D20 + Medicine vs DC 10 per Bleed level
- **Bandage:** Stops Bleed 1 automatically
- **Healing magic:** Stops all bleeding

### When HP = 0 from Bleeding
Roll **1D20 + Toughness modifier vs DC 10**:

| Result | Effect |
|--------|--------|
| Nat 1 | **Death** - Total blood loss |
| Fail by 5+ | **Barely alive** - Unconscious, needs immediate care |
| Fail | **Fainted** - Unconscious but stable |
| Meet DC | **Conscious** - Can act but severely weakened |

---

## 7.3 Other Status Effects

| Status | Effect |
|--------|--------|
| **Poisoned** | -2 on all rolls, take 1 damage/round (DM varies) |
| **Stunned** | Cannot act this round |
| **Blinded** | -4 on attacks and perception |
| **Deafened** | Cannot hear, -2 on perception |
| **Frightened** | Cannot approach fear source, -2 on attacks |
| **Prone** | -2 on attacks, enemies get +2 in melee |

---

# PART 8: RESOURCES

## 8.1 Food & Water

Resources are tracked with dice.

### Daily Consumption
**At the start of each day, roll your food/water die:**

| Result | Effect |
|--------|--------|
| 6-10 (on D10) | Keep current die |
| 1-5 (on D10) | Reduce to next die size |
| 4-6 (on D6) | Keep D6 |
| 1-3 (on D6) | Out of resource |

### Without Food/Water
- **1 day without:** No effects
- **2 days without:** -2 on all rolls
- **3+ days without:** Take 1 damage per day, -4 on all rolls

### Restocking
- **Towns:** Buy food and water
- **Wilderness:** Hunt (Survival check) or Forage (Nature check)

---

## 8.2 Arrows & Ammunition

### After Combat
Roll 1D6 to see how much ammunition you recover:
- **1-2:** Lost most - keep 25%
- **3-4:** Lost some - keep 50%
- **5-6:** Found most - keep 75%

### Purchase
| Ammunition | Cost |
|------------|------|
| Arrows (20-50) | 1 gold |
| Bolts (20-50) | 1 gold |
| Blowgun Needles (20-50) | 1 gold |
| Sling Bullets (20) | 4 copper |

---

## 8.3 Potions

### Starting Potions
All characters start with:
- Adrenaline
- Antidote
- Poison

Amount depends on class/race.

### Potion Effects
| Potion | Effect |
|--------|--------|
| **Adrenaline** | +3 on next action |
| **Antidote** | Cures Poisoned status |
| **Poison** | Can be applied to weapons (DM decides effect) |
| **Arcane Elixir** | +10 Arcana (Mage/Druid only) |
| **Healing Potion** | Restore 1D10 HP |

**NOTE:** Poison **CANNOT** be used to create poisoned arrows.

---

## 8.4 Arcane Elixir

Special potion for magic users:
- **Effect:** Restores 10 Arcana
- **Starting:** Mage = 2, Druid = 1, Others = 0
- **Max carried:** 4

---

# PART 9: WORTHINESS & REPUTATION

## 9.1 Worthiness

Worthiness represents your character's reputation and standing in society.

### Effects
- **High Worthiness:** Respected, welcomed in cities, better prices
- **Low Worthiness:** Suspicious, may be denied service, guards watchful
- **Negative Worthiness:** Wanted, may be attacked on sight

### Changing Worthiness

| Action | Change |
|--------|--------|
| Heroic deed (save innocents) | +1 to +3 |
| Help those in need | +1 |
| Kill innocents | -2 to -5 |
| Theft (if discovered) | -1 to -2 |
| Murder (if witnessed) | -3 to -5 |
| Follow an evil religion | -5 (at start) |

### Social Checks
DM may require Worthiness-based checks to:
- Get audience with kings/leaders
- Access exclusive areas
- Avoid suspicion

---

# PART 10: MISCELLANEOUS

## 10.1 Healing & Rest

### Natural Healing
- **Short rest (1 hour):** +1D6 HP, +1 Weakened
- **Long rest (8 hours):** All HP restored, all Weakened restored

### Magical Healing
According to the spell's description.

### Medicine
Roll **1D20 + Medicine modifier vs DC 10**:
- **Meet DC:** +1D6 HP to patient
- **Beat DC by 5+:** +2D6 HP to patient
- **Natural 20:** +3D6 HP to patient

---

## 10.2 Death & Dying

### When HP = 0
The character is **Dying**. Each round:
1. Roll **1D20 + Toughness modifier vs DC 10**
2. Result determines outcome (see 7.2)

### Stabilization
Another character can attempt to stabilize:
- **Medicine check (1D20 + Medicine vs DC 10):** Character is stabilized, unconscious but not dying
- **Healing magic:** Revives the character

### Permanent Death
DM decides when a character is permanently dead (massive damage, decapitation, etc.).

---

## 10.3 Experience & Progression

DM decides how characters develop. Suggestions:

### After Each Session
- +1 point to distribute on any skill

### After Each Major Adventure
- +1 point to a Core Ability
- +1 new ability or spell

---

# APPENDIX A: DM GUIDELINES

## A.1 Core Principles

1. **Rules are guidelines** - Adapt for the story
2. **Yes, and...** - Try to say yes to player ideas
3. **Consequences** - Actions have results
4. **Fair but challenging** - Players should feel danger without hopelessness

## A.2 When Rules Are Missing

If a situation isn't covered by the rules:
1. Determine relevant Ability + Skill
2. Set a DC
3. Let the player roll
4. Interpret the result narratively

## A.3 Balancing Combat

- **Weak enemies:** Low modifiers, easy to hit
- **Normal enemies:** Even fight
- **Strong enemies:** Requires tactics and cooperation
- **Bosses:** Special mechanics, multiple phases

---

# APPENDIX B: QUICK REFERENCE

## Points to Modifier
| Points | Modifier |
|--------|----------|
| 1-2 | +1 |
| 3-4 | +2 |
| 5-6 | +3 |
| 7-8 | +4 |
| 9-10 | +5 |

## Core Roll
1D20 + modifier vs DC. Meet or beat = success.
- Natural 20 = Critical hit (double damage dice)
- Natural 1 = Auto-miss / fumble

## Attack (Opposed Roll)
| Result | Effect |
|--------|--------|
| Attacker wins | Full damage |
| Tie / Defender wins | Miss |
| Natural 20 | Critical — double damage dice |
| Natural 1 | Auto-miss |

## Difficulty Classes (DC)
| Difficulty | DC |
|------------|-----|
| Trivial | 5 |
| Easy | 10 |
| Normal | 13 |
| Hard | 16 |
| Very Hard | 19 |
| Nearly Impossible | 22 |

## Spell DC
Each spell has its own DC: 8 (basic), 10 (standard), 13 (powerful), 16 (very powerful).
Roll 1D20 + INT modifier to cast.

---

*Aedelore Rules v2.0 - World of Aedelore*
*The DM always has the final say.*
