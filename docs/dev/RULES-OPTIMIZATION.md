# Aedelore Rules Optimization

> Dokumentation av regeldiskussioner och förslag till förbättringar.
> Startad: 2026-01-21

---

## Deltagare
- **DM/Designer:** Användaren
- **Testspelare:** Claude (simulerar spelarfrågor)

---

## Officiella Regler (från wiki)

### Poängfördelning vid start
- 10 extra poäng att fördela fritt bland talanger
- Max 5 poäng i en enskild talang vid start

### Tärningssystem
Alla checks slås med **1D20 + modifierare** mot **DC**.

Poäng konverteras till modifierare: `Math.ceil(poäng / 2)`

| Poäng | Modifierare |
|-------|-------------|
| 1-2 | +1 |
| 3-4 | +2 |
| 5-6 | +3 |
| 7-8 | +4 |
| 9-10 | +5 |
| 11+ | +6 |

### Resultat
| Slag | Resultat |
|------|----------|
| Nat 1 | Fumble (automatiskt misslyckande) |
| < DC | Misslyckat |
| ≥ DC | Lyckat |
| Nat 20 | Kritisk framgång |

---

## Strid

### Initiative
- **≤6 spelare:** Slå D6, 1=lägst, 6=högst
- **>6 spelare:** Slå D10 istället

### Steg 1: Attack Check (Opposed Roll)
```
Attackerare: 1D20 + Weapon Attack Bonus
Försvarare: 1D20 + Defense modifierare
Attack ≥ Defense = Träff
```

| Resultat | Effekt |
|----------|--------|
| Attack < Defense | Miss |
| Attack ≥ Defense | Träff → full skada |
| Nat 20 | Critical hit |
| Nat 1 | Fumble |

### Steg 2: Skadekast
```
Skada = Vapnets Damage Dice (t.ex. 1D10, 2D6)
```

**Exempel - Svärdattack:**
- Attackerare: 1D20 + 2 (sword atk bonus) = 15
- Försvarare: 1D20 + 3 (dex+acrobatics) = 12
- 15 ≥ 12 → Träff
- Slå 1D10 för skada, får 7
- Svärd har +2 damage → Total: 9 skada

---

## Försvar

### Försvarsalternativ (Opposed Roll)

Försvararen slår 1D20 + modifierare mot attackerarens kast:

| Försvar | Formel |
|---------|--------|
| **Dodge** | 1D20 + Dexterity mod + Acrobatics mod |
| **Parry** | 1D20 + Strength mod + Weapon Attack Bonus |
| **Block** | 1D20 + Strength mod (+ shield/armor bonus) |
| **Take Hit** | 1D20 + Toughness mod + Armor Bonus |

### ✅ LÖST — Försvarsmekanik
D20-systemet löser den gamla oklarheten. Alla försvarsslag är nu:
**1D20 + modifierare** som opposed roll mot attackerarens **1D20 + attack bonus**.

---

## Magi

### Kasta besvärjelser
```
Spell-check = 1D20 + INT modifierare vs spell DC (anges på varje spell)
```

### Skadeberäkning
Se besvärjelsens beskrivning.

**Exempel - Ray of Frost:**
- Gör 1D6 skada
- Om resultatet är 4 och spellen multiplicerar ×3 → 12 skada

### Critical Success på magi
Effekter kan förstärkas (mer skada, bättre sekundära effekter). DM bestämmer.

### Byta besvärjelser
- Kan endast bytas i säkra områden (stad, by)
- Inte i vildmarken eller små läger
- Gamla spells glöms inte, blir bara inaktiva

---

## Förmågor (Abilities)

### Melee-klasser
Thief, Warrior, Hunter, Outcast har klassspecifika actions.

**Exempel - Thief's Vanish:**
1. Kolla ability-beskrivning → använder Stealth, DC 10
2. Slå 1D20 + Stealth modifierare vs DC 10
3. Lyckas (≥ DC) → Aktiverar förmågan
4. Får gain-bonus till handlingen
5. Betala kostnaden i "weakened"

---

## Exhaustion & Weakened

### Weakened-poäng
- Varje karaktär har **6 weakened points**
- Vissa abilities/actions kostar weakened
- När alla är förbrukade → risk för svimning/död

### När weakened = 0
Slå **1D20 + Toughness modifierare vs DC 10**:

| Resultat | Effekt |
|----------|--------|
| Nat 1 | **Död** (total utmattning) |
| Misslyckat (< DC 10) | **Svimning** |
| Lyckat (≥ DC 10) | **Kan röra sig** men inte strida |

---

## Blödning (Bleeding)

### Blödningsmekanik
När karaktär får kritiskt sår → börjar blöda.

**Varje runda:** Slå 1D6

| Slag | HP-förlust |
|------|------------|
| 1-2 | 3 poäng |
| 3-4 | 2 poäng |
| 5-6 | 1 poäng |

### När HP = 0 från blödning
Slå **1D20 + Toughness modifierare vs DC 10**:

| Resultat | Effekt |
|----------|--------|
| Nat 1 | **Död** (total blodförlust) |
| Misslyckat (< DC 10) | **Knappt vid liv** |
| Lyckat (≥ DC 10) | **Stabil** (medvetslös men inte döende) |
| Nat 20 | **Vid medvetande** (försvagad) |

---

## Vapen & Rustning

### Vapen och Core Abilities
| Vapentyp | Ability |
|----------|---------|
| Närstridsvapen (svärd) | Strength |
| Yxor/Klubbor | Strength |
| Dolkar | Dexterity |
| Kastvapen | Dexterity |
| Bågar | Dexterity |

### Kombinerade handlingar
**Exempel - Hoppande pilskott:**
1. Slå Acrobatics/Athletics för hoppet
2. Slå vapenskada med bågen
3. Fler successes = starkare attack

---

## Assistans

### Hjälpa annan spelare
- Ge upp din handling för att assistera
- Assisterad spelare får **+2** på nästa relevanta slag
- Måste vara narrativt motiverat
- Max 1 assistans per runda
- Ingen annan handling den rundan

---

## Resurser

### Mat, Vatten, Pilar
Startvärden från "Class, Race Bonus Sheet". Spåras med tärningar.

**Matförråd (Exempel: 1D10 mat):**
Slå 1D10 i början av varje dag:
- 6-10: Behåll 1D10
- 1-5: Minska till 1D6

**På D6:**
- 4+: Behåll D6
- 3 eller lägre: Slut på mat, 1 dag innan hungerskada

**Återfyllning:** Städer eller jakt i vildmarken.

### Pilar
Slå efter varje strid för att se hur många du förlorade/hittade.

---

## Worthiness & Rykte

### Mekanik
- Påverkar interaktion med kungar, ledare, myndigheter
- Påverkar hur folk behandlar dig i städer
- Dåligt rykte → vakter/stadsbor kan attackera eller utvisa dig

### Poängändring
- **Goda gärningar:** +poäng (hjälpa andra, heroiska handlingar)
- **Dåliga gärningar:** -poäng (onödigt dödande, stöld - speciellt om bevittnat)

---

## Drycker (Potions)

### Startdrycker
- Adrenaline
- Antidote
- Poison

Antal beror på character sheet. Köps i städer eller stjäls.

**OBS:** Kan INTE använda poison för att skapa förgiftade pilar.

---

## Religion

Följer karaktären en religion → vissa fördelar/nackdelar.
Se "Religions and Creeds" på wiki.

---

# FRÅGOR & OKLARHETER

## ✅ Lösta av D20-systemet

### 1. Försvarsmekanik — LÖST
**Gammalt problem:** "1D10 + X" var oklart (pool eller modifier?).
**Lösning:** D20 opposed rolls. Alla kast är 1D20 + modifierare.

### 2. Blodpoäng — FÖRTYDLIGAT
Blödning drar HP direkt. Ingen separat "blodpoängs"-resurs.
Vid HP = 0 från blödning → survival roll (1D20 + Toughness mod vs DC 10).

### 3. Rustningens roll — LÖST
Rustning ger bonus till "Take Hit" och "Block" defense-kast.
Rustning har egen HP som tar skada vid block.

### 4. Skadereduktion vid Block/Take Hit — LÖST
Block: Sköld/rustning absorberar upp till sitt Block-värde, resten går igenom.
Take Hit: Skillnaden mellan defense- och attack-kast reducerar skada.

---

## Balansnoteringar

### D6/D10 för skada
Blödning (D6), skada (D6/D10), initiative (D6/D10) behåller sina tärningstyper.
D20 används **enbart** för checks ("lyckas jag?"-slag).

### Initiative
Behåller D6 (≤6 deltagare) / D10 (>6 deltagare). Ej D20.

---

## Förslag (ej implementerade)

### Weakened-effekt under 6
**Nuvarande:** Ingen effekt förrän 0.

**Förslag:** Gradvis försämring?
- 4-5 weakened: Inga effekter
- 2-3 weakened: -1 på alla slag
- 1 weakened: -2 på alla slag
- 0 weakened: Survival roll (1D20 + Toughness mod vs DC 10)

---

# CHANGELOG

| Datum | Ändring |
|-------|---------|
| 2026-01-21 | Dokument skapat |
| 2026-01-21 | Officiella regler från wiki tillagda |
| 2026-01-21 | Oklarheter och frågor dokumenterade |
| 2026-02-23 | Migrerat från D10 pool-system till D20 + modifierare |

---

*Detta dokument uppdateras löpande under regeltestning.*
