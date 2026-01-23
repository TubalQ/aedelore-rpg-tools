# Aedelore - Complete Rules

> Version 1.0 | 2026-01-21
> A D10 pool-based roleplaying system for World of Aedelore

---

# PART 1: CORE SYSTEM

## 1.1 Philosophy

Aedelore uses a flexible D10-based system inspired by the Storyteller System.
**The Dungeon Master (DM) always has the final say** - rules are guidelines, not laws.

Focus on:
- Fast, intuitive mechanics
- Creative problem-solving
- Narrative-driven gameplay
- DM flexibility

---

## 1.2 The Dice System

### Basic Rule
Points in abilities and skills convert to D10 dice:

| Points | Dice |
|--------|------|
| 1-2 | 1D10 |
| 3-4 | 2D10 |
| 5-6 | 3D10 |
| 7-8 | 4D10 |
| 9-10 | 5D10 |
| 11+ | 6D10 |

**Maximum:** No action may exceed **8 dice** total, unless a class ability specifically allows it.

### Result Levels

Each die is evaluated individually:

| Roll | Result | Description |
|------|--------|-------------|
| 1-4 | **Failure** | Complete failure |
| 5-6 | **Barely** | Minimal success, may have consequences |
| 7-9 | **Success** | Full success |
| 10 | **Critical** | Exceptional success + reroll the die |

### Critical Rolls (10)
When you roll 10:
1. Count it as a **success**
2. Reroll the die
3. Add the result of the reroll
4. If the reroll is also 10, reroll again (can chain)

**Example:** You roll 10 → 8. That's 2 successes + possible critical effect (DM decides).

### Difficulty

DM sets the number of successes required:

| Difficulty | Successes |
|------------|-----------|
| Trivial | 1 |
| Easy | 2 |
| Normal | 3 |
| Hard | 4 |
| Very Hard | 5 |
| Nearly Impossible | 6+ |

---

## 1.3 Checks

### Simple Check
```
Pool = Core Ability (points → dice)
```

### Combined Check
```
Pool = Core Ability + Skill
(Convert each part to dice, max 8 total)
```

**Example:** Strength 4 (2D10) + Athletics 3 (2D10) = 4D10

### Contested Check
Both parties roll their pools. Most successes wins.
On tie: DM decides (usually advantage to defender).

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

### Step 1: Attack Check

Build your attack pool:
```
Attack Pool = Core Ability + Weapon Attack Bonus
```

The weapon determines which Core Ability is used (see weapon list):
- **Strength:** Most melee weapons (longsword, axes, clubs, hammers, spears), Heavy Crossbow
- **Dexterity:** Dagger, Rapier, Scimitar, Shortsword, Whip, all bows, light crossbows, throwing knives
- **Strength/Dexterity:** Katana (player's choice)

**Convert** each part to dice according to the table (1.2), max 8D10 total.

**Example - Longsword (Strength, +2 attack):**
- Strength 4 = 2D10
- Longsword +2 = 1D10
- **Total:** 3D10

### Attack Results

| Successes | Result |
|-----------|--------|
| 0 | **Miss** - no damage |
| 1 | **Glancing blow** - 50% damage |
| 2+ | **Full hit** - full damage |
| Critical (10) | Extra effect (DM decides) |

---

### Step 2: Damage Roll

On hit (at least 1 success), roll the weapon's damage dice:

```
Damage = Weapon's Damage Dice
```

**Examples:**
- Longsword = 1D10
- Greatsword = 2D6

**On Glancing Blow:** Halve the damage (round down).

---

## 4.3 Defense

When attacked you may choose **one** of the following reactions:

### Dodge
```
Pool = Dexterity + Acrobatics
```
- **Success:** Avoid the attack completely
- **Barely:** Take half damage
- **Fail:** Take full damage

### Parry
```
Pool = Strength + Weapon Attack Bonus
```
- **Success:** Parry the attack, no damage
- **Barely:** Reduce damage by weapon's attack bonus
- **Fail:** Take full damage

### Block
Requires shield or armor.
```
Pool = Strength
```
- **Success (at least 1):** Block up to the shield's/armor's Block value in damage. Remaining damage goes through to you. The shield takes the blocked damage to its HP.
- **Fail:** Take full damage

**Example:** Enemy deals 8 damage. You block with Shield (Metal, Block 5).
- You roll Strength and get 1 success → Block 5 damage
- You take 3 damage (8-5), shield takes 5 damage to its HP

### Take Hit
```
Pool = Toughness + Armor Bonus
```
Count successes. Each success reduces damage by 1.

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
- **Attack Bonus:** Added to attack pool
- **Damage:** Damage dice on hit
- **Range:** Range in meters

> **See separate file for complete weapon list:** `html/data/weapons.js`

---

## 4.6 Combined Actions

Players can combine actions (DM approves):

**Example - Jumping Arrow Shot:**
1. Roll **Athletics/Acrobatics** for the jump
2. On successful jump, roll **attack** with bow
3. More successes may give bonus to the attack

---

## 4.7 Assistance in Combat

A character can **give up their action** to assist another:
- Assisted player gets **+1D10** on their next roll
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
Pool = 1D10 per point in relevant ability (Arcana for Mage, Nature for Druid)
Requires at least 1 success to succeed
```

### Spell Cost
Each spell costs Arcana. See the spell's description.

### Damage Calculation
See the spell's description for damage formula.

**Example - Ray of Frost:**
- Arcana check to cast
- On success: 1D6 damage × spell's multiplier

### Critical Success on Magic
DM decides effect - can be:
- Increased damage
- Extended duration
- Enhanced secondary effects

### Failed Magic (Fumble)
On 0 successes on spell check, DM may decide:
- Spell fizzles (no effect, Arcana consumed)
- Magical backlash (DM decides consequence)

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
1. Check the ability's **Check** (e.g., "Stealth, min 2 success")
2. Roll 1D10 per point in the relevant skill
3. On successful check, pay the **Weakened** cost
4. Gain the ability's **Gain** (bonus dice) for the action

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

Roll **1D10 + Toughness**:

| Result | Effect |
|--------|--------|
| 1-2 | **Death** - Total collapse |
| 3-5 | **Unconscious** - Fainted |
| 6-10 | **Exhausted** - Can move but not fight |

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
- **Medicine check:** At least 1 success stops Bleed 1, 2 successes for Bleed 2, etc.
- **Bandage:** Stops Bleed 1 automatically
- **Healing magic:** Stops all bleeding

### When HP = 0 from Bleeding
Roll **1D10 + Toughness**:

| Result | Effect |
|--------|--------|
| 1-2 | **Death** - Total blood loss |
| 3-4 | **Barely alive** - Unconscious, needs immediate care |
| 5-6 | **Fainted** - Unconscious but stable |
| 7+ | **Conscious** - Can act but severely weakened |

---

## 7.3 Other Status Effects

| Status | Effect |
|--------|--------|
| **Poisoned** | -1D10 on all rolls, take 1 damage/round (DM varies) |
| **Stunned** | Cannot act this round |
| **Blinded** | -2D10 on attacks and perception |
| **Deafened** | Cannot hear, -1D10 on perception |
| **Frightened** | Cannot approach fear source, -1D10 on attacks |
| **Prone** | -1D10 on attacks, +1D10 for enemies in melee |

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
- **2 days without:** -1D10 on all rolls
- **3+ days without:** Take 1 damage per day, -2D10 on all rolls

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
| **Adrenaline** | +2D10 on next action |
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
Roll **Medicine check**:
- **1 success:** +1D6 HP to patient
- **2+ successes:** +2D6 HP to patient
- **Critical:** +3D6 HP to patient

---

## 10.2 Death & Dying

### When HP = 0
The character is **Dying**. Each round:
1. Roll **1D10 + Toughness**
2. Result determines outcome (see 7.2)

### Stabilization
Another character can attempt to stabilize:
- **Medicine check (1 success):** Character is stabilized, unconscious but not dying
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
2. Set difficulty (number of successes)
3. Let the player roll
4. Interpret the result narratively

## A.3 Balancing Combat

- **Weak enemies:** 1-2 successes to defeat
- **Normal enemies:** Even fight
- **Strong enemies:** Requires tactics and cooperation
- **Bosses:** Special mechanics, multiple phases

---

# APPENDIX B: QUICK REFERENCE

## Dice Conversion
| Points | Dice |
|--------|------|
| 1-2 | 1D10 |
| 3-4 | 2D10 |
| 5-6 | 3D10 |
| 7-8 | 4D10 |
| 9-10 | 5D10 |
| 11+ | 6D10 |

## Result Levels
| Roll | Result |
|------|--------|
| 1-4 | Failure |
| 5-6 | Barely |
| 7-9 | Success |
| 10 | Critical |

## Attack Results
| Successes | Effect |
|-----------|--------|
| 0 | Miss |
| 1 | 50% damage |
| 2+ | Full damage |

## Difficulty Levels
| Difficulty | Successes |
|------------|-----------|
| Trivial | 1 |
| Easy | 2 |
| Normal | 3 |
| Hard | 4 |
| Very Hard | 5 |
| Nearly Impossible | 6+ |

---

*Aedelore Rules v1.0 - World of Aedelore*
*The DM always has the final say.*
