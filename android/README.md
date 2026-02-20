# Aedelore - Android App

Android-klient för [Aedelore](https://aedelore.nu), ett fantasy RPG-system med karaktärsblad och kampanjverktyg.

---

## Översikt

| Egenskap | Värde |
|----------|-------|
| Paket | `nu.aedelore.app` |
| Språk | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Arkitektur | Clean Architecture (UI → Domain → Data) |
| DI | Hilt |
| Nätverk | Retrofit + OkHttp |
| Lokal DB | Room |
| Inställningar | DataStore + EncryptedSharedPreferences |
| Min SDK | 26 (Android 8.0) |
| Target SDK | 35 |
| Version | 1.0.0 |

---

## Krav

| Verktyg | Version |
|---------|---------|
| JDK | 17 |
| Android SDK | 35 |
| Kotlin | 2.1.0 |
| Gradle | Version Catalog (`libs.versions.toml`) |

---

## Bygga & Köra

```bash
# Debug-bygge
./gradlew assembleDebug

# Release-bygge (kräver signeringskonfiguration)
./gradlew assembleRelease

# Installera på enhet
./gradlew installDebug
```

**`local.properties`** måste peka på Android SDK:
```properties
sdk.dir=/path/to/android-sdk
```

**Base URL** konfigureras i `app/build.gradle.kts`:
```kotlin
buildConfigField("String", "BASE_URL", "\"https://aedelore.nu\"")
```

---

## Arkitektur

Clean Architecture med tre lager:

```
UI (Compose)  →  Domain (modeller, utils)  →  Data (API, Room, DataStore)
```

**Dependency Injection** via Hilt med fyra moduler:

| Modul | Ansvar |
|-------|--------|
| `NetworkModule` | OkHttp, Retrofit, API-interfaces |
| `DatabaseModule` | Room databas, DAO |
| `PreferencesModule` | AppPreferences, AuthPreferences |
| `RepositoryModule` | Repository-bindings |

---

## Projektstruktur

```
app/src/main/java/nu/aedelore/app/
│
├── AedeloreApplication.kt              # Hilt Application
├── MainActivity.kt                     # Single Activity (Compose)
│
├── data/                               # Data-lager
│   ├── local/
│   │   ├── AedeloreDatabase.kt         # Room databas (v1)
│   │   ├── dao/
│   │   │   └── CharacterDao.kt         # CRUD + dirty flag queries
│   │   └── entity/
│   │       └── CharacterEntity.kt      # Room entity med is_dirty
│   │
│   ├── preferences/
│   │   ├── AppPreferences.kt           # Tema, onboarding, senaste karaktär (DataStore)
│   │   └── AuthPreferences.kt          # Token, userId, username (EncryptedSharedPrefs)
│   │
│   ├── remote/
│   │   ├── api/
│   │   │   ├── AuthApi.kt              # Login, register, logout, lösenord, konto
│   │   │   ├── CharacterApi.kt         # CRUD, lås, kampanj, quest items
│   │   │   ├── CampaignApi.kt          # Spelarens kampanjer, join/leave
│   │   │   ├── TrashApi.kt             # Papperskorg (soft delete)
│   │   │   └── WikiApi.kt              # Wiki-sökning
│   │   │
│   │   ├── dto/
│   │   │   ├── auth/AuthDtos.kt        # Request/response för auth
│   │   │   ├── character/CharacterDtos.kt # Request/response för karaktärer
│   │   │   ├── campaign/CampaignDtos.kt   # Request/response för kampanjer
│   │   │   ├── trash/TrashDtos.kt      # Request/response för papperskorg
│   │   │   └── wiki/WikiDtos.kt        # Request/response för wiki
│   │   │
│   │   └── interceptor/
│   │       ├── AuthInterceptor.kt      # Bearer token → Authorization header
│   │       ├── CookieJarImpl.kt        # Cookie-hantering (persisterar CSRF-cookie)
│   │       └── CsrfInterceptor.kt      # Double-submit CSRF: cookie → X-CSRF-Token header
│   │
│   └── repository/
│       ├── AuthRepositoryImpl.kt       # Auth data operations
│       ├── CharacterRepositoryImpl.kt  # Karaktär CRUD + lokal cache
│       ├── TrashRepositoryImpl.kt      # Papperskorg operations
│       └── WikiRepositoryImpl.kt       # Wiki-sökning
│
├── di/                                 # Hilt DI-moduler
│   ├── DatabaseModule.kt              # Room + DAO
│   ├── NetworkModule.kt               # OkHttp + Retrofit + API:er
│   ├── PreferencesModule.kt           # DataStore + EncryptedSharedPrefs
│   └── RepositoryModule.kt            # Repository bindings
│
├── domain/                            # Domain-lager
│   ├── gamedata/
│   │   ├── Races.kt                   # 7 raser med bonusar, HP, worthiness
│   │   ├── Classes.kt                 # 6 klasser med bonusar, ability slots
│   │   ├── Religions.kt              # 15 religioner med gudomligheter och bonusar
│   │   ├── Weapons.kt                # 47 vapen (Simple/Martial Melee/Ranged)
│   │   ├── Armors.kt                 # 34 rustningar + 5 sköldar
│   │   ├── Spells.kt                 # ~194 abilities/spells per klass
│   │   └── StartingEquipments.kt     # 42 ras+klass-kombinationer
│   │
│   ├── model/
│   │   ├── CharacterData.kt          # Komplett karaktärsdata (~330 fält, snake_case)
│   │   ├── Character.kt              # Karaktär med metadata
│   │   ├── Campaign.kt               # Kampanjmodell
│   │   ├── DiceRoll.kt               # Tärningsresultat (Critical/Success/Barely/Failure)
│   │   ├── LockState.kt              # Låsstatus (ras/klass, attribut, abilities)
│   │   ├── PartyMember.kt            # Party-medlem
│   │   ├── ProgressionState.kt       # Progressionssteg
│   │   ├── QuestItem.kt              # Quest item med arkivering
│   │   └── User.kt                   # Användarmodell
│   │
│   ├── repository/                    # Repository-interfaces
│   │   ├── AuthRepository.kt
│   │   ├── CharacterRepository.kt
│   │   ├── TrashRepository.kt
│   │   └── WikiRepository.kt
│   │
│   └── util/
│       ├── ArmorPenaltyCalculator.kt  # Beräknar rustnings-penalties på skills
│       ├── AttributeDistributor.kt    # Hanterar 10 fördelningsbara attributpoäng
│       ├── BonusParser.kt             # Parsar "+2 Strength"-strängar
│       ├── CharacterExporter.kt       # Exporterar karaktär till text
│       ├── HpCalculator.kt            # Beräknar HP från ras + klass
│       └── WorthinessDescriptor.kt    # describeLong() och describeShort()
│
├── ui/                                # UI-lager (Jetpack Compose)
│   ├── navigation/
│   │   ├── Screen.kt                 # Sealed class med alla routes
│   │   └── AedeloreNavHost.kt        # NavHost med alla composables
│   │
│   ├── theme/
│   │   ├── AedeloreTheme.kt          # MaterialTheme wrapper
│   │   ├── Color.kt                  # 12 teman + accent-färger
│   │   ├── Shape.kt                  # Rounded shapes
│   │   └── Type.kt                   # Typografi
│   │
│   ├── common/                        # Delade UI-komponenter
│   │   ├── AvatarPicker.kt           # Avatar-väljare
│   │   ├── DropdownSelector.kt       # Återanvändbar dropdown
│   │   ├── HpBar.kt                  # HP-bar med färgkodning
│   │   ├── ResourceAdjuster.kt       # +/- knappar för resurser
│   │   └── StatusBar.kt              # Statusrad (bleed, weakened)
│   │
│   ├── auth/
│   │   ├── AuthViewModel.kt          # Auth state management
│   │   ├── LoginScreen.kt            # Inloggning
│   │   ├── RegisterScreen.kt         # Registrering
│   │   ├── ForgotPasswordScreen.kt   # Glömt lösenord
│   │   ├── ResetPasswordScreen.kt    # Återställ lösenord
│   │   └── AccountScreen.kt          # Kontoinställningar (lösenord, e-post, radera)
│   │
│   ├── characterlist/
│   │   ├── CharacterListScreen.kt    # Lista karaktärer + skapa ny
│   │   └── CharacterListViewModel.kt # State för karaktärslista
│   │
│   ├── sheet/                         # Karaktärsblad
│   │   ├── CharacterSheetScreen.kt   # Scaffold med flikar
│   │   ├── CharacterSheetViewModel.kt # State + autosave-logik
│   │   ├── overview/OverviewTab.kt   # Översikt (dashboard)
│   │   ├── character/CharacterTab.kt # Ras, klass, religion, bakgrund
│   │   ├── stats/StatsTab.kt        # Attribut + skills
│   │   ├── abilities/AbilitiesTab.kt # Spells/abilities
│   │   ├── combat/CombatTab.kt      # HP, vapen, rustning, strid
│   │   ├── gear/GearTab.kt          # Inventarier, quest items, valuta
│   │   └── tools/ToolsTab.kt        # Tärningar, wiki-sökning, export
│   │
│   ├── onboarding/
│   │   └── OnboardingScreen.kt       # Första gången-guide
│   │
│   ├── settings/
│   │   └── SettingsScreen.kt         # Temaväljare
│   │
│   ├── trash/
│   │   ├── TrashScreen.kt            # Papperskorg (restore/permanent delete)
│   │   └── TrashViewModel.kt         # State för papperskorg
│   │
│   └── wiki/
│       ├── WikiSearchDialog.kt       # Wiki-sökdialog
│       └── WikiViewModel.kt          # State för wiki-sökning
│
└── util/
    ├── Constants.kt                   # BASE_URL, autosave interval, CSRF-nycklar
    ├── NetworkBoundResource.kt        # Cache-first strategy
    └── Result.kt                      # Sealed class: Success/Error/Loading
```

**Totalt: 91 Kotlin-filer**

---

## Funktioner

### Autentisering
- Login, registrering, logout
- Glömt lösenord (e-postbaserad reset)
- Kontoinställningar (byt lösenord, e-post, radera konto)
- Token lagras i EncryptedSharedPreferences (AES-256)

### Karaktärsblad (7 flikar)

| Flik | Innehåll |
|------|----------|
| Overview | Dashboard med HP, arcana, status, snabbåtgärder |
| Character | Ras, klass, religion, bakgrund |
| Stats | 7 attribut + 21 skills med auto-beräknade bonusar |
| Abilities | Upp till 10 spells/abilities med skada, arcana-kostnad |
| Combat | HP/Arcana-sliders, vapen (3 slots), rustning (5 delar), sköld |
| Gear | Inventarier (10 platser), quest items, valuta, mat/dryck, potions |
| Tools | Tärningsrullare, wiki-sökning, karaktärsexport |

### Karaktärsprogression (låssystem)
1. Välj ras + klass → Lås ras/klass
2. Fördela 10 attributpoäng → Lås attribut
3. Välj abilities → Lås abilities

### Tärningar
- D10, D12, D20 med succé-nivåer (Critical/Success/Barely/Failure)
- Dice pool rolling

### Kampanjer
- Gå med i kampanj via kampanjkod
- Visa party-medlemmar
- Quest items (ges av DM, kan arkiveras)

### Wiki
- Sökfunktion mot Aedelore-wikin

### Papperskorg
- Soft delete med möjlighet att återställa eller permanent radera

### Teman
- 12 mörka teman (se Teman-sektionen)

### Onboarding
- Första gången-guide som visas vid ny installation

---

## Speldata

All speldata är inbäddad i appen (ingen nätverksåtkomst krävs):

| Data | Antal | Fil |
|------|-------|-----|
| Raser | 7 | `Races.kt` |
| Klasser | 6 | `Classes.kt` |
| Religioner | 15 | `Religions.kt` |
| Vapen | 47 | `Weapons.kt` |
| Rustningar | 34 + 5 sköldar | `Armors.kt` |
| Spells/Abilities | ~194 | `Spells.kt` |
| Startutrustning | 42 kombinationer | `StartingEquipments.kt` |

---

## API-integration

### Bas-URL

```
https://aedelore.nu
```

Konfigureras via `BuildConfig.BASE_URL` i `build.gradle.kts`.

### CSRF-skydd (Double-Submit Cookie)

1. Första GET-request sätter `csrf_token`-cookie via `CookieJarImpl`
2. `CsrfInterceptor` läser cookie-värdet och skickar det som `X-CSRF-Token`-header
3. Exempt paths: `/api/login`, `/api/register`, `/api/forgot-password`, `/api/reset-password`

### Autentisering

`AuthInterceptor` lägger till `Authorization: Bearer <token>` på alla requests.
Token lagras krypterat i `AuthPreferences` (EncryptedSharedPreferences med AES-256-GCM).

### Endpoints

| API | Endpoints |
|-----|-----------|
| Auth | `POST login`, `POST register`, `POST logout`, `GET me`, `PUT password`, `PUT email`, `DELETE account`, `POST forgot-password`, `POST reset-password` |
| Characters | `GET/POST characters`, `GET/PUT/DELETE characters/:id`, `POST lock-race-class`, `POST lock-attributes`, `POST lock-abilities`, `POST spend-attribute-points`, `POST link-campaign`, `DELETE link-campaign`, `GET party`, `POST archive-item`, `POST unarchive-item` |
| Campaigns | `GET player/campaigns`, `GET player/campaigns/:id`, `POST campaigns/join`, `DELETE campaigns/:id/leave`, `GET campaigns/:id/players` |
| Trash | `GET trash/characters`, `POST trash/characters/:id/restore`, `DELETE trash/characters/:id` |
| Wiki | `GET wiki/search?q=` |

---

## Teman

12 mörka teman definierade i `Color.kt`:

| Tema | Primary | Surface | Background |
|------|---------|---------|------------|
| aedelore | `#8B5CF6` (lila) | `#1A1A2E` | `#0F0F1A` |
| midnight | `#3B82F6` (blå) | `#0A1628` | `#060E1A` |
| dark-glass | `#64748B` (grå) | `#1A1A1F` | `#0F0F12` |
| ember | `#F97316` (orange) | `#1A0C08` | `#0F0804` |
| forest | `#22C55E` (grön) | `#0A1208` | `#060C04` |
| frost | `#06B6D4` (cyan) | `#0A1018` | `#06080E` |
| void | `#6366F1` (indigo) | `#050510` | `#020208` |
| pure-darkness | `#9CA3AF` (silver) | `#0A0A0A` | `#000000` |
| blood | `#DC2626` (röd) | `#080404` | `#040202` |
| necro | `#4ADE80` (neon-grön) | `#050805` | `#020402` |
| royal | `#A855F7` (violett) | `#0A0610` | `#060408` |
| crimson | `#E11D48` (crimson) | `#0C0506` | `#060204` |

Temaval sparas i DataStore och synkas med webb-appen.

---

## Autosave & Offline

### Strategi

1. **Lokal sparning** — Ändringar sparas direkt i Room med `is_dirty = true`
2. **Moln-sync** — Var 5:e sekund (`AUTOSAVE_INTERVAL_MS`) synkas dirty characters till API
3. **Cache-first** — `NetworkBoundResource` visar lokalt data direkt, uppdaterar i bakgrunden

### Room-databas

| Tabell | Kolumner |
|--------|----------|
| `characters` | `id`, `name`, `system`, `data_json` (JSONB), `xp`, `xp_spent`, `race_class_locked`, `attributes_locked`, `abilities_locked`, `campaign_id`, `campaign_name`, `updated_at`, `is_dirty` |

### Offline-flöde

```
Användare redigerar → Room (is_dirty = true) → Timer 5s → PUT /api/characters/:id → Room (is_dirty = false)
```

---

## Navigation

### Screen routes

| Screen | Route | Beskrivning |
|--------|-------|-------------|
| Login | `login` | Inloggning |
| Register | `register` | Registrering |
| ForgotPassword | `forgot_password` | Glömt lösenord |
| ResetPassword | `reset_password/{token}` | Återställ lösenord |
| Onboarding | `onboarding` | Första gången-guide |
| CharacterList | `character_list` | Lista karaktärer |
| CharacterSheet | `character_sheet/{characterId}` | Karaktärsblad med flikar |
| Settings | `settings` | Temaväljare |
| Account | `account` | Kontoinställningar |
| Trash | `trash` | Papperskorg |

### Navigationsflöde

```
Login ──→ Onboarding* ──→ CharacterList ──→ CharacterSheet
  │                            │                  │
  ├──→ Register                ├──→ Settings      └──→ (7 flikar)
  └──→ ForgotPassword          ├──→ Account
                               └──→ Trash
```

*Onboarding visas bara vid första inloggningen.

---

## Dependencies

| Bibliotek | Version | Användning |
|-----------|---------|------------|
| Compose BOM | 2024.12.01 | UI-ramverk |
| Material 3 | (via BOM) | Design system |
| Hilt | 2.53.1 | Dependency injection |
| Retrofit | 2.11.0 | HTTP-klient |
| OkHttp | 4.12.0 | HTTP engine + interceptors |
| Kotlinx Serialization | 1.7.3 | JSON serialisering |
| Room | 2.6.1 | Lokal databas |
| DataStore | 1.1.1 | Inställningar |
| Security Crypto | 1.1.0-alpha06 | Krypterade preferences |
| Navigation Compose | 2.8.5 | Screen navigation |
| Lifecycle | 2.8.7 | ViewModel + Compose |
| Coroutines | 1.9.0 | Asynkron programmering |
| Coil | 2.7.0 | Bildladdning |
| KSP | 2.1.0-1.0.29 | Annotation processing |
