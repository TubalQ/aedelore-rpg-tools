# Aedelore - Kompletta Spelregler

> Version 1.0 | 2026-01-21
> Ett D10 pool-baserat rollspelsystem för World of Aedelore

---

# DEL 1: GRUNDLÄGGANDE SYSTEM

## 1.1 Filosofi

Aedelore använder ett flexibelt D10-baserat system inspirerat av Storyteller System.
**Dungeon Master (DM) har alltid sista ordet** - reglerna är riktlinjer, inte lagar.

Fokus ligger på:
- Snabb, intuitiv mekanik
- Kreativ problemlösning
- Berättardrivet spelande
- DM-flexibilitet

---

## 1.2 Tärningssystemet

### Grundregel
Poäng i förmågor och färdigheter konverteras till D10-tärningar:

| Poäng | Tärningar |
|-------|-----------|
| 1-2 | 1D10 |
| 3-4 | 2D10 |
| 5-6 | 3D10 |
| 7-8 | 4D10 |
| 9-10 | 5D10 |
| 11+ | 6D10 |

**Maxgräns:** Ingen handling får överstiga **8 tärningar** totalt, såvida inte en klassförmåga specifikt tillåter det.

### Resultatnivåer

Varje tärning utvärderas individuellt:

| Slag | Resultat | Beskrivning |
|------|----------|-------------|
| 1-5 | **Failure** | Misslyckas helt |
| 6-7 | **Barely** | Minimal framgång, kan ha konsekvenser |
| 8-9 | **Success** | Full framgång |
| 10 | **Critical** | Exceptionell framgång + slå om tärningen |

### Kritiska slag (10)
När du slår 10:
1. Räkna det som en **success**
2. Slå om tärningen
3. Lägg till resultatet av omslaget
4. Om omslaget också är 10, slå om igen (kan kedja)

**Exempel:** Du slår 10 → 8. Det blir 2 framgångar + eventuell kritisk effekt (DM bestämmer).

### Svårighetsgrad

DM sätter antal framgångar som krävs:

| Svårighet | Framgångar |
|-----------|------------|
| Trivial | 1 |
| Enkel | 2 |
| Normal | 3 |
| Svår | 4 |
| Mycket svår | 5 |
| Nästan omöjlig | 6+ |

---

## 1.3 Checks (Slag)

### Enkel check
```
Pool = Core Ability (poäng → tärningar)
```

### Kombinerad check
```
Pool = Core Ability + Skill
(Konvertera varje del till tärningar, max 8 totalt)
```

**Exempel:** Strength 4 (2D10) + Athletics 3 (2D10) = 4D10

### Contested check (Motståndare)
Båda parter slår sina pooler. Flest framgångar vinner.
Vid oavgjort: DM avgör (oftast fördel till försvarare).

---

# DEL 2: KARAKTÄRSSKAPANDE

## 2.1 Steg för steg

1. Välj **Ras** (ger bas-HP, Worthiness, bonusar)
2. Välj **Klass** (ger HP-bonus, utrustning, förmågor)
3. Välj **Religion** (valfritt, ger bonusar)
4. Fördela **10 extra poäng** bland talanger
5. Notera startutrustning

**Viktigt:** Ingen enskild talang får överstiga 5 poäng vid start.

---

## 2.2 Raser

Tillgängliga raser: Human, Dwarf, Halfling, High Elf, Moon Elf, Orc, Troll.

Varje ras ger:
- **Bas-HP** (läggs till klassens HP-bonus)
- **Worthiness** (startrykte)
- **Attributbonusar** (+1 eller +2 till olika skills)
- **Startutrustning** (vapen, mat, etc.)

> **Se separat fil för komplett raslista:** `html/data/races.js`

---

## 2.3 Klasser

Tillgängliga klasser: Warrior, Thief/Rogue, Outcast, Mage, Hunter, Druid.

Varje klass ger:
- **HP Bonus** (läggs till rasens bas-HP)
- **Worthiness** (läggs till rasens worthiness)
- **Attributbonusar**
- **Startutrustning** (vapen, rustning, guld)
- **Förmågor/Spells** (melee abilities eller magi)

**Klasstyper:**
- **Melee-klasser** (Warrior, Thief, Outcast, Hunter): Använder Weakened för abilities
- **Magi-klasser** (Mage, Druid): Använder Arcana för spells

> **Se separat fil för komplett klasslista:** `html/data/classes.js`

---

## 2.4 HP-beräkning

```
Total HP = Ras Bas-HP + Klass HP Bonus
```

**Exempel:** Human (20) + Warrior (+5) = **25 HP**

---

## 2.5 Worthiness-beräkning

```
Total Worthiness = Ras Worthiness + Klass Worthiness
```

**Exempel:** Human (6) + Thief (-4) = **2 Worthiness**

---

## 2.6 Religioner

Religion är valfritt. Varje religion ger:
- **Attributbonusar** (+1 eller +2 till specifika skills)
- Vissa religioner ger **negativ Worthiness** (-5)

> **Se separat fil för komplett religionslista:** `html/data/religions.js`

---

# DEL 3: ATTRIBUT & FÄRDIGHETER

## 3.1 Core Abilities (Huvudattribut)

| Attribut | Används för |
|----------|-------------|
| **Strength** | Närstridsattacker, lyfta, bryta, blocka |
| **Dexterity** | Distansattacker, undvika, smyga, finmotorik |
| **Toughness** | Motstå skada, uthållighet, blödning |
| **Intelligence** | Kunskap, logik, magi (Mage) |
| **Wisdom** | Intuition, perception, vilja |
| **Endurance** | Uthållighet, löpning, motstånd mot utmattning |

---

## 3.2 Skills (Färdigheter)

### Fysiska
| Skill | Kopplad Ability | Användning |
|-------|-----------------|------------|
| Athletics | Strength | Klättra, simma, hoppa |
| Acrobatics | Dexterity | Balans, tumla, undvika |
| Stealth | Dexterity | Smyga, gömma sig |
| Raw Power | Strength | Ren fysisk kraft |
| Unarmed | Strength/Dex | Obeväpnad strid |
| Resistance | Toughness | Motstå gift, sjukdom |

### Sociala
| Skill | Kopplad Ability | Användning |
|-------|-----------------|------------|
| Deception | Wisdom | Ljuga, lura |
| Intimidation | Strength/Wis | Skrämma, hota |
| Persuasion | Wisdom | Övertala, förhandla |
| Insight | Wisdom | Läsa av intentioner |

### Kunskaps
| Skill | Kopplad Ability | Användning |
|-------|-----------------|------------|
| Arcana | Intelligence | Magisk kunskap |
| History | Intelligence | Historisk kunskap |
| Nature | Intelligence/Wis | Naturkunskap |
| Religion | Wisdom | Religiös kunskap |
| Medicine | Wisdom | Läkekonst |
| Investigation | Intelligence | Undersöka, söka ledtrådar |
| Perception | Wisdom | Upptäcka, observera |
| Survival | Wisdom | Överleva i vildmarken |
| Animal Handling | Wisdom | Hantera djur |

### Övriga
| Skill | Kopplad Ability | Användning |
|-------|-----------------|------------|
| Sleight of Hand | Dexterity | Ficktjuveri, tricks |
| Luck | - | Slumpmässig tur |

---

# DEL 4: STRID

## 4.1 Initiative

Vid stridens början:
- **≤6 deltagare:** Slå 1D6 (1 = långsammast, 6 = snabbast)
- **>6 deltagare:** Slå 1D10 istället

Vid lika: DM avgör eller slå om.

---

## 4.2 Attack

### Steg 1: Attack Check

Bygg din attack-pool:
```
Attack Pool = Core Ability + Weapon Attack Bonus
```

Vapnet avgör vilken Core Ability som används (se vapenlistan):
- **Strength:** De flesta närstridsvapen (longsword, yxor, klubbor, hammare, spjut), Heavy Crossbow
- **Dexterity:** Dagger, Rapier, Scimitar, Shortsword, Whip, alla bågar, lätta armborst, kastknivar
- **Strength/Dexterity:** Katana (spelarens val)

**Konvertera** varje del till tärningar enligt tabellen (1.2), max 8D10 totalt.

**Exempel - Longsword (Strength, +2 attack):**
- Strength 4 = 2D10
- Longsword +2 = 1D10
- **Total:** 3D10

### Attack-resultat

| Framgångar | Resultat |
|------------|----------|
| 0 | **Miss** - ingen skada |
| 1 | **Glancing blow** - 50% skada |
| 2+ | **Full hit** - full skada |
| Critical (10) | Extra effekt (DM bestämmer) |

---

### Steg 2: Skadekast

Vid träff (minst 1 framgång), slå vapnets skadekast:

```
Skada = Vapnets Damage Dice
```

**Exempel:**
- Longsword = 1D10
- Greatsword = 2D6

**Vid Glancing Blow:** Halvera skadan (avrunda nedåt).

---

## 4.3 Försvar

När du attackeras kan du välja **en** av följande reaktioner:

### Dodge (Undvika)
```
Pool = Dexterity + Acrobatics
```
- **Success:** Undviker attacken helt
- **Barely:** Tar halv skada
- **Fail:** Tar full skada

### Parry (Parera)
```
Pool = Strength + Weapon Attack Bonus
```
- **Success:** Parerar attacken, ingen skada
- **Barely:** Reducerar skada med vapnets attack bonus
- **Fail:** Tar full skada

### Block (Blockera)
Kräver sköld eller rustning.
```
Pool = Strength
```
- **Success (minst 1):** Blockerar upp till sköldons/rustningens Block-värde i skada. Resterande skada går igenom till dig. Skölden tar den blockerade skadan på sin HP.
- **Fail:** Tar full skada

**Exempel:** Fiende gör 8 skada. Du blockerar med Shield (Metal, Block 5).
- Du slår Strength och får 1 success → Blockerar 5 skada
- Du tar 3 skada (8-5), skölden tar 5 skada på sin HP

### Take Hit (Ta träffen)
```
Pool = Toughness + Armor Bonus
```
Räkna framgångar. Varje framgång reducerar skadan med 1.

---

## 4.4 Rustning & Sköldar

### Rustningsdelar

Rustning skyddar specifika kroppsdelar: Huvud, Axlar, Bröst, Händer, Ben.

### Rustningsvärden

| Egenskap | Beskrivning |
|----------|-------------|
| **HP** | Rustningens hållbarhet |
| **Bonus** | Block-bonus (t.ex. "2+block") |
| **Disadvantage** | Nackdelar (t.ex. "-1 Stealth") |

### Rustnings-HP

När rustning tar skada, minska dess HP. Vid 0 HP är rustningen **Broken** och ger inget skydd.

> **Se separat fil för komplett rustnings- och sköldlista:** `html/data/armor.js`

---

## 4.5 Vapen

Vapen har följande egenskaper:
- **Ability:** Vilken förmåga som används (Strength/Dexterity)
- **Attack Bonus:** Läggs till attack-poolen
- **Damage:** Skadekast vid träff
- **Range:** Räckvidd i meter

> **Se separat fil för komplett vapenlista:** `html/data/weapons.js`

---

## 4.6 Kombinerade handlingar

Spelare kan kombinera handlingar (DM godkänner):

**Exempel - Hoppande pilskott:**
1. Slå **Athletics/Acrobatics** för hoppet
2. Vid lyckat hopp, slå **attack** med pilbåge
3. Fler framgångar kan ge bonus till attacken

---

## 4.7 Assistans i strid

En karaktär kan **ge upp sin handling** för att assistera en annan:
- Assisterad spelare får **+1D10** på sitt nästa slag
- Måste vara narrativt motiverat
- Max 1 assistans per runda

---

# DEL 5: MAGI

## 5.1 Arcana (Magipoäng)

| Klass | Max Arcana | Start Arcana |
|-------|------------|--------------|
| Mage | 20 | 10 |
| Druid | 16 | 8 |
| Övriga | 0 | 0 |

**Regenerering:** +1 Arcana per runda, +2 Arcana vid vila.

---

## 5.2 Kasta besvärjelser

### Spell Check
```
Pool = 1D10 per poäng i relevant ability (Arcana för Mage, Nature för Druid)
Kräver minst 1 success för att lyckas
```

### Spell Cost
Varje besvärjelse kostar Arcana. Se besvärjelsens beskrivning.

### Skadeberäkning
Se besvärjelsens beskrivning för skadeformel.

**Exempel - Ray of Frost:**
- Arcana-check för att kasta
- Vid success: 1D6 skada × spelens multiplikator

### Critical Success på magi
DM bestämmer effekt - kan vara:
- Ökad skada
- Utökad duration
- Förstärkta sekundäreffekter

### Misslyckad magi (Fumble)
Vid 0 framgångar på spell check kan DM besluta om:
- Spellen fizzlar (ingen effekt, Arcana förbrukas)
- Magisk bakslag (DM bestämmer konsekvens)

---

## 5.3 Byta besvärjelser

Mages och Druids kan lära sig fler besvärjelser än de kan ha aktiva.

**Regler:**
- Byten kan endast göras i **säkra områden** (stad, by)
- Inte i vildmarken eller små läger
- Gamla spells "glöms inte" - de blir inaktiva
- Krävs tid och koncentration (DM bestämmer)

---

# DEL 6: FÖRMÅGOR (ABILITIES)

## 6.1 Översikt

Melee-klasser (Warrior, Thief, Hunter, Outcast) har tillgång till speciella förmågor som kostar **Weakened** att använda.

### Användning
1. Kolla förmågans **Check** (t.ex. "Stealth, min 2 success")
2. Slå 1D10 per poäng i den relevanta skill
3. Vid lyckat check, betala **Weakened**-kostnaden
4. Få förmågans **Gain** (bonustärningar) till handlingen

---

## 6.2 Klassförmågor

Varje melee-klass har egna förmågor:

| Klass | Startförmågor |
|-------|---------------|
| **Warrior** | Last Stand, Hero, Battle Cry |
| **Thief/Rogue** | Lockpicking, Sneaking, Backstab |
| **Hunter** | Steady Shot, Tame a Beast, Unveil Path |
| **Outcast** | Shadow Step, Wilderness Survival, Street Smarts |

> **Se separat fil för komplett förmågeslista:** `data/abilities.txt`

---

# DEL 7: SKADOR & STATUSEFFEKTER

## 7.1 Weakened (Utmattning)

Varje karaktär har **6 Weakened Points**.

### Förbrukning
- Använda förmågor (abilities) kostar Weakened
- Vissa extrema handlingar kan kosta Weakened
- DM kan begära Weakened-kostnad för påfrestande aktiviteter

### När Weakened = 0

Slå **1D10 + Toughness**:

| Resultat | Effekt |
|----------|--------|
| 1-2 | **Död** - Total kollaps |
| 3-5 | **Svimning** - Medvetslös |
| 6-10 | **Utmattad** - Kan röra sig men inte strida |

### Återhämtning
- **Kort vila:** +1 Weakened
- **Lång vila:** Alla Weakened återställs

---

## 7.2 Bleed (Blödning)

När en karaktär får ett **kritiskt sår** (DM bestämmer när), börjar de blöda.

### Blödningsmekanik
**Varje runda:** Slå 1D6

| Slag | HP-förlust |
|------|------------|
| 1-2 | 3 HP |
| 3-4 | 2 HP |
| 5-6 | 1 HP |

### Bleed-värde
Karaktärer kan ha **Bleed [X]** där X anger allvarlighetsgrad:
- **Bleed 1:** Ytlig blödning (slå 1D6)
- **Bleed 2:** Allvarlig blödning (slå 2D6, ta högsta)
- **Bleed 3+:** Livshotande (slå 3D6, ta högsta)

### Stoppa blödning
- **Medicine check:** Minst 1 success stoppar Bleed 1, 2 success för Bleed 2, etc.
- **Bandage:** Stoppar Bleed 1 automatiskt
- **Healing magic:** Stoppar all blödning

### När HP = 0 från blödning
Slå **1D10 + Toughness**:

| Resultat | Effekt |
|----------|--------|
| 1-2 | **Död** - Total blodförlust |
| 3-4 | **Knappt vid liv** - Medvetslös, behöver omedelbar vård |
| 5-6 | **Svimmad** - Medvetslös men stabil |
| 7+ | **Vid medvetande** - Kan agera men kraftigt försvagad |

---

## 7.3 Andra statuseffekter

| Status | Effekt |
|--------|--------|
| **Poisoned** | -1D10 på alla slag, ta 1 skada/runda (DM varierar) |
| **Stunned** | Kan inte agera denna runda |
| **Blinded** | -2D10 på attacker och perception |
| **Deafened** | Kan inte höra, -1D10 på perception |
| **Frightened** | Kan inte närma sig skräckkällan, -1D10 på attacker |
| **Prone** | -1D10 på attacker, +1D10 för fiender i närstrid |

---

# DEL 8: RESURSER

## 8.1 Mat & Vatten

Resurser spåras med tärningar.

### Daglig förbrukning
**I början av varje dag, slå din mat-/vattentärning:**

| Resultat | Effekt |
|----------|--------|
| 6-10 (på D10) | Behåll nuvarande tärning |
| 1-5 (på D10) | Sänk till nästa tärningsstorlek |
| 4-6 (på D6) | Behåll D6 |
| 1-3 (på D6) | Slut på resursen |

### Utan mat/vatten
- **1 dag utan:** Inga effekter
- **2 dagar utan:** -1D10 på alla slag
- **3+ dagar utan:** Ta 1 skada per dag, -2D10 på alla slag

### Återfylla
- **Städer:** Köp mat och vatten
- **Vildmarken:** Jaga (Survival check) eller Forage (Nature check)

---

## 8.2 Pilar & Ammunition

### Efter strid
Slå 1D6 för att se hur mycket ammunition du återfår:
- **1-2:** Förlorade de flesta - behåll 25%
- **3-4:** Förlorade några - behåll 50%
- **5-6:** Hittade de flesta - behåll 75%

### Inköp
| Ammunition | Kostnad |
|------------|---------|
| Arrows (20-50) | 1 gold |
| Bolts (20-50) | 1 gold |
| Blowgun Needles (20-50) | 1 gold |
| Sling Bullets (20) | 4 copper |

---

## 8.3 Drycker (Potions)

### Startdrycker
Alla karaktärer börjar med:
- Adrenaline
- Antidote
- Poison

Antal beror på klass/ras.

### Dryckeseffekter
| Dryck | Effekt |
|-------|--------|
| **Adrenaline** | +2D10 på nästa handling |
| **Antidote** | Botar Poisoned-status |
| **Poison** | Kan appliceras på vapen (DM bestämmer effekt) |
| **Arcane Elixir** | +10 Arcana (endast Mage/Druid) |
| **Healing Potion** | Återställ 1D10 HP |

**OBS:** Poison kan **INTE** användas för att skapa förgiftade pilar.

---

## 8.4 Arcane Elixir

Speciell dryck för magianvändare:
- **Effekt:** Återställer 10 Arcana
- **Start:** Mage = 2, Druid = 1, Övriga = 0
- **Max bärbart:** 4

---

# DEL 9: WORTHINESS & RYKTE

## 9.1 Worthiness

Worthiness representerar din karaktärs rykte och anseende i samhället.

### Påverkan
- **Högt Worthiness:** Respekterad, välkomnad i städer, bättre priser
- **Lågt Worthiness:** Misstänkt, kan nekas service, vakter uppmärksamma
- **Negativt Worthiness:** Eftersökt, kan attackeras på syn

### Ändra Worthiness

| Handling | Förändring |
|----------|------------|
| Heroisk gärning (rädda oskyldiga) | +1 till +3 |
| Hjälpa behövande | +1 |
| Döda oskyldiga | -2 till -5 |
| Stöld (om upptäckt) | -1 till -2 |
| Mord (om bevittnat) | -3 till -5 |
| Följ en ondskefull religion | -5 (vid start) |

### Sociala checks
DM kan kräva Worthiness-baserade checks för att:
- Få audiens hos kungar/ledare
- Få tillgång till exklusiva områden
- Undvika misstankar

---

# DEL 10: ÖVRIGT

## 10.1 Healing & Vila

### Naturlig läkning
- **Kort vila (1 timme):** +1D6 HP, +1 Weakened
- **Lång vila (8 timmar):** Alla HP återställs, alla Weakened återställs

### Magisk läkning
Enligt besvärjelsens beskrivning.

### Medicine
Slå **Medicine check**:
- **1 success:** +1D6 HP till patient
- **2+ successes:** +2D6 HP till patient
- **Critical:** +3D6 HP till patient

---

## 10.2 Död & Döende

### När HP = 0
Karaktären är **Döende**. Varje runda:
1. Slå **1D10 + Toughness**
2. Resultat avgör utfall (se 7.2)

### Stabilisering
En annan karaktär kan försöka stabilisera:
- **Medicine check (1 success):** Karaktären stabiliseras, medvetslös men inte döende
- **Healing magic:** Återuppväcker karaktären

### Permanent död
DM avgör när en karaktär är permanent död (massiv skada, dekaptiation, etc.).

---

## 10.3 Erfarenhet & Progression

DM avgör hur karaktärer utvecklas. Förslag:

### Efter varje session
- +1 poäng att fördela på valfri skill

### Efter varje större äventyr
- +1 poäng till en Core Ability
- +1 ny förmåga eller besvärjelse

---

# APPENDIX A: DM-RIKTLINJER

## A.1 Grundprinciper

1. **Reglerna är riktlinjer** - Anpassa för berättelsen
2. **Ja, och...** - Försök säga ja till spelarnas idéer
3. **Konsekvenser** - Handlingar har följder
4. **Fair men utmanande** - Spelare ska känna fara utan hopplöshet

## A.2 När regler saknas

Om en situation inte täcks av reglerna:
1. Bestäm relevant Ability + Skill
2. Sätt svårighetsgrad (antal framgångar)
3. Låt spelaren slå
4. Tolka resultatet narrativt

## A.3 Balansera strid

- **Svaga fiender:** 1-2 success för att besegra
- **Normala fiender:** Jämbördig strid
- **Starka fiender:** Kräver taktik och samarbete
- **Bossar:** Speciella mekaniker, flera faser

---

# APPENDIX B: SNABBREFERENS

## Tärningskonvertering
| Poäng | Tärningar |
|-------|-----------|
| 1-2 | 1D10 |
| 3-4 | 2D10 |
| 5-6 | 3D10 |
| 7-8 | 4D10 |
| 9-10 | 5D10 |
| 11+ | 6D10 |

## Resultatnivåer
| Slag | Resultat |
|------|----------|
| 1-5 | Failure |
| 6-7 | Barely |
| 8-9 | Success |
| 10 | Critical |

## Attack-resultat
| Framgångar | Effekt |
|------------|--------|
| 0 | Miss |
| 1 | 50% skada |
| 2+ | Full skada |

## Svårighetsgrader
| Svårighet | Framgångar |
|-----------|------------|
| Trivial | 1 |
| Enkel | 2 |
| Normal | 3 |
| Svår | 4 |
| Mycket svår | 5 |
| Nästan omöjlig | 6+ |

---

*Aedelore Rules v1.0 - World of Aedelore*
*DM har alltid sista ordet.*
