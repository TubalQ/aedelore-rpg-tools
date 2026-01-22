// ============================================
// NPC Name Generator Data for Aedelore
// ============================================
// Easy to extend - just add names to the arrays!
// Inspired by wiki.aedelore.nu naming conventions

const NPC_NAMES = {

    // ============================================
    // HUMAN - Nordic/Medieval European style
    // Normal first names, fantasy surnames
    // ============================================
    "Human": {
        male: [
            // Nordic
            "Erik", "Bjorn", "Ragnar", "Sven", "Olaf", "Harald", "Leif", "Ivar", "Gunnar", "Sigurd",
            "Torsten", "Magnus", "Arne", "Finn", "Knut", "Rolf", "Ulf", "Vidar", "Axel", "Lars",
            "Nils", "Per", "Anders", "Johan", "Henrik", "Fredrik", "Gustav", "Oscar", "Karl", "Emil",
            // Medieval European
            "William", "Robert", "Richard", "Edward", "Henry", "Thomas", "John", "James", "George", "Charles",
            "Arthur", "Edmund", "Alfred", "Edgar", "Roland", "Gareth", "Tristan", "Lancelot", "Galahad", "Percival",
            "Marcus", "Lucius", "Gaius", "Victor", "Felix", "Cassius", "Brennan", "Cormac", "Declan", "Finnian",
            // Germanic
            "Aldric", "Conrad", "Dietrich", "Gerhard", "Helmut", "Klaus", "Ludwig", "Otto", "Werner", "Wolfgang",
            "Alaric", "Baldwin", "Cedric", "Darius", "Egbert", "Fulton", "Godwin", "Hadrian", "Ingram", "Jarvis",
            // Fantasy-ish
            "Auren", "Malcath", "Varen", "Caden", "Theron", "Daven", "Kellan", "Ronan", "Brennan", "Corvin",
            "Aldric", "Bastian", "Caelum", "Dorian", "Evander", "Fabian", "Gideon", "Hadrian", "Isaric", "Jasper",
            "Kaelan", "Lorcan", "Maelon", "Neron", "Orin", "Phelan", "Quinlan", "Rhys", "Soren", "Tavian",
            "Ulric", "Vance", "Weston", "Xander", "Yorick", "Zephyr", "Ashwin", "Beric", "Caspian", "Drystan",
            // Common
            "Martin", "Simon", "Peter", "Paul", "Andrew", "Matthew", "Mark", "Luke", "Philip", "Stephen",
            "Nicholas", "Gregory", "Benedict", "Dominic", "Francis", "Anthony", "Vincent", "Leonard", "Bernard", "Raymond",
            "Walter", "Roger", "Gerald", "Howard", "Stanley", "Clifford", "Vernon", "Warren", "Clayton", "Milton",
            "Cedric", "Roderick", "Aldous", "Percival", "Reginald", "Archibald", "Bartholomew", "Cornelius", "Desmond", "Fitzgerald",
            // More Nordic
            "Stellan", "Viggo", "Aksel", "Birger", "Dag", "Einar", "Frode", "Gorm", "Hjalmar", "Ingvar",
            "Jarl", "Kjell", "Ludvig", "Magne", "Njord", "Odd", "Peder", "Ragnvald", "Sten", "Thorvald",
            "Yngve", "Asmund", "Brynjar", "Dagfinn", "Egil", "Frey", "Geir", "Halvor", "Iver", "Jostein",
            "Kolbein", "Loke", "Mathias", "Nikolai", "Oskar", "Petter", "Runar", "Sindre", "Terje", "Ulrik",
            // Additional
            "Garrett", "Nolan", "Griffin", "Drake", "Hunter", "Archer", "Fletcher", "Cooper", "Mason", "Carter",
            "Sawyer", "Turner", "Walker", "Parker", "Spencer", "Porter", "Steward", "Marshal", "Squire", "Baron"
        ],
        female: [
            // Nordic
            "Astrid", "Freya", "Ingrid", "Sigrid", "Helga", "Ragnhild", "Gudrun", "Solveig", "Liv", "Eira",
            "Signe", "Thora", "Ylva", "Saga", "Embla", "Idun", "Nanna", "Sif", "Urd", "Verdandi",
            "Skuld", "Hilda", "Brynhild", "Greta", "Karin", "Maja", "Elsa", "Anna", "Frida", "Linnea",
            // Medieval European
            "Eleanor", "Margaret", "Catherine", "Elizabeth", "Isabella", "Matilda", "Beatrice", "Cecilia", "Agnes", "Joan",
            "Alice", "Emma", "Rose", "Lily", "Violet", "Iris", "Ivy", "Hazel", "Ruby", "Pearl",
            "Edith", "Mildred", "Gertrude", "Winifred", "Millicent", "Constance", "Prudence", "Patience", "Faith", "Hope",
            // Celtic
            "Aoife", "Brigid", "Ciara", "Deirdre", "Eithne", "Fionnuala", "Grainne", "Isolde", "Maeve", "Niamh",
            "Orla", "Roisin", "Saoirse", "Siobhan", "Aisling", "Caoimhe", "Clodagh", "Emer", "Gormlaith", "Muireann",
            // Germanic
            "Adelheid", "Brunhilde", "Clothilde", "Dagmar", "Elfriede", "Frieda", "Gisela", "Hedwig", "Ilse", "Jutta",
            "Kunigunde", "Liesel", "Mathilde", "Ottilie", "Roswitha", "Sieglinde", "Trudi", "Uta", "Waltraud", "Wilhelmina",
            // Fantasy-ish
            "Aelindra", "Brienne", "Celeste", "Damara", "Elara", "Fenella", "Galena", "Helena", "Isara", "Jessamine",
            "Kalista", "Lyanna", "Morrigan", "Nerissa", "Ophelia", "Petra", "Quilla", "Rowena", "Selene", "Talindra",
            "Ursula", "Valentina", "Wren", "Xyla", "Yvaine", "Zara", "Althea", "Briseis", "Cordelia", "Daphne",
            // Common
            "Mary", "Sarah", "Anne", "Jane", "Grace", "Helen", "Clara", "Laura", "Diana", "Flora",
            "Vera", "Nora", "Dora", "Cora", "Lena", "Mina", "Tara", "Cara", "Lara", "Sara",
            "Eva", "Ada", "Ida", "Eda", "Ona", "Una", "Ina", "Ena", "Ana", "Ava",
            // More Nordic
            "Tuva", "Ronja", "Anja", "Sonja", "Tanja", "Katja", "Marja", "Pinja", "Riikka", "Sanna",
            "Tiina", "Viivi", "Aino", "Elina", "Hanna", "Iida", "Jenni", "Kaisa", "Liisa", "Minna",
            "Noora", "Oona", "Paula", "Riina", "Siiri", "Terhi", "Ulla", "Venla", "Wilma", "Aada",
            // Additional
            "Gwendolyn", "Guinevere", "Morgana", "Nimue", "Vivian", "Elaine", "Lynette", "Enid", "Bronwyn", "Rhiannon",
            "Arwen", "Elowen", "Kerensa", "Morwenna", "Senara", "Tamsin", "Demelza", "Eseld", "Lowena", "Meliora"
        ],
        surnames: [
            // Place-inspired (from wiki)
            "Vale", "Blackwood", "Northbridge", "Southbridge", "Brightwood", "Eastwatch", "Westfall", "Highcliff", "Lowhill", "Deepdale",
            "Stonehall", "Irongate", "Goldfield", "Silverbrook", "Coppermine", "Bronzeford", "Steelholm", "Thornwall", "Ashford", "Oakvale",
            // Profession-based
            "Smith", "Fletcher", "Cooper", "Mason", "Carpenter", "Tanner", "Weaver", "Potter", "Baker", "Miller",
            "Thatcher", "Sawyer", "Turner", "Walker", "Hunter", "Fisher", "Fowler", "Forester", "Shepherd", "Farmer",
            // Nordic patronymic style
            "Erikson", "Bjornson", "Ragnarson", "Svensson", "Haraldson", "Magnusson", "Karlsson", "Andersson", "Johansson", "Larsson",
            "Nilsson", "Persson", "Olsson", "Hansson", "Bengtsson", "Jonsson", "Lindberg", "Lindgren", "Lindqvist", "Lindstrom",
            // Nature-based
            "Storm", "Frost", "Winter", "Snow", "Rain", "Cloud", "Thunder", "Lightning", "Wind", "Gale",
            "River", "Lake", "Brook", "Stream", "Pond", "Marsh", "Moor", "Fen", "Dell", "Glen",
            "Hill", "Dale", "Cliff", "Crag", "Peak", "Ridge", "Hollow", "Meadow", "Field", "Grove",
            // Animal-based
            "Wolf", "Bear", "Hawk", "Eagle", "Raven", "Crow", "Fox", "Stag", "Hart", "Boar",
            "Lion", "Griffin", "Drake", "Falcon", "Heron", "Swan", "Owl", "Lynx", "Badger", "Otter",
            // Compound surnames
            "Ironside", "Strongbow", "Swiftblade", "Keenblade", "Trueheart", "Stoutheart", "Proudfoot", "Lightfoot", "Quickhand", "Steadfast",
            "Fairweather", "Goodman", "Wiseman", "Goodfellow", "Trueman", "Freeman", "Newman", "Oldman", "Youngblood", "Redbeard",
            // Fantasy surnames
            "Ashborne", "Blackthorn", "Coldwell", "Darkwood", "Evergreen", "Fairholm", "Greymist", "Hawkwood", "Ivywood", "Jasperstone",
            "Kingsley", "Lockwood", "Morningstar", "Nightingale", "Oakenshield", "Pinewood", "Queensbury", "Ravenswood", "Shadowmere", "Thornberry",
            "Underhill", "Vanguard", "Whitmore", "Yearwood", "Ashworth", "Bancroft", "Cromwell", "Dunmore", "Eastwood", "Fitzroy",
            // More place-inspired
            "Tyrwood", "Jacobsen", "Avenholt", "Finnmark", "Filholm", "Lutford", "Salinax", "Serexan", "Thorsmark", "Borean",
            "Marchwood", "Watchman", "Bridgewater", "Millbrook", "Wellspring", "Rootwood", "Sawbridge", "Holyfield", "Fortman", "Seaworth",
            // Germanic
            "Steinberg", "Goldberg", "Rosenberg", "Weinberg", "Kronberg", "Eisenberg", "Silberstein", "Kupferberg", "Bronstein", "Stahlberg",
            "Schwarzwald", "Weissberg", "Rotstein", "Blauberg", "Grunwald", "Braunfeld", "Neuhaus", "Altmann", "Bergmann", "Hoffmann",
            // Additional
            "Mercer", "Chandler", "Salter", "Draper", "Dyer", "Fuller", "Glover", "Hosier", "Mercer", "Skinner",
            "Spicer", "Stainer", "Vintner", "Wainwright", "Wheelwright", "Arkwright", "Cartwright", "Playwright", "Shipwright", "Warden"
        ]
    },

    // ============================================
    // DWARF - Norse/Germanic, clan-based
    // Strong, harsh consonants
    // ============================================
    "Dwarf": {
        male: [
            // Classic dwarf names
            "Thorgrim", "Durgan", "Balgrim", "Korgrim", "Morgrim", "Dolgrim", "Norgrim", "Vorgrim", "Borgrim", "Forgrim",
            "Thorin", "Balin", "Dwalin", "Fili", "Kili", "Oin", "Gloin", "Bifur", "Bofur", "Bombur",
            "Dain", "Nain", "Thrain", "Fundin", "Farin", "Glodin", "Throdin", "Brodin", "Frodin", "Krodin",
            // Norse-inspired
            "Grimnar", "Skaldor", "Thundrik", "Brokk", "Sindri", "Eitri", "Durinn", "Motsognir", "Nyi", "Nithi",
            "Nordri", "Sudri", "Austri", "Vestri", "Althjof", "Dvalin", "Nar", "Nain", "Niping", "Dain",
            "Galar", "Fjalar", "Andvari", "Regin", "Fafnir", "Hreidmar", "Otr", "Lofar", "Skirfir", "Virfir",
            // Harsh consonant names
            "Grundi", "Grundar", "Grundin", "Grundak", "Grundok", "Kragg", "Krogg", "Krugg", "Kragnar", "Krognar",
            "Dolgur", "Dolgak", "Dolgrim", "Dolgran", "Dolgar", "Braggi", "Bragnar", "Bragdur", "Bragrim", "Bragok",
            "Durgrim", "Durgar", "Durnak", "Durnok", "Durdin", "Gorrim", "Gorrak", "Gordin", "Gornak", "Gornok",
            // Stone/Metal themed
            "Ironbeard", "Stonefist", "Hammerfell", "Axeborn", "Shieldbreaker", "Goldhand", "Silveraxe", "Bronzehelm", "Steelarm", "Copperfoot",
            "Granitebeard", "Marblefist", "Obsidian", "Basalt", "Felite", "Malachite", "Jasper", "Onyx", "Flint", "Slate",
            // Craft-themed
            "Forgefire", "Anvilstrike", "Hammerfall", "Bellowsbreath", "Coalhand", "Sparkhammer", "Ironforge", "Goldsmith", "Gemcutter", "Runecarver",
            // Additional strong names
            "Bardin", "Gotrek", "Snorri", "Kazador", "Ungrim", "Thorgard", "Belegar", "Thorek", "Kragg", "Byrrnoth",
            "Alrik", "Agrin", "Dimzad", "Drong", "Durak", "Eldrek", "Ethgrim", "Garagrim", "Hargrim", "Kadrin",
            "Lokri", "Magnar", "Morek", "Nogrod", "Okri", "Ragnar", "Skavor", "Storri", "Thungni", "Valaya",
            // More variations
            "Brundak", "Drundak", "Grindak", "Krindak", "Prindak", "Trundak", "Vrundak", "Brondik", "Drondik", "Grondik",
            "Baruk", "Daruk", "Garuk", "Karuk", "Maruk", "Naruk", "Taruk", "Varuk", "Zaruk", "Borak",
            "Durgon", "Gurgon", "Kurgon", "Murgon", "Nurgon", "Thurgon", "Vurgon", "Zurgon", "Burdun", "Durdun",
            // Traditional
            "Rurik", "Torvald", "Hakon", "Sigmund", "Volund", "Wayland", "Alberich", "Mime", "Laurin", "Goldemar",
            "Elberich", "Elegast", "Oberon", "Nibelung", "Schilbung", "Hrothgar", "Beowulf", "Grendel", "Wiglaf", "Unferth"
        ],
        female: [
            // Classic dwarf female names
            "Helga", "Brunhild", "Sigrun", "Thora", "Gudrun", "Hilda", "Grima", "Grunda", "Dolgra", "Norgra",
            "Durla", "Borgla", "Forgla", "Vorgla", "Morgla", "Thorgla", "Korgla", "Balgla", "Dolgla", "Gorgla",
            // Strong feminine names
            "Dagny", "Ragnhild", "Ashild", "Bothild", "Brynhild", "Gunnhild", "Magnhild", "Ranhild", "Svanhild", "Torhild",
            "Alvhild", "Audhild", "Borghild", "Grimhild", "Hervor", "Lagertha", "Sigrid", "Thordis", "Ulfhild", "Vigdis",
            // Craft-themed
            "Forga", "Anvila", "Hammera", "Goldra", "Silvra", "Bronza", "Steela", "Irona", "Coppra", "Gemma",
            "Runea", "Stonehilda", "Ironbraid", "Goldweave", "Silverlock", "Bronzebeard", "Steelheart", "Coppershine", "Gemgleam", "Runekeeper",
            // Stone-themed
            "Granita", "Marbla", "Obsidiana", "Basalta", "Felita", "Malachita", "Jaspera", "Onyxa", "Flinta", "Slata",
            "Quartza", "Agata", "Beryla", "Corala", "Diamanta", "Emeralda", "Garneta", "Opala", "Pearla", "Rubya",
            // Norse feminine
            "Astrid", "Freya", "Ingrid", "Sigrid", "Sif", "Idunn", "Frigg", "Skadi", "Gefjon", "Nanna",
            "Eir", "Fulla", "Gna", "Hlin", "Lofn", "Sjofn", "Snotra", "Syn", "Var", "Vor",
            // Harsh but feminine
            "Kraga", "Graga", "Draga", "Braga", "Thraga", "Vraga", "Fraga", "Praga", "Traga", "Nraga",
            "Krogna", "Grogna", "Drogna", "Brogna", "Throgna", "Vrogna", "Frogna", "Progna", "Trogna", "Nrogna",
            // Additional
            "Alva", "Dalla", "Edda", "Freja", "Gerta", "Halla", "Inga", "Jora", "Kelda", "Lotta",
            "Magna", "Norna", "Olga", "Petra", "Runa", "Signe", "Tova", "Ulla", "Valdis", "Ylva",
            // Compound names
            "Deepdelve", "Strongarm", "Keeneye", "Swifthammer", "Truecraft", "Stoutbeard", "Proudshield", "Brightforge", "Darkmine", "Widehelm",
            // More variations
            "Durna", "Gurna", "Kurna", "Murna", "Nurna", "Thurna", "Vurna", "Zurna", "Burna", "Furna",
            "Dorlina", "Gorlina", "Korlina", "Morlina", "Norlina", "Thorlina", "Vorlina", "Zorlina", "Borlina", "Forlina",
            "Grimhilda", "Stonhilda", "Ironhilda", "Goldhilda", "Silverhilda", "Bronzhilda", "Steelhilda", "Copperhilda", "Gemhilda", "Runehilda"
        ],
        surnames: [
            // Clan names with -son/-dottir
            "Ironbeard", "Stonebeard", "Goldbeard", "Silverbeard", "Bronzebeard", "Copperbeard", "Steelbeard", "Blackbeard", "Redbeard", "Greybeard",
            "Ironfoot", "Stonefoot", "Goldfoot", "Silverfoot", "Bronzefoot", "Copperfoot", "Steelfoot", "Blackfoot", "Redfoot", "Greyfoot",
            // Craft clans
            "Forgeborn", "Anvilborn", "Hammerborn", "Axeborn", "Shieldborn", "Helmborn", "Armorborn", "Weaponborn", "Toolborn", "Craftborn",
            "Forgefyre", "Anvilstrike", "Hammerfell", "Axefall", "Shieldwall", "Helmguard", "Armorplate", "Weaponmaster", "Toolwright", "Craftmaster",
            // Mountain clans
            "Deepdelver", "Highpeak", "Undermountain", "Stonedelve", "Darkmine", "Deepmine", "Goldmine", "Silvermine", "Gemmine", "Ironmine",
            "Craghold", "Peakwatch", "Mountainhome", "Rockhome", "Stonehome", "Cavehome", "Minehold", "Delvehome", "Deephome", "Darkhold",
            // Battle clans
            "Shieldbreaker", "Axebreaker", "Hammerbreaker", "Swordbreaker", "Spearbreaker", "Helmsplitter", "Armorcrusher", "Wallbreaker", "Gatebreaker", "Doomhammer",
            "Trollslayer", "Giantslayer", "Dragonslayer", "Orcslayer", "Goblinslayer", "Demonslayer", "Undeadslayer", "Beastslayer", "Monsterslayer", "Wyrmslayer",
            // Honor clans
            "Oathkeeper", "Runekeeper", "Lorekeeper", "Gemkeeper", "Goldkeeper", "Silverkeeper", "Treasurekeeper", "Vaultkeeper", "Hallkeeper", "Throneguard",
            "Truehammer", "Trueblade", "Trueaxe", "Trueshield", "Truehelm", "Trueheart", "Truebeard", "Truearm", "Truefist", "Truestone",
            // Location-based
            "of Thir", "of Hogfoot", "of Herra", "of Seawatch", "of Embersail", "of Halfhill", "of Amberscall", "of Deepholm", "of Ironforge", "of Stonehall",
            // Patronymic style
            "Thorgrimson", "Durganson", "Balgrimson", "Korgrimson", "Morgrimson", "Dolgrimson", "Norgrimson", "Vorgrimson", "Borgrimson", "Forgrimson",
            // Element clans
            "Firebeard", "Icebeard", "Stormbeard", "Earthbeard", "Windbeard", "Thunderbeard", "Lightningbeard", "Frostbeard", "Flamebeard", "Sparkbeard",
            // Compound clans
            "Grimaxe", "Ironaxe", "Stoneaxe", "Goldaxe", "Silveraxe", "Bronzeaxe", "Steelaxe", "Blackaxe", "Redaxe", "Greyaxe",
            "Grimhammer", "Ironhammer", "Stonehammer", "Goldhammer", "Silverhammer", "Bronzehammer", "Steelhammer", "Blackhammer", "Redhammer", "Greyhammer",
            // More variations
            "Stronghold", "Stonehold", "Ironhold", "Goldhold", "Deephold", "Darkhold", "Highhold", "Grimhold", "Oldhold", "Newhold",
            "Strongarm", "Stonearm", "Ironarm", "Goldarm", "Steearm", "Darkarm", "Grimarm", "Hardarm", "Tougharm", "Mightyarm"
        ]
    },

    // ============================================
    // HALFLING - English countryside, cheerful
    // Short, friendly names
    // ============================================
    "Halfling": {
        male: [
            // Traditional English
            "Bilbo", "Frodo", "Sam", "Merry", "Pippin", "Hamfast", "Holman", "Hobson", "Halfred", "Hamson",
            "Bandobras", "Bungo", "Drogo", "Largo", "Longo", "Polo", "Ponto", "Porto", "Posco", "Balbo",
            // Cheerful names
            "Jasper", "Chester", "Winston", "Barley", "Bramble", "Clover", "Thistle", "Nettle", "Basil", "Sage",
            "Thyme", "Parsley", "Fennel", "Dill", "Mint", "Rosemary", "Tarragon", "Chive", "Sorrel", "Marjoram",
            // Country names
            "Farmer", "Miller", "Baker", "Cooper", "Fletcher", "Carter", "Porter", "Walker", "Turner", "Sawyer",
            "Tobias", "Barnaby", "Cornelius", "Archibald", "Reginald", "Percival", "Cuthbert", "Oswald", "Edmund", "Alfred",
            // Short friendly names
            "Tom", "Tim", "Ted", "Ned", "Ben", "Bob", "Bill", "Will", "Jack", "Jim",
            "Joe", "Jon", "Dan", "Don", "Ron", "Rob", "Rod", "Roy", "Ray", "Rex",
            // Food-inspired
            "Butterworth", "Honeycomb", "Applebee", "Berrywell", "Plumworth", "Pearson", "Cherrydale", "Peachfield", "Grapehill", "Melonbrook",
            "Cheddar", "Brie", "Gouda", "Stilton", "Camembert", "Roquefort", "Gruyere", "Manchego", "Feta", "Mozzarella",
            // Nature names
            "Robin", "Finch", "Sparrow", "Wren", "Martin", "Swift", "Lark", "Dove", "Quail", "Thrush",
            "Oak", "Ash", "Elm", "Birch", "Maple", "Willow", "Alder", "Hazel", "Rowan", "Holly",
            // More traditional
            "Adelard", "Baldric", "Cedric", "Dunstan", "Egbert", "Fulbert", "Godric", "Hereward", "Ingram", "Jocelyn",
            "Kendrick", "Leofric", "Merrick", "Norbert", "Osbert", "Peverel", "Quentin", "Radulf", "Sigbert", "Thurstan",
            // Whimsical
            "Dandelion", "Buttercup", "Daffodil", "Marigold", "Primrose", "Bluebell", "Snowdrop", "Foxglove", "Lavender", "Heather",
            // Additional
            "Benji", "Charlie", "Danny", "Eddie", "Freddy", "Georgie", "Harry", "Johnny", "Kenny", "Lenny",
            "Micky", "Nicky", "Ollie", "Paddy", "Reggie", "Sammy", "Teddy", "Vinny", "Wally", "Ziggy",
            // Cozy names
            "Armchair", "Hearthstone", "Pipeweed", "Teapot", "Kettle", "Porridge", "Pudding", "Muffin", "Crumpet", "Scone"
        ],
        female: [
            // Traditional English
            "Rose", "Lily", "Daisy", "Poppy", "Violet", "Iris", "Ivy", "Holly", "Hazel", "Fern",
            "Primrose", "Marigold", "Petunia", "Pansy", "Peony", "Dahlia", "Jasmine", "Lavender", "Heather", "Clover",
            // Cheerful names
            "Ruby", "Pearl", "Opal", "Amber", "Jade", "Coral", "Crystal", "Diamond", "Emerald", "Garnet",
            "Melody", "Harmony", "Cadence", "Lyric", "Carol", "Aria", "Sonata", "Symphony", "Rhapsody", "Serenade",
            // Country names
            "Buttercup", "Honeysuckle", "Sweetpea", "Bluebell", "Snowdrop", "Daffodil", "Tulip", "Carnation", "Chrysanthemum", "Geranium",
            "Rosemary", "Sage", "Thyme", "Basil", "Mint", "Parsley", "Cinnamon", "Ginger", "Saffron", "Vanilla",
            // Short friendly names
            "Amy", "Beth", "Cathy", "Dora", "Ella", "Fay", "Gina", "Hope", "Ivy", "Joy",
            "Kate", "Lucy", "Molly", "Nelly", "Olive", "Polly", "Queenie", "Rita", "Sally", "Tilly",
            // Food-inspired
            "Apple", "Berry", "Cherry", "Plum", "Peach", "Pear", "Grape", "Melon", "Lemon", "Lime",
            "Cookie", "Candy", "Sugar", "Honey", "Maple", "Caramel", "Toffee", "Fudge", "Truffle", "Bonbon",
            // Nature names
            "Wren", "Lark", "Dove", "Finch", "Robin", "Sparrow", "Starling", "Swallow", "Nightingale", "Meadowlark",
            "Willow", "Aspen", "Birch", "Cedar", "Laurel", "Myrtle", "Olive", "Magnolia", "Acacia", "Juniper",
            // More traditional
            "Agatha", "Beatrice", "Cecily", "Dorothy", "Edith", "Florence", "Gertrude", "Harriet", "Imogen", "Josephine",
            "Katherine", "Lucinda", "Margaret", "Nora", "Ophelia", "Prudence", "Rosalind", "Sylvia", "Tabitha", "Winifred",
            // Whimsical
            "Blossom", "Bubble", "Dewdrop", "Feather", "Gossamer", "Hummingbird", "Inkwell", "Jellybean", "Kitten", "Ladybug",
            // Additional
            "Abby", "Becky", "Cindy", "Dolly", "Emmy", "Fanny", "Ginny", "Hattie", "Izzy", "Jenny",
            "Kitty", "Lottie", "Maggie", "Nellie", "Ollie", "Peggy", "Rosie", "Susie", "Tessie", "Winnie",
            // Cozy names
            "Teacup", "Kettle", "Mittens", "Cushion", "Blanket", "Pillow", "Quilt", "Hearth", "Candle", "Ember"
        ],
        surnames: [
            // Place-based
            "Underhill", "Overhill", "Bywater", "Hayward", "Greenhill", "Whitfoot", "Brownlock", "Goodbody", "Proudfoot", "Longbottom",
            "Baggins", "Gamgee", "Took", "Brandybuck", "Bolger", "Burrows", "Cotton", "Hornblower", "Sackville", "Bracegirdle",
            // Nature surnames
            "Applebee", "Berryhill", "Cherrybrook", "Daisydale", "Elmwood", "Ferndale", "Greenleaf", "Hazelnut", "Ivyhill", "Juniperdale",
            "Kettlebrook", "Lilypad", "Meadowsweet", "Nutwood", "Oakbottom", "Poppyfield", "Quietwater", "Rosebush", "Sunnydale", "Thornberry",
            // Food surnames
            "Butterworth", "Cakebread", "Doughnut", "Eggworth", "Figbottom", "Gingerbread", "Honeycomb", "Jamsworth", "Kettlecorn", "Lemongrass",
            "Marmalade", "Nuttybread", "Oatcake", "Puddingstone", "Quinceberry", "Raisinhill", "Shortbread", "Toffeeapple", "Upcake", "Vineberry",
            // Profession surnames
            "Baker", "Brewer", "Cook", "Digger", "Gardner", "Haymaker", "Miller", "Piper", "Potter", "Roper",
            "Shepherd", "Tanner", "Thatcher", "Tinker", "Weaver", "Wheeler", "Woodman", "Wooler", "Farmer", "Fisher",
            // Descriptive surnames
            "Goodchild", "Merryweather", "Sweetwater", "Warmhearth", "Brightmorn", "Clearbrook", "Fairfield", "Gladhill", "Happydale", "Joyspring",
            "Kindleaf", "Laughbrook", "Merryheart", "Nicebottom", "Pleasanthill", "Quickfoot", "Rosycheek", "Sunnybrook", "Truefoot", "Warmfoot",
            // Compound surnames
            "Burrowhill", "Clovervale", "Dewmeadow", "Fernhollow", "Greenbottle", "Hillburrow", "Ivyhollow", "Kettlebottom", "Leafhollow", "Mossbottom",
            "Nettlebrook", "Oldburrow", "Pipeleaf", "Quiethollow", "Riverdale", "Smallburrow", "Thistledown", "Underfoot", "Vinehill", "Willowbottom",
            // Additional
            "Acornbottom", "Biscuithill", "Crumblebrook", "Dimplebottom", "Eveningstar", "Fiddleleaf", "Grumblebottom", "Hopsdale", "Inklebottom", "Jinglebell",
            "Knottybottom", "Loaferhill", "Mumblebottom", "Noodlebrook", "Oddfoot", "Pebblebrook", "Quibbledale", "Rumblefoot", "Stumblebrook", "Tumblehill",
            // More variations
            "Applewood", "Barleycorn", "Cornfield", "Dandelion", "Evergreen", "Flowerdale", "Grasshill", "Haystackhill", "Inkywell", "Jamjar",
            "Knittingbrook", "Lemonpie", "Mushroom", "Nectarwell", "Orangehill", "Pastrybrook", "Quiltbottom", "Ribbondale", "Strawberryhill", "Tapioca"
        ]
    },

    // ============================================
    // HIGH ELF - Elegant, flowing, ancient
    // Inspired by Loraniel, Lordean from wiki
    // ============================================
    "High Elf": {
        male: [
            // Wiki-inspired
            "Lordean", "Loraniel", "Lorindel", "Lorethan", "Loranthir", "Lorendil", "Lorathon", "Lorendor", "Lorithil", "Lorandir",
            // Elegant elvish
            "Aelindor", "Caelindril", "Faelindros", "Gaelindor", "Haelindril", "Jaelindor", "Kaelindril", "Laelindor", "Maelindril", "Naelindor",
            "Thaelindor", "Vaelindril", "Zhaelindor", "Aelithor", "Caelithor", "Faelithor", "Gaelithor", "Haelithor", "Jaelithor", "Kaelithor",
            // Star-themed
            "Starion", "Stellaron", "Celestior", "Astrion", "Lunarian", "Solarian", "Vesperian", "Aurorion", "Twilion", "Dawnion",
            "Starweaver", "Moonbinder", "Sunkeeper", "Dawnbringer", "Duskwalker", "Twilightseeker", "Nightwatcher", "Daybreaker", "Eventide", "Morningstar",
            // Ancient-sounding
            "Aerendir", "Calenhad", "Denethor", "Elendil", "Finrod", "Gildor", "Haldir", "Idril", "Celeborn", "Thranduil",
            "Glorfindel", "Elrohir", "Elladan", "Erestor", "Lindir", "Rumil", "Orophin", "Amroth", "Nimrodel", "Celebrimbor",
            // Wisdom-themed
            "Saelindor", "Wisendril", "Lorethil", "Sagendor", "Knowindril", "Learnethil", "Wisdomir", "Ancienthor", "Eldrithan", "Eternion",
            // Light-themed
            "Luminiel", "Radianthir", "Brilliandor", "Gleamindril", "Shinethil", "Glowenthir", "Brightendor", "Lightweaver", "Sunbinder", "Dawnseeker",
            // Nature-elegant
            "Oakenheart", "Willowmind", "Birchsoul", "Ashenwisdom", "Cedarthought", "Elmendream", "Maplespirit", "Pinethought", "Sprucemind", "Fernwisdom",
            // Additional elegant
            "Aranion", "Berendir", "Ciryon", "Duilin", "Ecthelion", "Fingon", "Galdor", "Hurin", "Ingwion", "Kelvar",
            "Legolin", "Mablung", "Nellas", "Oropher", "Pengolodh", "Quennar", "Rodnor", "Saeros", "Turgon", "Ulmo",
            // More variations
            "Aelanthir", "Baelanthir", "Caelanthir", "Daelanthir", "Eaelanthir", "Faelanthir", "Gaelanthir", "Haelanthir", "Iaelanthir", "Jaelanthir",
            "Kaelanthir", "Laelanthir", "Maelanthir", "Naelanthir", "Oaelanthir", "Paelanthir", "Qaelanthir", "Raelanthir", "Saelanthir", "Taelanthir",
            // Compound elegant
            "Silverwind", "Goldensong", "Crystalthought", "Diamondmind", "Emeraldspirit", "Sapphiresoul", "Rubyheart", "Pearlwisdom", "Opalvision", "Amethystdream",
            // Royal-sounding
            "Highborn", "Noblekin", "Royalblood", "Crownbearer", "Scepterhold", "Throneguard", "Regentson", "Princeling", "Lordling", "Dukesworth"
        ],
        female: [
            // Wiki-inspired
            "Lorenzia", "Lorindra", "Loranthia", "Lorendria", "Lorithia", "Lorandria", "Lorethia", "Lorindria", "Loranthra", "Lorendira",
            // Elegant elvish
            "Aelindra", "Caelindria", "Faelindra", "Gaelindria", "Haelindra", "Jaelindria", "Kaelindra", "Laelindria", "Maelindra", "Naelindria",
            "Thaelindra", "Vaelindria", "Zhaelindra", "Aelithia", "Caelithia", "Faelithia", "Gaelithia", "Haelithia", "Jaelithia", "Kaelithia",
            // Star-themed
            "Stariel", "Stellara", "Celestia", "Astria", "Lunaria", "Solaria", "Vesperia", "Auroria", "Twilia", "Dawnia",
            "Starweave", "Moonbind", "Sunkeep", "Dawnbring", "Duskwalk", "Twilightseek", "Nightwatch", "Daybreak", "Eventida", "Morningstara",
            // Ancient-sounding
            "Arwen", "Galadriel", "Luthien", "Idril", "Aredhel", "Finduilas", "Morwen", "Nienor", "Miriel", "Indis",
            "Earwen", "Anaire", "Elwing", "Celebrian", "Nimrodel", "Mithrellas", "Nellas", "Silmarien", "Vardamir", "Yavanna",
            // Wisdom-themed
            "Saelindra", "Wisendria", "Lorethia", "Sagendra", "Knowindria", "Learnethia", "Wisdoma", "Ancientia", "Eldritha", "Eternia",
            // Light-themed
            "Luminara", "Radianthia", "Brillianda", "Gleamindra", "Shinethia", "Glowenthia", "Brightendra", "Lightweava", "Sunbinda", "Dawnseeka",
            // Nature-elegant
            "Oakheart", "Willowminda", "Birchsoula", "Ashenwisa", "Cedarthoughta", "Elmendreama", "Maplespirita", "Pinethoughta", "Spruceminda", "Fernwisda",
            // Additional elegant
            "Anariel", "Bereniel", "Ciriel", "Duiliel", "Ectheliel", "Fingiel", "Galdoriel", "Huriniel", "Ingwiel", "Kelvariel",
            "Legoliel", "Mablungiel", "Nellasiel", "Oropheriel", "Pengoliel", "Quennariel", "Rodnoriel", "Saerosiel", "Turgoniel", "Ulmiel",
            // More variations
            "Aelanthia", "Baelanthia", "Caelanthia", "Daelanthia", "Eaelanthia", "Faelanthia", "Gaelanthia", "Haelanthia", "Iaelanthia", "Jaelanthia",
            "Kaelanthia", "Laelanthia", "Maelanthia", "Naelanthia", "Oaelanthia", "Paelanthia", "Qaelanthia", "Raelanthia", "Saelanthia", "Taelanthia",
            // Compound elegant
            "Silverwinda", "Goldensongia", "Crystalthoughta", "Diamondminda", "Emeraldspirita", "Sapphiresoula", "Rubyhearta", "Pearlwisdoma", "Opalvisiona", "Amethystdreama",
            // Royal-sounding
            "Highborna", "Noblekina", "Royalblooda", "Crownbearera", "Scepterholda", "Throneguarda", "Regentsona", "Princelinga", "Lordlinga", "Dukeswortha"
        ],
        surnames: [
            // Location-based (from wiki)
            "of Lorenzia", "of Rivermount", "of Feldale", "of Puddle", "of Brightwood", "of Starhollow", "of Moonvale", "of Sunpeak", "of Crystalspire", "of Diamondgate",
            // Star-themed
            "Starweaver", "Moonbinder", "Sunkeeper", "Dawnbringer", "Duskwalker", "Twilightseeker", "Nightwatcher", "Daybreaker", "Eventide", "Morningstar",
            "Starsong", "Moondance", "Sunfire", "Dawnlight", "Duskshade", "Twilightwhisper", "Nightbreeze", "Dayshine", "Evenglow", "Morningdew",
            // Light-themed
            "Lightbringer", "Radiantmorn", "Brillianteve", "Gleamingstar", "Shiningmoon", "Glowingsun", "Brightdawn", "Luminousdusk", "Sparklingnight", "Gleamingday",
            // Nature-elegant
            "Silverleaf", "Goldenwood", "Crystalstream", "Diamondpetal", "Emeraldgrove", "Sapphirebloom", "Rubyrose", "Pearlblossom", "Opalflower", "Amethystvine",
            // Ancient houses
            "Ancientblood", "Eldertree", "Firstborn", "Highblood", "Noblespirit", "Oldensoul", "Primeline", "Royalvein", "Trueline", "Wisdomkeeper",
            // Wisdom-themed
            "Lorekeeper", "Sageblood", "Wisehart", "Knowledgeseeker", "Learnedone", "Scholarblood", "Thinkerline", "Mindweaver", "Thoughtbinder", "Dreamseeker",
            // Compound elegant
            "Aelindorian", "Caelindrian", "Faelindrosian", "Gaelindorian", "Haelindrian", "Jaelindorian", "Kaelindrian", "Laelindorian", "Maelindrian", "Naelindorian",
            // Element-themed
            "Windwhisper", "Waterweave", "Firekeep", "Earthbind", "Airwalker", "Flamedancer", "Streamrunner", "Stoneshaper", "Breezeborn", "Emberheart",
            // Time-themed
            "Eternalbloom", "Agelessone", "Timelesssoul", "Centurykeeper", "Millenniumborn", "Eonwatcher", "Erawarden", "Epochkeeper", "Ageguard", "Periodseer",
            // More variations
            "Silverbranch", "Goldenbough", "Crystalbark", "Diamondleaf", "Emeraldroot", "Sapphirestem", "Rubythorn", "Pearlpetal", "Opalbloom", "Amethystflower",
            // Additional
            "Highspire", "Tallgate", "Grandholme", "Noblekeep", "Proudtower", "Ancienthall", "Elderspire", "Wisegate", "Loreholm", "Sagekeep"
        ]
    },

    // ============================================
    // MOON ELF - Mystical, nature, nocturnal
    // More wild than High Elves
    // ============================================
    "Moon Elf": {
        male: [
            // Moon-themed
            "Lunaris", "Moonwhisper", "Silvergleam", "Nightwalker", "Shadowdancer", "Twilightborn", "Duskrunner", "Stargazer", "Dreamweaver", "Mistwalker",
            "Moonbeam", "Silvermist", "Nightbreeze", "Shadowmist", "Twilightmist", "Duskshadow", "Starmist", "Dreammist", "Mistborn", "Fogwalker",
            // Nature-mystical
            "Wildthorn", "Forestshadow", "Woodwhisper", "Leafdancer", "Rootwalker", "Barkborn", "Branchweaver", "Vinecrawler", "Mossfoot", "Fernshade",
            "Owlcaller", "Wolfrunner", "Deerstalker", "Foxwhisper", "Bearclaw", "Hawkeye", "Ravenfeather", "Crowsong", "Serpentscale", "Spiderweb",
            // Mystical names
            "Mystral", "Arcanus", "Ethereal", "Phantos", "Spectra", "Voidwalker", "Shadowbind", "Darkweave", "Nightshade", "Gloomheart",
            "Shroudborn", "Veilwalker", "Cloakdancer", "Mantlekeeper", "Hoodwearer", "Maskbearer", "Cowlborn", "Wrapwalker", "Coverseeker", "Hidebound",
            // Soft mystical
            "Silvan", "Sylvan", "Verdant", "Viridian", "Emeran", "Jaden", "Forestar", "Groveling", "Thicketor", "Copseborn",
            "Gladewalker", "Clearingborn", "Meadowstep", "Fieldrunner", "Plainsdancer", "Valleywalker", "Hillclimber", "Mountainseer", "Peakwatcher", "Summitborn",
            // Wild names
            "Wildrunner", "Freespirit", "Untamed", "Feral", "Savage", "Primal", "Rawborn", "Pureblood", "Truewild", "Naturalborn",
            "Huntmaster", "Trackerborn", "Stalkerblood", "Predator", "Ambusher", "Lurkerborn", "Sneakfoot", "Silentone", "Quietstep", "Hushedborn",
            // Additional mystical
            "Nyxen", "Noctis", "Umbral", "Tenebris", "Obscura", "Caligin", "Murken", "Dimling", "Shadeling", "Darklyn",
            "Gloaming", "Crepuscular", "Vesper", "Eventide", "Nightfall", "Sundown", "Duskfall", "Twilightfall", "Darkfall", "Shadowfall",
            // More moon-themed
            "Crescentborn", "Waninglight", "Waxingshade", "Fullmoon", "Newmoon", "Halfmoon", "Quartermoon", "Gibbousson", "Eclipseborn", "Lunarson",
            "Tidalborn", "Wavecaller", "Seapuller", "Oceandancer", "Currentrunner", "Streamwalker", "Riverborn", "Lakekeeper", "Pondwatcher", "Poolseeker",
            // Compound wild
            "Thornwalker", "Briarborn", "Nettlefoot", "Thistleheart", "Burdockson", "Bramblekeeper", "Hedgewalker", "Bushborn", "Shrubfoot", "Weedwhisper",
            // Animal-themed
            "Wolfborn", "Bearson", "Deerfoot", "Foxheart", "Owleye", "Hawkwing", "Eagletalon", "Falconfeather", "Ravenbeak", "Crowclaw"
        ],
        female: [
            // Moon-themed
            "Lunara", "Moonwhispera", "Silvergleama", "Nightwalkera", "Shadowdancera", "Twilightborna", "Duskrunnera", "Stargazera", "Dreamweavera", "Mistwalkera",
            "Moonbeama", "Silvermista", "Nightbreeza", "Shadowmista", "Twilightmista", "Duskshadowa", "Starmista", "Dreammista", "Mistborna", "Fogwalkera",
            // Nature-mystical
            "Wildthorna", "Forestshadowa", "Woodwhispera", "Leafdancera", "Rootwalkera", "Barkborna", "Branchweavera", "Vinecrawlera", "Mossfoota", "Fernshadea",
            "Owlcallera", "Wolfrunnera", "Deerstalkera", "Foxwhispera", "Bearclawa", "Hawkeyea", "Ravenfeathera", "Crowsonga", "Serpentscalea", "Spiderweba",
            // Mystical names
            "Mystrala", "Arcana", "Ethereala", "Phantosa", "Spectrala", "Voidwalkera", "Shadowbinda", "Darkweavea", "Nightshadea", "Gloomhearta",
            "Shroudborna", "Veilwalkera", "Cloakdancera", "Mantlekeepera", "Hoodwearera", "Maskbearera", "Cowlborna", "Wrapwalkera", "Coverseekera", "Hidebounda",
            // Soft mystical
            "Silvana", "Sylvana", "Verdanta", "Viridiana", "Emerana", "Jadena", "Forestara", "Grovela", "Thicketora", "Copseborna",
            "Gladewalkera", "Clearingborna", "Meadowstepa", "Fieldrunnera", "Plainsdancera", "Valleywalkera", "Hillclimbera", "Mountainseera", "Peakwatchera", "Summitborna",
            // Wild names
            "Wildrunnera", "Freespirita", "Untameda", "Ferala", "Savagea", "Primala", "Rawborna", "Pureblooda", "Truewilda", "Naturalborna",
            "Huntmistress", "Trackerborna", "Stalkerblooda", "Predatora", "Ambushera", "Lurkerborna", "Sneakfoota", "Silentona", "Quietstepa", "Hushedborna",
            // Additional mystical
            "Nyxena", "Noctisa", "Umbrala", "Tenebrisa", "Obscuraa", "Caligina", "Murkena", "Dimlinga", "Shadelinga", "Darklyna",
            "Gloaminga", "Crepusculara", "Vespera", "Eventida", "Nightfalla", "Sundowna", "Duskfalla", "Twilightfalla", "Darkfalla", "Shadowfalla",
            // More moon-themed
            "Crescentborna", "Waninglighta", "Waxingshadea", "Fullmoona", "Newmoona", "Halfmoona", "Quartermoona", "Gibboussa", "Eclipseborna", "Lunara",
            "Tidalborna", "Wavecallera", "Seapullera", "Oceandancera", "Currentrunnera", "Streamwalkera", "Riverborna", "Lakekeepera", "Pondwatchera", "Poolseekera",
            // Compound wild
            "Thornwalkera", "Briarborna", "Nettlefoota", "Thistlehearta", "Burdocka", "Bramblekeepera", "Hedgewalkera", "Bushborna", "Shrubfoota", "Weedwhispera",
            // Animal-themed
            "Wolfborna", "Beara", "Deerfoota", "Foxhearta", "Owleyea", "Hawkwinga", "Eagletalona", "Falconfeathera", "Ravenbeaka", "Crowclawa"
        ],
        surnames: [
            // Moon-themed
            "Moonwhisper", "Silvermist", "Nightwalker", "Shadowdancer", "Twilightborn", "Duskrunner", "Stargazer", "Dreamweaver", "Mistwalker", "Fogborn",
            "Moonbeam", "Silvergleam", "Nightbreeze", "Shadowmist", "Twilightmist", "Duskshadow", "Starmist", "Dreammist", "Mistborn", "Fogwalker",
            // Nature-mystical
            "Wildthorn", "Forestshadow", "Woodwhisper", "Leafdancer", "Rootwalker", "Barkborn", "Branchweaver", "Vinecrawler", "Mossfoot", "Fernshade",
            "of the Wild", "of the Forest", "of the Wood", "of the Grove", "of the Thicket", "of the Copse", "of the Glade", "of the Clearing", "of the Meadow", "of the Field",
            // Animal clans
            "Owlclan", "Wolfpack", "Deerherd", "Foxden", "Beartribe", "Hawknest", "Ravenflock", "Crowmurder", "Serpentcoil", "Spiderweb",
            "Owlfeather", "Wolfclaw", "Deerhorn", "Foxtail", "Bearpaw", "Hawktalon", "Ravenwing", "Crowbeak", "Serpentfang", "Spiderleg",
            // Mystical clans
            "Voidwalker", "Shadowbinder", "Darkweaver", "Nightshade", "Gloomheart", "Shroudborn", "Veilwalker", "Cloakdancer", "Mantlekeeper", "Mistborn",
            "Etherealkin", "Phantomblood", "Spectralline", "Ghostwalker", "Spiritdancer", "Soulweaver", "Mindwalker", "Thoughtbinder", "Dreamkeeper", "Visionseeker",
            // Wild clans
            "Wildrunner", "Freespirit", "Untamed", "Feralborn", "Savagekin", "Primalblood", "Rawborn", "Pureblood", "Truewild", "Naturalborn",
            "Huntingmoon", "Trackerpath", "Stalkerway", "Predatorline", "Ambushkin", "Lurkerblood", "Sneakfoot", "Silentone", "Quietstep", "Hushedborn",
            // Time-themed
            "Gloaming", "Crepuscular", "Vespertine", "Eventide", "Nightfall", "Sundown", "Duskfall", "Twilightfall", "Darkfall", "Shadowfall",
            // Lunar phases
            "Crescentmoon", "Waningmoon", "Waxingmoon", "Fullmoon", "Newmoon", "Halfmoon", "Quartermoon", "Gibbousmoon", "Eclipsemoon", "Bloodmoon",
            // Additional
            "Thornweaver", "Briarborn", "Nettlefoot", "Thistleheart", "Burdockkin", "Bramblekeeper", "Hedgewalker", "Bushborn", "Shrubfoot", "Weedwhisper"
        ]
    },

    // ============================================
    // ORC - Harsh, guttural, brutal
    // Short, powerful sounds
    // ============================================
    "Orc": {
        male: [
            // Harsh guttural
            "Grok", "Krog", "Drog", "Brog", "Throg", "Vrog", "Zrog", "Grak", "Krak", "Drak",
            "Brak", "Thrak", "Vrak", "Zrak", "Gruk", "Kruk", "Druk", "Bruk", "Thruk", "Vruk",
            "Zruk", "Grum", "Krum", "Drum", "Brum", "Thrum", "Vrum", "Zrum", "Grag", "Krag",
            // War names
            "Warboss", "Skullcrusher", "Bonesnapper", "Fleshripper", "Blooddrinker", "Gorekiller", "Deathbringer", "Doomhammer", "Ragefist", "Ironjaw",
            "Steelfang", "Blacktusk", "Redeye", "Scarface", "Battleborn", "Warmaker", "Killmaster", "Slaughterer", "Ravager", "Destroyer",
            // Brutal names
            "Gorth", "Korth", "Dorth", "Borth", "Thorth", "Vorth", "Zorth", "Gorsh", "Korsh", "Dorsh",
            "Borsh", "Thorsh", "Vorsh", "Zorsh", "Gurg", "Kurg", "Durg", "Burg", "Thurg", "Vurg",
            "Zurg", "Gorn", "Korn", "Dorn", "Born", "Thorn", "Vorn", "Zorn", "Garm", "Karm",
            // Beast names
            "Fangbiter", "Clawripper", "Hornbreaker", "Tuskgorer", "Hidetearer", "Bonegnawer", "Meatcrusher", "Bloodsucker", "Marrowdrinker", "Sineweater",
            "Wolfkiller", "Bearbane", "Boarslayer", "Elkbreaker", "Stagripper", "Lionkiller", "Tigerbane", "Serpentslayer", "Dragonbreaker", "Wyrmripper",
            // Dark names
            "Shadowfang", "Nightblade", "Darkskull", "Blackbone", "Grimtusk", "Dreadfang", "Terrorclaw", "Fearbringer", "Paindrinker", "Agonybringer",
            "Hatespawn", "Ragechild", "Furybringer", "Wrathborn", "Vengeson", "Malichild", "Cruelson", "Savageborn", "Brutalchild", "Viciousson",
            // Simple brutal
            "Ug", "Og", "Ag", "Ig", "Eg", "Uk", "Ok", "Ak", "Ik", "Ek",
            "Urg", "Org", "Arg", "Irg", "Erg", "Urk", "Ork", "Ark", "Irk", "Erk",
            "Ugg", "Ogg", "Agg", "Igg", "Egg", "Ukk", "Okk", "Akk", "Ikk", "Ekk",
            // Compound brutal
            "Grimblade", "Ironskull", "Steelclaw", "Blackfang", "Redblade", "Bloodaxe", "Deathclaw", "Doomfang", "Rageskull", "Warblade",
            "Skullsplitter", "Bonesmasher", "Fleshrender", "Bloodspiller", "Gorehound", "Deathdealer", "Doommaker", "Rageborn", "Warmonger", "Battlemaster",
            // More variations
            "Grazh", "Krazh", "Drazh", "Brazh", "Thrazh", "Vrazh", "Zrazh", "Gruzh", "Kruzh", "Druzh",
            "Goruk", "Koruk", "Doruk", "Boruk", "Thoruk", "Voruk", "Zoruk", "Garuk", "Karuk", "Daruk",
            // Additional
            "Nazgul", "Azog", "Bolg", "Gorbag", "Shagrat", "Ugluk", "Lurtz", "Gothmog", "Grishnakh", "Muzgash"
        ],
        female: [
            // Harsh feminine
            "Groka", "Kroga", "Droga", "Broga", "Throga", "Vroga", "Zroga", "Graka", "Kraka", "Draka",
            "Braka", "Thraka", "Vraka", "Zraka", "Gruka", "Kruka", "Druka", "Bruka", "Thruka", "Vruka",
            "Zruka", "Gruma", "Kruma", "Druma", "Bruma", "Thruma", "Vruma", "Zruma", "Graga", "Kraga",
            // War names
            "Warmaiden", "Skullcrushera", "Bonesnappera", "Fleshrippera", "Blooddrinkera", "Gorekillera", "Deathbringera", "Doomhammera", "Ragefista", "Ironjawa",
            "Steelfanga", "Blacktuska", "Redeyea", "Scarfacea", "Battleborna", "Warmakera", "Killmistress", "Slaughtera", "Ravagera", "Destroyera",
            // Brutal names
            "Gortha", "Kortha", "Dortha", "Bortha", "Thortha", "Vortha", "Zortha", "Gorsha", "Korsha", "Dorsha",
            "Borsha", "Thorsha", "Vorsha", "Zorsha", "Gurga", "Kurga", "Durga", "Burga", "Thurga", "Vurga",
            "Zurga", "Gorna", "Korna", "Dorna", "Borna", "Thorna", "Vorna", "Zorna", "Garma", "Karma",
            // Beast names
            "Fangbitera", "Clawrippera", "Hornbreakera", "Tuskgorera", "Hidetearera", "Bonegnawera", "Meatcrushera", "Bloodsuckera", "Marrowdrinkera", "Sineweatera",
            "Wolfkillera", "Bearbanea", "Boarslayera", "Elkbreakera", "Stagrippera", "Lionkillera", "Tigerbanea", "Serpentslayera", "Dragonbreakera", "Wyrmrippera",
            // Dark names
            "Shadowfanga", "Nightbladea", "Darkskulla", "Blackbonea", "Grimtuska", "Dreadfanga", "Terrorclawa", "Fearbringera", "Paindrinkera", "Agonybringera",
            "Hatespawna", "Ragechilda", "Furybringera", "Wrathborna", "Vengedaughter", "Malichilda", "Crueldaughter", "Savageborna", "Brutalchilda", "Viciousdaughter",
            // Simple brutal
            "Uga", "Oga", "Aga", "Iga", "Ega", "Uka", "Oka", "Aka", "Ika", "Eka",
            "Urga", "Orga", "Arga", "Irga", "Erga", "Urka", "Orka", "Arka", "Irka", "Erka",
            "Ugga", "Ogga", "Agga", "Igga", "Egga", "Ukka", "Okka", "Akka", "Ikka", "Ekka",
            // Compound brutal
            "Grimbladea", "Ironskulla", "Steelclawa", "Blackfanga", "Redbladea", "Bloodaxea", "Deathclawa", "Doomfanga", "Rageskulla", "Warbladea",
            "Skullsplittera", "Bonesmashera", "Fleshrendera", "Bloodspillera", "Gorehounda", "Deathdealera", "Doommakera", "Rageborna", "Warmongera", "Battlemistress",
            // More variations
            "Grazha", "Krazha", "Drazha", "Brazha", "Thrazha", "Vrazha", "Zrazha", "Gruzha", "Kruzha", "Druzha",
            "Goruka", "Koruka", "Doruka", "Boruka", "Thoruka", "Voruka", "Zoruka", "Garuka", "Karuka", "Daruka",
            // Additional
            "Shelob", "Ungoliant", "Morwen", "Thuringwethil", "Carcharoth", "Draugluin", "Tevildo", "Sauroniel", "Melkoriel", "Morgothiel"
        ],
        surnames: [
            // Clan names
            "Skullcrusher", "Bonesnapper", "Fleshripper", "Blooddrinker", "Gorekiller", "Deathbringer", "Doomhammer", "Ragefist", "Ironjaw", "Steelfang",
            "Blacktusk", "Redeye", "Scarface", "Battleborn", "Warmaker", "Killmaster", "Slaughterer", "Ravager", "Destroyer", "Conqueror",
            // Beast clans
            "Wolfclan", "Beartribe", "Boarhorde", "Elkherd", "Stagherd", "Lionclan", "Tigertribe", "Serpenthorde", "Dragonclan", "Wyrmtribe",
            "Fangclan", "Clawtribe", "Hornhorde", "Tuskherd", "Hideclan", "Bonetribe", "Meathorde", "Bloodclan", "Marrowtribe", "Sinewhorde",
            // Dark clans
            "Shadowfang", "Nightblade", "Darkskull", "Blackbone", "Grimtusk", "Dreadfang", "Terrorclaw", "Fearbringer", "Paindrinker", "Agonybringer",
            "Hatespawn", "Ragechild", "Furybringer", "Wrathborn", "Vengeclan", "Malicetribe", "Cruelhorde", "Savageclan", "Brutaltribe", "Vicioushorde",
            // Battle clans
            "Warborn", "Battleclan", "Fighterhorde", "Warriortribe", "Combatclan", "Strifehorde", "Conflicttribe", "Clashclan", "Skirmishhorde", "Raidtribe",
            "Bladeborn", "Axeclan", "Spearhorde", "Macetribe", "Hammerclan", "Swordhorde", "Clubtribe", "Flailclan", "Morningstarhorde", "Haborktribe",
            // Location clans
            "of the Wastelands", "of the Badlands", "of the Darklands", "of the Blightlands", "of the Deadlands", "of the Ashlands", "of the Firelands", "of the Bloodlands", "of the Bonefields", "of the Skullpits",
            // Simple clan names
            "Grokson", "Krogson", "Drogson", "Brogson", "Throgson", "Vrogson", "Zrogson", "Grakson", "Krakson", "Drakson",
            "Gorthson", "Korthson", "Dorthson", "Borthson", "Thorthson", "Vorthson", "Zorthson", "Gorshson", "Korshson", "Dorshson",
            // More clans
            "Ironfist", "Steelskull", "Bronzeclaw", "Coppertusk", "Leadeye", "Tinbone", "Rustfang", "Scrapjaw", "Junkclaw", "Trashborn",
            "Mudblood", "Dirtborn", "Dustclan", "Ashborn", "Sootclan", "Charborn", "Cinderclan", "Emberborn", "Flameclan", "Fireborn"
        ]
    },

    // ============================================
    // TROLL - Simple, nature, primitive
    // Easy to pronounce, nature-themed
    // ============================================
    "Troll": {
        male: [
            // Simple nature
            "Moss", "Stone", "Rock", "Boulder", "Pebble", "Gravel", "Sand", "Mud", "Clay", "Dirt",
            "Oak", "Pine", "Birch", "Ash", "Elm", "Willow", "Alder", "Hazel", "Rowan", "Holly",
            "River", "Lake", "Pond", "Stream", "Brook", "Creek", "Spring", "Well", "Pool", "Marsh",
            // Animal names
            "Bear", "Wolf", "Deer", "Elk", "Moose", "Boar", "Fox", "Badger", "Otter", "Beaver",
            "Owl", "Hawk", "Eagle", "Raven", "Crow", "Heron", "Crane", "Stork", "Swan", "Goose",
            "Frog", "Toad", "Newt", "Salamander", "Lizard", "Snake", "Turtle", "Tortoise", "Snail", "Slug",
            // Weather names
            "Thunder", "Lightning", "Storm", "Rain", "Snow", "Hail", "Sleet", "Frost", "Ice", "Mist",
            "Cloud", "Wind", "Gale", "Breeze", "Gust", "Squall", "Tempest", "Hurricane", "Tornado", "Cyclone",
            // Simple grunts
            "Grug", "Thud", "Bump", "Lump", "Clump", "Stump", "Trunk", "Chunk", "Hunk", "Bulk",
            "Grunt", "Groan", "Growl", "Snarl", "Rumble", "Tumble", "Stumble", "Mumble", "Grumble", "Bumble",
            // Nature compound
            "Mossy", "Stony", "Rocky", "Muddy", "Sandy", "Leafy", "Woody", "Thorny", "Bushy", "Grassy",
            "Foggy", "Misty", "Rainy", "Snowy", "Frosty", "Icy", "Windy", "Stormy", "Cloudy", "Sunny",
            // Cave names
            "Cavern", "Grotto", "Den", "Lair", "Hollow", "Burrow", "Hole", "Pit", "Crack", "Crevice",
            "Dark", "Deep", "Damp", "Cold", "Wet", "Black", "Grey", "Brown", "Green", "Blue",
            // Food names
            "Berry", "Nut", "Root", "Bark", "Leaf", "Flower", "Fruit", "Seed", "Grain", "Grass",
            "Mushroom", "Fungus", "Moss", "Lichen", "Fern", "Weed", "Herb", "Plant", "Bush", "Tree",
            // Mountain names
            "Peak", "Summit", "Ridge", "Cliff", "Crag", "Bluff", "Ledge", "Slope", "Hill", "Mound",
            "Valley", "Gorge", "Canyon", "Ravine", "Chasm", "Abyss", "Pit", "Hole", "Crater", "Basin",
            // More simple
            "Big", "Small", "Tall", "Short", "Wide", "Thick", "Thin", "Fat", "Lean", "Strong",
            "Old", "Young", "Fast", "Slow", "Loud", "Quiet", "Bright", "Dim", "Warm", "Cool"
        ],
        female: [
            // Simple nature
            "Mossa", "Stona", "Rocka", "Bouldera", "Pebbla", "Gravela", "Sanda", "Muda", "Claya", "Dirta",
            "Oaka", "Pina", "Bircha", "Asha", "Elma", "Willowa", "Aldera", "Hazela", "Rowana", "Hollya",
            "Rivera", "Laka", "Ponda", "Streama", "Brooka", "Creeka", "Springa", "Wella", "Poola", "Marsha",
            // Animal names
            "Beara", "Wolfa", "Deera", "Elka", "Moosa", "Boara", "Foxa", "Badgera", "Ottera", "Beavera",
            "Owla", "Hawka", "Eagla", "Ravena", "Crowa", "Herona", "Crana", "Storka", "Swana", "Goosa",
            "Froga", "Toada", "Newta", "Salamandera", "Lizarda", "Snaka", "Turtla", "Tortoisa", "Snaila", "Sluga",
            // Weather names
            "Thundera", "Lightninga", "Storma", "Raina", "Snowa", "Haila", "Sleeta", "Frosta", "Ica", "Mista",
            "Clouda", "Winda", "Gala", "Breeza", "Gusta", "Squalla", "Tempesta", "Hurricana", "Tornada", "Cyclona",
            // Simple grunts
            "Gruga", "Thuda", "Bumpa", "Lumpa", "Clumpa", "Stumpa", "Trunka", "Chunka", "Hunka", "Bulka",
            "Grunta", "Groana", "Growla", "Snarla", "Rumbla", "Tumbla", "Stumbla", "Mumbla", "Grumbla", "Bumbla",
            // Nature compound
            "Mossya", "Stonya", "Rockya", "Muddya", "Sandya", "Leafya", "Woodya", "Thornya", "Bushya", "Grassya",
            "Foggya", "Mistya", "Rainya", "Snowya", "Frostya", "Icya", "Windya", "Stormya", "Cloudya", "Sunnya",
            // Cave names
            "Caverna", "Grotta", "Denna", "Laira", "Hollowa", "Burrowa", "Hola", "Pita", "Cracka", "Crevicea",
            "Darka", "Deepa", "Dampa", "Colda", "Weta", "Blacka", "Greya", "Browna", "Greena", "Bluea",
            // Food names
            "Berrya", "Nuta", "Roota", "Barka", "Leafa", "Flowera", "Fruita", "Seeda", "Graina", "Grassa",
            "Mushrooma", "Fungusa", "Mossya", "Lichena", "Ferna", "Weeda", "Herba", "Planta", "Busha", "Treea",
            // Mountain names
            "Peaka", "Summita", "Ridgea", "Cliffa", "Craga", "Bluffa", "Ledgea", "Slopea", "Hilla", "Mounda",
            "Valleya", "Gorgea", "Canyona", "Ravinea", "Chasma", "Abyssa", "Pitta", "Holea", "Cratera", "Basina",
            // More simple
            "Bigga", "Smalla", "Talla", "Shorta", "Wida", "Thicka", "Thina", "Fatta", "Leana", "Stronga",
            "Olda", "Younga", "Fasta", "Slowa", "Louda", "Quieta", "Brighta", "Dimma", "Warma", "Coola"
        ],
        surnames: [
            // Nature clans
            "of the Mountain", "of the Forest", "of the River", "of the Lake", "of the Cave", "of the Swamp", "of the Marsh", "of the Bog", "of the Moor", "of the Heath",
            "of the Valley", "of the Gorge", "of the Canyon", "of the Ravine", "of the Cliff", "of the Crag", "of the Bluff", "of the Ledge", "of the Slope", "of the Hill",
            // Stone clans
            "Stoneback", "Rockhead", "Boulderfist", "Pebbletooth", "Gravelskin", "Sandfoot", "Mudblood", "Clayhand", "Dirtborn", "Earthchild",
            "Granitehide", "Marblebone", "Obsidianfang", "Basaltheart", "Slateskull", "Flinteye", "Quartzclaw", "Ironstone", "Copperrock", "Silverstone",
            // Tree clans
            "Oakbark", "Pinecone", "Birchleaf", "Ashbranch", "Elmroot", "Willowsap", "Alderseed", "Hazelnut", "Rowanberry", "Hollyleaf",
            "Treestump", "Logroller", "Branchbreaker", "Twigsnapper", "Leafeater", "Barkchewer", "Rootdigger", "Sapsucker", "Knothead", "Grainwood",
            // Animal clans
            "Bearclaw", "Wolffang", "Deerhorn", "Elkhoof", "Mooseantler", "Boartusk", "Foxtail", "Badgerpaw", "Otterfur", "Beavertail",
            "Owlfeather", "Hawkeye", "Eaglewing", "Ravenblack", "Crowbeak", "Heronleg", "Cranebill", "Storkfoot", "Swanneck", "Goosedown",
            // Weather clans
            "Thunderborn", "Lightningchild", "Stormson", "Rainwalker", "Snowfoot", "Frostbite", "Iceheart", "Mistwalker", "Fogborn", "Cloudchild",
            "Windrunner", "Galeforce", "Breezeborn", "Gusty", "Squallborn", "Tempestchild", "Hurricaneson", "Tornadowalker", "Cycloneborn", "Weatherworn",
            // Cave clans
            "Cavedweller", "Grottoliver", "Denholder", "Lairkeeper", "Hollowborn", "Burrowdigger", "Holemaker", "Pitdweller", "Crackwalker", "Crevicehider",
            "Darkdweller", "Deepborn", "Dampfoot", "Coldblood", "Wetback", "Blackhide", "Greyskin", "Browncoat", "Greenfoot", "Blueeye",
            // Simple clans
            "Bigfoot", "Smalleye", "Talltree", "Shortleg", "Widemouth", "Thickskull", "Thinskin", "Fatbelly", "Leanmeat", "Strongarm",
            "Oldbone", "Youngblood", "Fastfoot", "Slowmind", "Loudvoice", "Quietstep", "Brighteye", "Dimwit", "Warmheart", "Coolhead"
        ]
    }
};

// ============================================
// Name Generator Functions
// ============================================

function generateNPCName(race, gender) {
    const raceData = NPC_NAMES[race];
    if (!raceData) {
        console.error('Unknown race:', race);
        return 'Unknown';
    }

    const firstNames = gender === 'female' ? raceData.female : raceData.male;
    const surnames = raceData.surnames;

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const surname = surnames[Math.floor(Math.random() * surnames.length)];

    return `${firstName} ${surname}`;
}

function getAvailableRaces() {
    return Object.keys(NPC_NAMES);
}
