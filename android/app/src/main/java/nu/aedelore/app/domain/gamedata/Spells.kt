package nu.aedelore.app.domain.gamedata

object Spells {

    data class Spell(
        val name: String,
        val damage: String,
        val arcana: String,
        val weakened: String,
        val desc: String,
        val check: String = "",
        val gain: Int = 0
    )

    val byClass: Map<String, List<Spell>> = mapOf(
        "Warrior" to listOf(
            Spell("Last Stand", "Take focus from enemy", "-", "2", "Take focus from enemy", "Check: Armor, min 1 success", 2),
            Spell("Hero", "Hero of the people", "-", "Worthiness", "Worthiness, Passive", "Passive", 0),
            Spell("Me First", "Ignore turns of initiative", "-", "3", "Ignore turns of initiative, +1 Initiative, 1 round", "Check: Athletics, min 2 success", 3),
            Spell("Ultimate Sacrifice", "You get full of adrenaline", "-", "2", "You get full of adrenaline, you take 2 dmg", "Check: Strength, min 1 success", 3),
            Spell("Paladin's Sacrifice", "Ignore Pain", "-", "4", "Ignore Pain, you faint after", "Check: Strength, min 1 success", 3),
            Spell("Crusader", "Use armor", "-", "2", "Use armor, 1 round", "Check: Armor, min 1 success", 3),
            Spell("Give In", "Massive Adrenaline", "-", "4", "Massive Adrenaline, you lose control", "Check: Strength, min 2 success", 4),
            Spell("Shield Wall", "Protect allies behind you", "-", "3", "Protect allies behind you, Requires shield, 2 rounds", "Check: Toughness, min 2 success", 3),
            Spell("Battle Cry", "Inspire nearby allies", "-", "2", "Inspire nearby allies, 1 round", "Check: Intimidation, min 1 success", 2),
            Spell("Second Wind", "Push through exhaustion", "-", "3", "Push through exhaustion", "Check: Endurance, min 1 success", 3),
            Spell("Disarm", "Remove enemy weapon", "-", "3", "Remove enemy weapon", "Check: Athletics, min 2 success", 2),
            Spell("Whirlwind", "Strike multiple nearby foes", "-", "4", "Strike multiple nearby foes, 1 round", "Check: Strength, min 2 success", 4),
            Spell("Intercept", "Take hit meant for ally", "-", "2", "Take hit meant for ally", "Check: Toughness, min 1 success", 3),
            Spell("Unbreakable", "Resist being knocked down", "-", "3", "Resist being knocked down, 2 rounds", "Check: Toughness, min 1 success", 3)
        ),

        "Thief/Rogue" to listOf(
            Spell("Lockpicking", "Open normal locks and chests", "-", "4", "Open normal locks and chests, not in battle", "Check: Sleight of Hand, min 1 success", 1),
            Spell("Sneaking", "Extra quiet when sneaking", "-", "3", "Extra quiet when sneaking", "Check: Stealth, min 1 success", 2),
            Spell("Awareness", "You are granted third eye", "-", "4", "You are granted third eye, not in battle", "Check: Perception, min 2 success", 4),
            Spell("Vanish", "You vanish into thin air", "-", "4", "You vanish into thin air", "Check: Stealth, min 2 success", 4),
            Spell("Footloose", "You move fast as lightning", "-", "3", "You move fast as lightning", "Check: Dexterity, min 2 success", 5),
            Spell("Fixed Mind", "You deceive someone", "-", "4", "You deceive someone", "Check: Deception, min 1 success", 2),
            Spell("Backstab", "Strike from behind for extra damage", "-", "3", "Strike from behind for extra damage", "Check: Dexterity, min 2 success", 3),
            Spell("Pickpocket", "Steal from someone unnoticed", "-", "4", "Steal from someone unnoticed, not in battle", "Check: Sleight of Hand, min 1 success", 2),
            Spell("Evasion", "Dodge incoming attack", "-", "3", "Dodge incoming attack, 1 round", "Check: Acrobatics, min 2 success", 4),
            Spell("Shadow Cloak", "Blend into shadows", "-", "3", "Blend into shadows, 2 rounds", "Check: Stealth, min 1 success", 3),
            Spell("Disengage", "Escape without provoking attack", "-", "2", "Escape without provoking attack", "Check: Acrobatics, min 1 success", 2),
            Spell("Poison Blade", "Coat weapon with poison", "-", "3", "Coat weapon with poison, not in battle", "Check: Sleight of Hand, min 1 success", 3),
            Spell("Silent Step", "Move without making sound", "-", "2", "Move without making sound, not in battle", "Check: Stealth, min 1 success", 2)
        ),

        "Hunter" to listOf(
            Spell("Steady Shot", "Your arrow hits exactly where you aim", "-", "3", "Your arrow hits exactly where you aim", "Check: Dexterity, min 1 success", 2),
            Spell("Tame a Beast", "Tame a normal non-magical beast", "-", "5", "Tame a normal non-magical beast, not in battle", "Check: Animal Handling, min 2 success", 5),
            Spell("Unveil Path", "You notice tracks no one else notices", "-", "2", "You notice tracks no one else notices, not in battle", "Check: Survival, min 1 success", 2),
            Spell("Set Trap", "You build natural traps", "-", "3", "You build natural traps, not in battle", "Check: Nature, min 1 success", 3),
            Spell("Shadow Meld", "You melt into the shadows", "-", "4", "You melt into the shadows, not in battle", "Check: Stealth, min 2 success", 4),
            Spell("Spider Senses", "Take notice of surroundings", "-", "2", "Take notice of surroundings, not in battle", "Check: Perception, min 1 success", 2),
            Spell("Rain of Death", "Shoot multiple arrows at targets", "-", "4", "Shoot multiple arrows at targets", "Check: Dexterity, min 2 success", 3),
            Spell("Hunter's Mark", "Mark target for tracking", "-", "2", "Mark target for tracking, 4 rounds", "Check: Survival, min 1 success", 2),
            Spell("Camouflage", "Blend into natural surroundings", "-", "3", "Blend into natural surroundings, not in battle", "Check: Stealth, min 1 success", 3),
            Spell("Precision Strike", "Strike a vital point", "-", "4", "Strike a vital point", "Check: Dexterity, min 2 success", 4),
            Spell("Call Companion", "Summon your animal companion", "-", "3", "Summon your animal companion, not in battle", "Check: Animal Handling, min 1 success", 3),
            Spell("Quick Draw", "Draw and attack in one motion", "-", "2", "Draw and attack in one motion", "Check: Dexterity, min 1 success", 3),
            Spell("Foraging", "Find food and supplies in nature", "-", "2", "Find food and supplies in nature, not in battle", "Check: Nature, min 1 success", 1),
            Spell("Sniper Shot", "Shoot from extreme distance", "-", "4", "Shoot from extreme distance", "Check: Dexterity, min 2 success", 4)
        ),

        "Outcast" to listOf(
            Spell("Shadow Step", "Blend into shadows, move silently", "-", "3", "Blend into shadows, move silently, not in battle", "Check: Stealth, min 1 success", 3),
            Spell("Wilderness Survival", "Proficiency in tracking & navigation", "-", "3", "Proficiency in tracking & navigation, not in battle", "Check: Nature, min 1 success", 2),
            Spell("Street Smarts", "Read people and intentions", "-", "2", "Read people and intentions, not in battle", "Check: Investigation, min 1 success", 2),
            Spell("Unseen Ally", "Communicate with small creatures", "-", "3", "Communicate with small creatures, not in battle", "Check: Nature, min 1 success", 2),
            Spell("Improvised Weaponry", "Use anything as a weapon, no disadvantage", "-", "3", "Use anything as a weapon, no disadvantage", "Check: Strength, min 1 success", 3),
            Spell("Resilient Spirit", "Resist mental & emotional manipulation", "-", "3", "Resist mental & emotional manipulation", "Check: Toughness, min 1 success", 3),
            Spell("Counterculture", "Familiarity with forbidden knowledge", "-", "2", "Familiarity with forbidden knowledge", "Check: Investigation, min 1 success", 2),
            Spell("Scavenge", "Find useful items in ruins", "-", "2", "Find useful items in ruins, not in battle", "Check: Investigation, min 1 success", 2),
            Spell("Blend In", "Disappear in crowds", "-", "2", "Disappear in crowds, not in battle", "Check: Stealth, min 1 success", 2),
            Spell("Iron Will", "Resist fear and intimidation", "-", "3", "Resist fear and intimidation", "Check: Toughness, min 1 success", 3),
            Spell("Dirty Fighting", "Fight without honor for advantage", "-", "3", "Fight without honor for advantage", "Check: Strength, min 2 success", 3),
            Spell("Underground Network", "Contact hidden allies", "-", "3", "Contact hidden allies, not in battle", "Check: Investigation, min 1 success", 3),
            Spell("Endure Elements", "Resist harsh weather conditions", "-", "2", "Resist harsh weather conditions, 4 rounds", "Check: Toughness, min 1 success", 2),
            Spell("Adapt", "Quickly learn new skill or trade", "-", "3", "Quickly learn new skill or trade, not in battle", "Check: Investigation, min 1 success", 3)
        ),

        "Mage" to listOf(
            // Offensive - Arcana 1
            Spell("Scorch", "2/D10", "1", "-", "Offensive, Scorch an enemy"),
            Spell("Fireball", "2/D6", "1", "-", "Offensive, Shoot a fireball"),
            Spell("Arcane Bolt", "1/D10", "1", "-", "Offensive, Shoot arcane bolt"),
            Spell("Icebolt", "1/D10", "1", "-", "Offensive, Cast bolt of frost"),
            Spell("Thunderclap", "1/D6", "1", "-", "Offensive, Summon lightning"),
            Spell("Frostbite", "1/D6", "1", "-", "Offensive, Freeze target with cold"),
            Spell("Magic Missile", "1/D6", "1", "-", "Offensive, Never-miss magic projectile"),
            Spell("Acid Splash", "1/D6", "1", "-", "Offensive, Hurl acid at 1-2 targets"),
            Spell("Sword Burst", "1/D6", "1", "-", "Offensive, Spectral blades cut all around you"),

            // Offensive - Arcana 2
            Spell("Icelance", "2/D6", "2", "-", "Offensive, Slice with sharp icelance"),
            Spell("Mage Blade", "2/D10", "2", "-", "Offensive, Control a magical sword, 1 round"),
            Spell("Shadow Bolt", "2/D6", "2", "-", "Offensive, Cast bolt of shadow"),
            Spell("Ice Knife", "2/D10", "2", "-", "Offensive, Throw ice knife that explodes on impact"),
            Spell("Cloud of Daggers", "2/D6", "2", "-", "Offensive, Cloud of spinning daggers, 2 rounds"),
            Spell("Arms of Despair", "2/D6", "2", "-", "Offensive, Dark tentacles strike all around you"),

            // Offensive - Arcana 3
            Spell("Ray of Frost", "3/D6", "3", "-", "Offensive, Pierce with frost"),
            Spell("Arcane Blast", "2/D10", "3", "-", "Offensive, Blast with arcane"),
            Spell("Mind Blast", "2/D10", "3", "-", "Offensive, Psychic damage to mind"),
            Spell("Spray of Cards", "2/D10", "3", "-", "Offensive, Throw magical cutting cards"),
            Spell("Conjure Barrage", "2/D10", "3", "-", "Offensive, Rain of projectiles"),
            Spell("Thunder Step", "2/D10", "3", "-", "Offensive, Teleport with thunderclap AoE"),

            // Offensive - Arcana 4
            Spell("Fireblast", "3/D6", "4", "-", "Offensive, Blast with fire"),
            Spell("Spirit Guardians", "3/D6", "4", "-", "Offensive, Spirits damage enemies around you, 4 rounds"),
            Spell("Black Tentacles", "3/D6", "4", "-", "Offensive, Dark tentacles grasp everything, 2 rounds"),

            // Offensive - Arcana 5
            Spell("Chain Lightning", "3/D6", "5", "-", "Offensive, Lightning jumps between targets"),
            Spell("Banishing Smite", "3/D6", "5", "-", "Offensive, Next attack banishes target"),
            Spell("Conjure Volley", "3/D6", "5", "-", "Offensive, Massive rain of arrows"),
            Spell("Steel Wind Strike", "3/D6", "5", "-", "Offensive, Teleport and slash multiple targets"),

            // Offensive - Arcana 6-7
            Spell("Arcane Missiles", "4/D6", "6", "-", "Offensive, Multiple arcane missiles"),
            Spell("Incendiary Cloud", "4/D6", "6", "-", "Offensive, Moving cloud of fire, 4 rounds"),
            Spell("Disintegrate", "4/D10", "7", "-", "Offensive, Disintegrate target"),
            Spell("Blade of Disaster", "4/D10", "7", "-", "Offensive, Create blade of pure destruction, 4 rounds"),

            // Black Magic / Summoning
            Spell("Summon Imp", "1/D10", "3", "-", "Black Magic, Summon small imp-like creature, 1 round"),
            Spell("Summon Shadowspawn", "1/D10", "3", "-", "Black Magic, Summon shadow creature, 1 round"),
            Spell("Summon Lesser Demons", "1/D10", "3", "-", "Black Magic, Summon multiple lesser demons, 1 round"),
            Spell("Summon Void", "2/D6", "4", "-", "Black Magic, Summon creature from void, 1 round"),
            Spell("Summon Aberration", "2/D6", "4", "-", "Black Magic, Summon an aberration, 1 round"),
            Spell("Hunger of the Fallen", "2/D6", "4", "-", "Black Magic, Sphere of darkness and cold, 2 rounds"),
            Spell("Summon Greater Demon", "2/D6", "4", "-", "Black Magic, Summon greater demon, 2 rounds"),
            Spell("Summon Infernal", "2/D10", "5", "-", "Black Magic, Summon infernal demon, 2 rounds"),
            Spell("Infernal Calling", "2/D10", "5", "-", "Black Magic, Summon a devil, 2 rounds"),
            Spell("Summon Fiend", "3/D6", "6", "-", "Black Magic, Summon a fiend, 4 rounds"),
            Spell("Maze", "0", "7", "-", "Black Magic, Trap target in labyrinth, Special"),

            // Conjuration
            Spell("Mage Hand", "0", "3", "-", "Conjuration, Control a magical hand, 1 round"),
            Spell("Unseen Servant", "0", "3", "-", "Conjuration, Summon invisible helper, 10 rounds"),
            Spell("Find Familiar", "0", "3", "-", "Conjuration, Summon magic companion, Permanent"),
            Spell("Flock of Familiars", "0", "3", "-", "Conjuration, Summon multiple familiars, 4 rounds"),
            Spell("Flaming Sphere", "2/D6", "3", "-", "Conjuration, Rolling ball of fire, 2 rounds"),
            Spell("Summon Construct", "2/D6", "4", "-", "Conjuration, Summon a construct, 2 rounds"),
            Spell("Guardian of Faith", "2/D6", "4", "-", "Conjuration, Summon protective spirit, 4 rounds"),
            Spell("Teleport", "0", "5", "-", "Conjuration, Teleport short distance, Instant"),
            Spell("Conjure Minor Elementals", "2/D10", "5", "-", "Conjuration, Summon small elementals, 2 rounds"),
            Spell("Summon Elemental", "2/D10", "5", "-", "Conjuration, Summon an elemental, 2 rounds"),
            Spell("Conjure Elemental", "3/D6", "6", "-", "Conjuration, Summon powerful elemental, 4 rounds"),

            // Protection
            Spell("Prismatic Barrier", "0", "2", "-", "Protection, Shield a party member, 1 round"),
            Spell("Ice Armor", "0", "2", "-", "Protection, Shroud yourself in ice, 4 rounds"),

            // Transmutation / Transformation
            Spell("Water Breathing", "0", "1", "-", "Transmutation, Breathe under water, 10 rounds"),
            Spell("Flickering Tongue", "0", "2", "-", "Transmutation, Understand creature, 1 round"),
            Spell("Levitate", "0", "2", "-", "Transmutation, Float in the air, 4 rounds"),
            Spell("Polymorph", "0", "3", "-", "Transmutation, Transform a character, 2 rounds"),
            Spell("Control Flames", "0", "3", "-", "Transmutation, Control nearby flames, 1 round"),
            Spell("Vortex Warp", "0", "3", "-", "Transmutation, Teleport another creature, Instant"),
            Spell("Invisibility", "0", "4", "-", "Transformation, Make someone invisible, 4 rounds"),
            Spell("Far Step", "0", "5", "-", "Transmutation, Teleport each round, 4 rounds"),
            Spell("Arcane Gate", "0", "6", "-", "Transmutation, Create portal between points, 4 rounds"),

            // Enchantment
            Spell("Sleep", "0", "2", "-", "Enchantment, Put creatures to sleep, 3 rounds"),
            Spell("Charm Person", "0", "3", "-", "Enchantment, Charm a humanoid, 2 rounds"),

            // Divination
            Spell("Detect Magic", "0", "1", "-", "Divination, Sense magical auras, 2 rounds"),
            Spell("Arcane Eye", "0", "3", "-", "Divination, See through magical eye, 4 rounds"),

            // Abjuration
            Spell("Arcane Lock", "0", "2", "-", "Abjuration, Lock a door magically, Permanent"),
            Spell("Counterspell", "0", "4", "-", "Abjuration, Counter enemy spell, Instant"),
            Spell("Dispel Magic", "0", "4", "-", "Abjuration, Remove magical effects, 1 round"),

            // Illusion
            Spell("Mirror Image", "0", "3", "-", "Illusion, Create duplicate images, 3 rounds"),

            // Necromancy / Manipulation
            Spell("Animate Dead", "0", "6", "-", "Necromancy, Animate life in something dead, 1 round"),
            Spell("Time Warp", "0", "6", "-", "Manipulation, Slow or rewind time, 1 round"),

            // Utility
            Spell("Light", "0", "2", "-", "Fire, Summon a source of light, 1 round"),
            Spell("Create Bonfire", "1/D10", "2", "-", "Fire, Create magic fire on ground, 1 round"),
            Spell("Web", "0", "3", "-", "Utility, Create sticky webs, 2 rounds"),
            Spell("Grease", "0", "3", "-", "Utility, Make area slippery, 2 rounds"),
            Spell("Wish", "Special", "8", "-", "Utility, Grant a wish, Instant")
        ),

        "Druid" to listOf(
            Spell("Rebirth", "0", "8", "-", "Nature, Revive someone, Not in battle"),
            Spell("Whips", "2/D10", "4", "-", "Nature, Roots attack target, 1 round"),
            Spell("Mending", "1/D10", "3", "-", "Nature, Mend a target"),
            Spell("Innervate", "0", "3", "-", "Arcana, Give someone initiative"),
            Spell("Prowler's Eyes", "0", "4", "-", "Nature, See in the dark, 1 round"),
            Spell("Packleader", "0", "3", "-", "Nature, Summon friends, Same region only"),
            Spell("Warrior of Tohu", "8", "6", "-", "Arcana, Channel raw arcana"),
            Spell("Tunes of Healing", "2/D6", "4", "-", "Nature, Heal a target"),
            Spell("Animal Handling", "0", "3", "-", "Nature, Communicate with animals, 2 rounds"),
            Spell("Earthshaping", "2/D6", "3", "-", "Nature, Earth moves at will, 1 round"),
            Spell("Thunderclap", "3/D6", "4", "-", "Arcana, Summon thunder, 1 round"),
            Spell("Plant Growth", "0", "4", "-", "Nature, Plant grows quickly, Permanent"),
            Spell("Insect Plague", "1/D6", "3", "-", "Nature, Summon insects, 1 round"),
            Spell("Storm", "2/D6", "4", "-", "Nature, Summon the winds"),
            Spell("Sunfire", "1/D10", "1", "-", "Fire, Channel sun energy, Only daytime"),
            Spell("Moonfall", "1/D10", "1", "-", "Arcana, Channel moon energy, Only nighttime"),
            Spell("Barkskin", "0", "2", "-", "Nature, Harden skin like bark, 4 rounds"),
            Spell("Entangle", "0", "2", "-", "Nature, Roots hold targets, 2 rounds"),
            Spell("Wildshape", "0", "4", "-", "Nature, Transform into animal, 4 rounds"),
            Spell("Poison Spray", "1/D6", "1", "-", "Nature, Spray poison at target"),
            Spell("Vine Lash", "1/D10", "2", "-", "Nature, Vines strike target"),
            Spell("Purify Water", "0", "1", "-", "Nature, Cleanse water, Permanent"),
            Spell("Speak with Plants", "0", "2", "-", "Nature, Communicate with plants, 2 rounds"),
            Spell("Call Lightning", "3/D6", "5", "-", "Arcana, Strike with lightning"),
            Spell("Moonbeam", "2/D6", "3", "-", "Arcana, Beam of moonlight, 2 rounds"),
            Spell("Cure Poison", "0", "3", "-", "Nature, Remove poison from target"),
            Spell("Starfall", "2/D10", "4", "-", "Arcana, Stars fall on target, Only nighttime"),
            Spell("Thorns", "1/D10", "2", "-", "Nature, Thorns pierce target"),
            Spell("Fog Cloud", "0", "2", "-", "Nature, Create thick fog, 3 rounds"),
            Spell("Earthquake", "3/D6", "6", "-", "Nature, Shake the earth violently"),
            Spell("Healing Circle", "2/D10", "5", "-", "Nature, Heal multiple targets"),
            Spell("Blight", "2/D6", "3", "-", "Nature, Drain life from target"),
            Spell("Tree Stride", "0", "3", "-", "Nature, Teleport between trees, 1 round"),
            Spell("Produce Flame", "1/D10", "1", "-", "Nature, Create flame to throw"),
            Spell("Infestation", "1/D6", "1", "-", "Nature, Insects plague target"),
            Spell("Hail of Thorns", "2/D6", "2", "-", "Nature, Thorns explode on hit"),
            Spell("Ensnaring Strike", "1/D10", "2", "-", "Nature, Thorns snare target on hit, 1 round"),
            Spell("Dust Devil", "2/D6", "3", "-", "Nature, Summon small whirlwind, 2 rounds"),
            Spell("Tidal Wave", "3/D6", "4", "-", "Nature, Summon massive wave"),
            Spell("Cloudkill", "3/D6", "5", "-", "Nature, Deadly poison cloud, 4 rounds"),
            Spell("Wall of Thorns", "4/D6", "6", "-", "Nature, Create wall of thorns, 4 rounds"),
            Spell("Tsunami", "4/D6", "6", "-", "Nature, Summon devastating tsunami"),
            Spell("Storm of Vengeance", "4/D10", "7", "-", "Nature, Summon apocalyptic storm, 4 rounds"),
            Spell("Sleet Storm", "0", "4", "-", "Nature, Sleet storm hinders movement, 2 rounds"),
            Spell("Stinking Cloud", "0", "4", "-", "Nature, Nauseating gas cloud, 2 rounds"),
            Spell("Grasping Vine", "0", "4", "-", "Nature, Vine grasps and pulls target, 2 rounds"),
            Spell("Watery Sphere", "0", "4", "-", "Nature, Trap target in water sphere, 2 rounds"),
            Spell("Summon Beast", "1/D10", "3", "-", "Nature, Summon beast companion, 2 rounds"),
            Spell("Summon Fey", "2/D6", "4", "-", "Nature, Summon fey creature, 2 rounds"),
            Spell("Giant Insect", "0", "4", "-", "Nature, Transform insects to giants, 4 rounds"),
            Spell("Conjure Woodland Beings", "2/D10", "5", "-", "Nature, Summon forest creatures, 2 rounds"),
            Spell("Conjure Animals", "2/D10", "5", "-", "Nature, Summon animal spirits, 2 rounds"),
            Spell("Summon Celestial", "2/D10", "5", "-", "Nature, Summon celestial being, 4 rounds"),
            Spell("Summon Draconic Spirit", "2/D10", "5", "-", "Nature, Summon dragon spirit, 4 rounds"),
            Spell("Conjure Fey", "3/D6", "6", "-", "Nature, Summon powerful fey, 4 rounds"),
            Spell("Air Bubble", "0", "2", "-", "Nature, Create air bubble for breathing, 24 hours"),
            Spell("Create Food and Water", "0", "4", "-", "Nature, Conjure sustenance, Instant"),
            Spell("Heroes' Feast", "0", "6", "-", "Nature, Summon magical feast, Permanent"),
            Spell("Temple of the Gods", "0", "7", "-", "Nature, Create holy temple, 24 hours")
        )
    )

    fun forClass(className: String): List<Spell> =
        byClass[className] ?: emptyList()
}
