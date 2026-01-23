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
Varje poäng i ability/skill/spell = 1D10

| Poäng | Tärningar |
|-------|-----------|
| 1-2 | 1D10 |
| 3-4 | 2D10 |
| 5-6 | 3D10 |
| 6-7 | 4D10 |
| 8-9 | 5D10 |
| 10+ | 6D10 |

**Max 8 tärningar** per handling (om inte klassförmåga tillåter mer).

### Resultatnivåer
| Slag | Resultat |
|------|----------|
| 1-4 | Failure (misslyckat) |
| 5-6 | Barely a success (minimal effekt) |
| 7-9 | Success (lyckas med målet) |
| 10 | Critical success (extra bra + slå om för bonus) |

---

## Strid

### Initiative
- **≤6 spelare:** Slå D6, 1=lägst, 6=högst
- **>6 spelare:** Slå D10 istället

### Steg 1: Attack Check
```
Attack-pool = Core Ability + Relevant Skill + Weapon Attack Bonus
(Max 8 tärningar)
```

| Framgångar | Resultat |
|------------|----------|
| 0 | Miss |
| 1 | Glancing blow (50% skada) |
| 2+ | Full skada |
| 10:or | Critical - slå om, kan förstärka effekt |

### Steg 2: Skadekast
```
Skada = 1D10 + vapnets skadebonus
```

**Exempel - Svärdattack:**
- Strength: 3 (3 tärningar)
- Sword atk bonus: +1 (1 tärning)
- Slå 4D10, får 2 successes → Full träff
- Slå 1D10 för skada, får 7
- Svärd har +2 damage → Total: 9 skada

---

## Försvar

### Försvarsalternativ (vid träff eller nära träff)

| Försvar | Formel |
|---------|--------|
| **Dodge** | 1D10 + Dexterity + skill |
| **Parry** | 1D10 + Strength + weapon attack bonus |
| **Block** | 1D10 + Strength + shield/armor |
| **Take Hit** | 1D10 + Strength + armor (reducerar skada) |

### ⚠️ OKLART - Försvarsmekanik
Reglerna säger "1D10 + X" men resten av systemet använder dice pools.

**Fråga:** Är det:
- A) En pool (Dexterity poäng → tärningar) + skill som extra tärningar?
- B) Bokstavligen 1D10 + ett numeriskt värde som modifier?
- C) Något annat?

**Behöver förtydligande från DM.**

---

## Magi

### Kasta besvärjelser
```
Spell-check = 1D10 per poäng i relevant ability (Arcana/Nature)
Kräver minst 1 success för att lyckas
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
1. Kolla ability-beskrivning → använder Stealth
2. Slå 1D10 per poäng i Stealth
3. Minst 1 success → Aktiverar förmågan
4. Får extra 4D10 för handlingen
5. Betala kostnaden i "weakened"

---

## Exhaustion & Weakened

### Weakened-poäng
- Varje karaktär har **6 weakened points**
- Vissa abilities/actions kostar weakened
- När alla är förbrukade → risk för svimning/död

### När weakened = 0
Slå **1D10 + Toughness**:

| Resultat | Effekt |
|----------|--------|
| 1-2 | **Död** (total utmattning) |
| 3-5 | **Svimning** |
| 6-10 | **Kan röra sig** men inte strida |

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

### När blodpoäng = 0
Slå **1D10 + Toughness**:

| Resultat | Effekt |
|----------|--------|
| 1-2 | **Död** (total blodförlust) |
| 3-4 | **Knappt vid liv** |
| 5-6 | **Svimmad** (kan inte röra sig eller strida) |

### ⚠️ OKLART - Blodpoäng
- Hur många blodpoäng har man?
- Är det samma som HP?
- Eller en separat resurs?

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
- Assisterad spelare får **+1D10** på nästa relevanta slag
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

## Prioritet 1 - Kräver förtydligande

### 1. Försvarsmekanik
**Citat:** "Dodging: Roll 1D10 + Dexterity + skill"

**Fråga:** Är detta:
- A) 1D10 + numeriskt värde (t.ex. 1D10 + 4 + 2 = resultat jämförs mot något)?
- B) En pool där Dexterity ger tärningar + skill ger extra tärningar?
- C) Contested roll mot attackerarens successes?

### 2. Blodpoäng
**Fråga:** Hur många "blood points" har en karaktär?
- Samma som HP?
- Separat resurs (t.ex. 10 för alla)?
- Baserat på Toughness?

### 3. Rustningens roll
**Fråga:** Vad gör rustning exakt?
- Ger den bonus till "Take Hit" eller "Block"?
- Har den egen HP som tar skada?
- Hur interagerar olika skadetyper (stick/hugg/kross)?

### 4. Skadereduktion vid Block/Take Hit
**Fråga:** Om jag lyckas med Block eller Take Hit, vad händer?
- Tar jag ingen skada alls?
- Reduceras skadan med ett värde?
- Fördelas skadan mellan mig och rustning/sköld?

---

## Prioritet 2 - Balansförslag

### 1. D6 vs D10 inkonsistens
**Problem:** Blödning använder D6, resten av systemet D10.

**Förslag:** Konvertera till D10:
| D10 Slag | HP-förlust |
|----------|------------|
| 1-3 | 3 poäng |
| 4-6 | 2 poäng |
| 7-10 | 1 poäng |

### 2. Initiative D6
**Problem:** Initiative använder D6 (eller D10 vid >6 spelare).

**Förslag:** Alltid D10 + Dexterity för konsistens?

---

## Prioritet 3 - Nya förslag

### Weakened-effekt under 6
**Nuvarande:** Ingen effekt förrän 0.

**Förslag:** Gradvis försämring?
- 4-5 weakened: Inga effekter
- 2-3 weakened: -1 tärning på alla slag
- 1 weakened: -2 tärningar
- 0 weakened: Survival roll

---

# CHANGELOG

| Datum | Ändring |
|-------|---------|
| 2026-01-21 | Dokument skapat |
| 2026-01-21 | Officiella regler från wiki tillagda |
| 2026-01-21 | Oklarheter och frågor dokumenterade |

---

*Detta dokument uppdateras löpande under regeltestning.*
