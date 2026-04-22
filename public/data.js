// ═══════════════════════════════════════════════════════════════════
//  Proto-Indo-European Migration Data
//  Based on: Laura Spinney, "Proto: How One Ancient Language Went Global"
//  Drawing on archaeogenetics (Reich, Haak, Mathieson et al.) and
//  comparative linguistics (Anthony, Mallory, Fortson, Ringe).
//
//  Coordinate system: [latitude, longitude]
//  Radii in kilometres — converted to metres in app.js (* 1000)
//  Years: negative = BCE, positive = CE
// ═══════════════════════════════════════════════════════════════════

const PIE_DATA = {

  startYear: -4000,
  endYear:    500,

  // ── Language branches ────────────────────────────────────────────
  // Each entry: { name, color (fill), textColor }
  branches: {
    homeland:      { name: 'PIE Homeland',   color: '#E8A020', textColor: '#000' },
    anatolian:     { name: 'Anatolian',      color: '#A0522D', textColor: '#fff' },
    tocharian:     { name: 'Tocharian',      color: '#9B59B6', textColor: '#fff' },
    hellenic:      { name: 'Hellenic',       color: '#2E86C1', textColor: '#fff' },
    italic:        { name: 'Italic / Latin', color: '#C0392B', textColor: '#fff' },
    celtic:        { name: 'Celtic',         color: '#1E8449', textColor: '#fff' },
    germanic:      { name: 'Germanic',       color: '#2471A3', textColor: '#fff' },
    baltic_slavic: { name: 'Baltic-Slavic',  color: '#17A589', textColor: '#fff' },
    indo_iranian:  { name: 'Indo-Iranian',   color: '#D4AC0D', textColor: '#000' },
    armenian:      { name: 'Armenian',       color: '#CA6F1E', textColor: '#fff' },
    albanian:      { name: 'Albanian',       color: '#6D7E30', textColor: '#fff' },
  },

  // ── Genetic ancestry notes (displayed in info panel) ─────────────
  genetics: {
    homeland:
      'Ancient DNA: Yamnaya ancestry is a ~50/50 mix of Eastern Hunter-Gatherer (EHG) and Caucasus Hunter-Gatherer (CHG). This profile spread dramatically across Eurasia after 3000 BCE, replacing up to 75% of local ancestry in parts of Europe.',
    anatolian:
      'Anatolian peoples show a profile distinct from Yamnaya — high Anatolian Neolithic farmer ancestry with little to no steppe admixture. This supports the steppe (not Anatolian) origin for most IE branches.',
    tocharian:
      'Afanasievo skeletons are genetically near-identical to Yamnaya, confirming a steppe origin. The Tarim Basin mummies (light hair, light eyes) show EHG/WHG ancestry consistent with Afanasievo descent.',
    hellenic:
      'Mycenaean Greeks show ~10-20% steppe ancestry (via Corded Ware) mixed with Minoan-like Aegean farmer ancestry. Classical Greeks likely inherited a similar profile.',
    italic:
      'Bell Beaker individuals in Italy show ~40-60% steppe ancestry. Later Romans reflect multiple waves of admixture as their empire expanded.',
    celtic:
      'Bell Beaker expansion into Britain replaced ~90% of local Neolithic ancestry. Modern Irish and Welsh carry the highest proportions of Bell Beaker-derived ancestry in Europe.',
    germanic:
      'Corded Ware individuals in Scandinavia and northern Germany show ~70-75% Yamnaya ancestry. Early Germanic speakers descend primarily from this wave.',
    baltic_slavic:
      'Baltic and Slavic populations carry high Corded Ware ancestry (~60-70%). Slavic expansion in late antiquity spread this genetic profile across Eastern Europe.',
    indo_iranian:
      'Sintashta and Andronovo individuals show ~80% steppe ancestry (Yamnaya-related). Ancient South Asian DNA shows increasing steppe admixture from ~2000 BCE onward, confirming the genetic reality of Indo-Aryan migration.',
    armenian:
      'Armenians show a mix of Caucasus Hunter-Gatherer (CHG), Anatolian Neolithic, and some steppe ancestry — reflecting their position at the crossroads of multiple migrations.',
    albanian:
      'Albanian genetic profile is complex — Balkan Iron Age ancestry with some steppe admixture. Albanian is often considered one of the most isolated surviving IE branches.',
  },

  // ── Cultures / peoples ──────────────────────────────────────────
  // Each culture: {
  //   id, name, branch, description, startYear, endYear,
  //   phases: [{ year, center: [lat, lon], radius (km) }]
  // }
  // Phases are linearly interpolated by app.js between keyframes.
  cultures: [

    // ── PIE Homeland ──────────────────────────────────────────────

    {
      id: 'yamnaya',
      name: 'Yamnaya Culture',
      branch: 'homeland',
      description: 'The primary homeland of Proto-Indo-European speakers. Mobile pastoralists who herded cattle and horses across the vast Pontic-Caspian steppe ("Pit-Grave" culture). Yamnaya people had a distinctive genetic profile — a mix of Eastern Hunter-Gatherer (EHG) and Caucasus Hunter-Gatherer (CHG) ancestry — that spread across Eurasia more rapidly than any previous population. They used wagons (earliest known evidence of wheeled transport), practiced large-scale animal herding, and buried their dead in kurgans (burial mounds) under earthen barrows.',
      startYear: -3500,
      endYear: -2100,
      phases: [
        { year: -3500, center: [47.5, 38.0], radius: 600 },
        { year: -3200, center: [47.5, 40.0], radius: 780 },
        { year: -2900, center: [47.5, 42.0], radius: 820 },
        { year: -2500, center: [47.5, 44.0], radius: 750 },
        { year: -2200, center: [47.5, 44.0], radius: 550 },
        { year: -2100, center: [47.5, 43.0], radius: 350 },
      ],
    },

    {
      id: 'sredny_stog',
      name: 'Sredny Stog / Khvalynsk',
      branch: 'homeland',
      description: 'Pre-Yamnaya steppe cultures that represent the earliest stages of Proto-Indo-European formation. The Sredny Stog culture (Ukraine, 4500-3500 BCE) already showed early horse domestication and contacts with the farming populations to the west. The Khvalynsk culture (Volga steppe) was another ancestral component. These cultures were the crucible from which Yamnaya emerged.',
      startYear: -4500,
      endYear: -3500,
      phases: [
        { year: -4500, center: [48.0, 36.0], radius: 400 },
        { year: -4000, center: [48.0, 38.0], radius: 500 },
        { year: -3500, center: [47.5, 40.0], radius: 450 },
      ],
    },

    // ── Anatolian Branch ──────────────────────────────────────────

    {
      id: 'hittites',
      name: 'Hittite Empire (Anatolian)',
      branch: 'anatolian',
      description: 'The Anatolian branch — the first to split from Proto-Indo-European — gave rise to Hittite, Luwian, Lydian, Lycian, and related languages. The Hittite Empire (Old Kingdom ~1700 BCE; Imperial period ~1400-1180 BCE) was a major power rivaling Egypt. Hittite cuneiform texts preserve the oldest directly attested Indo-European language. Whether Anatolians arrived from the steppe or represent an in situ development remains debated, but most geneticists now favor a steppe influx. The empire collapsed around 1180 BCE during the Bronze Age Collapse.',
      startYear: -2500,
      endYear: -1000,
      phases: [
        { year: -2500, center: [39.5, 33.0], radius: 180 },
        { year: -2000, center: [39.5, 34.0], radius: 250 },
        { year: -1700, center: [39.5, 33.5], radius: 380 },
        { year: -1450, center: [39.0, 34.0], radius: 520 },
        { year: -1300, center: [39.0, 34.0], radius: 550 },
        { year: -1180, center: [39.0, 34.5], radius: 480 },
        { year: -1000, center: [39.0, 33.0], radius: 200 },
      ],
    },

    // ── Tocharian Branch ──────────────────────────────────────────

    {
      id: 'afanasievo',
      name: 'Afanasievo Culture',
      branch: 'tocharian',
      description: 'An early eastern branch of the PIE expansion, genetically near-identical to Yamnaya — remarkable given the ~3,000 km distance from the Pontic steppe to the Altai Mountains and Minusinsk Basin. The Afanasievo people are the most plausible ancestors of the Tocharians. Their migration eastward (c. 3300 BCE) predates the westward Corded Ware expansion and represents one of the longest known prehistoric steppe migrations.',
      startYear: -3400,
      endYear: -2400,
      phases: [
        { year: -3400, center: [52.0, 87.0], radius: 220 },
        { year: -3000, center: [52.0, 89.0], radius: 340 },
        { year: -2700, center: [52.0, 90.5], radius: 400 },
        { year: -2400, center: [51.5, 89.0], radius: 320 },
      ],
    },

    {
      id: 'tocharian',
      name: 'Tocharians (Tarim Basin)',
      branch: 'tocharian',
      description: 'Among the most geographically distant and linguistically isolated of all Indo-European peoples. Tocharian A and B texts (5th-8th century CE) were discovered in oasis cities of the Tarim Basin (modern Xinjiang). Their language shows features linking it to early PIE — paradoxically, the most isolated branch retained archaic features lost elsewhere. Their mummies (preserved by desert conditions), some with light hair and Western European features, astonished ancient Chinese observers. Tocharian civilization vanished after Uyghur Turkic expansion in the 9th century CE.',
      startYear: -2000,
      endYear: 900,
      phases: [
        { year: -2000, center: [41.5, 82.0], radius: 180 },
        { year: -1500, center: [41.2, 83.0], radius: 280 },
        { year: -1000, center: [41.0, 83.5], radius: 350 },
        { year: -500,  center: [41.0, 84.0], radius: 380 },
        { year:    0,  center: [41.0, 85.0], radius: 400 },
        { year:  500,  center: [41.0, 84.5], radius: 370 },
        { year:  900,  center: [41.0, 84.0], radius: 220 },
      ],
    },

    // ── European Branches (via Corded Ware / Bell Beaker) ─────────

    {
      id: 'corded_ware',
      name: 'Corded Ware Culture',
      branch: 'homeland',
      description: 'Also called the Single Grave or Battle Axe culture. One of the most consequential migrations in human history: Yamnaya-related peoples swept across a vast arc of northern and central Europe around 2900-2400 BCE, replacing up to 75% of the pre-existing Neolithic farmer ancestry. Named for cord-decorated pottery. They likely spoke early dialects ancestral to Germanic, Baltic, Slavic, and possibly Celtic. The speed and scale of this replacement — accomplished without writing, metals (initially), or large-scale political organization — reflects highly mobile pastoralism on horseback.',
      startYear: -2900,
      endYear: -2350,
      phases: [
        { year: -2900, center: [52.5, 20.0], radius: 380 },
        { year: -2700, center: [53.0, 16.0], radius: 660 },
        { year: -2500, center: [54.0, 14.0], radius: 900 },
        { year: -2400, center: [55.0, 13.0], radius: 920 },
        { year: -2350, center: [55.0, 14.0], radius: 850 },
      ],
    },

    {
      id: 'bell_beaker',
      name: 'Bell Beaker Culture',
      branch: 'celtic',
      description: 'Spread across Western Europe in a complex process involving both cultural diffusion and large-scale migration. In Western Europe, Bell Beaker expansion involved massive genetic replacement — the steppe-derived Corded Ware population largely supplanted the pre-existing Neolithic farmers. In Britain, over 90% of the Neolithic gene pool was replaced within a few centuries. Bell Beaker people are ancestral to Celtic and Italic peoples. Named for their distinctive bell-shaped pottery vessels, often found with copper daggers, gold ornaments, and archery equipment — the "package" of an elite warrior culture.',
      startYear: -2800,
      endYear: -1700,
      phases: [
        { year: -2800, center: [47.5, 13.5], radius: 350 },
        { year: -2600, center: [46.5, 7.0],  radius: 520 },
        { year: -2400, center: [45.5, 2.0],  radius: 680 },
        { year: -2200, center: [46.0, -2.0], radius: 760 },
        { year: -2000, center: [50.5, -3.0], radius: 820 },
        { year: -1800, center: [52.0, -3.0], radius: 750 },
        { year: -1700, center: [53.0, -2.0], radius: 620 },
      ],
    },

    // ── Hellenic Branch ───────────────────────────────────────────

    {
      id: 'mycenaean',
      name: 'Mycenaean Greece',
      branch: 'hellenic',
      description: 'Proto-Greek speakers entered the Greek peninsula from the north around 2000-1600 BCE, mixing with the pre-existing Aegean / Anatolian Neolithic population. Mycenaean civilization (1600-1100 BCE) was the first Greek-speaking civilization, featuring palace economies (Mycenae, Tiryns, Pylos), long-distance trade, and Linear B script — the earliest deciphered Greek writing. Mycenaean collapse around 1100 BCE coincided with the broader Bronze Age Collapse and led to the Greek Dark Ages.',
      startYear: -2100,
      endYear: -1100,
      phases: [
        { year: -2100, center: [40.5, 22.5], radius: 180 },
        { year: -1800, center: [39.5, 22.5], radius: 270 },
        { year: -1600, center: [38.5, 22.5], radius: 360 },
        { year: -1400, center: [38.0, 23.0], radius: 400 },
        { year: -1200, center: [37.5, 22.5], radius: 360 },
        { year: -1100, center: [37.5, 22.0], radius: 250 },
      ],
    },

    {
      id: 'hellenic',
      name: 'Ancient Greece / Hellenistic World',
      branch: 'hellenic',
      description: 'Classical Greek civilization (poleis period c. 800-323 BCE) developed philosophy, democracy, drama, and science. Alexander the Great\'s conquests (334-323 BCE) spread Koine Greek from Egypt to Bactria, making it the lingua franca of the ancient world. Greek colonies extended from southern France to the Black Sea coast. Greek (Koine, then Byzantine) remained a major world language through late antiquity. Modern Greek is the direct descendant.',
      startYear: -1100,
      endYear: 500,
      phases: [
        { year: -1100, center: [38.5, 23.0], radius: 230 },
        { year: -900,  center: [38.5, 23.5], radius: 320 },
        { year: -700,  center: [38.0, 24.0], radius: 460 },
        { year: -500,  center: [38.0, 24.0], radius: 540 },
        { year: -323,  center: [38.0, 26.0], radius: 1000 },
        { year: -100,  center: [38.0, 27.0], radius: 800 },
        { year:  200,  center: [38.5, 27.0], radius: 650 },
        { year:  500,  center: [39.0, 28.0], radius: 500 },
      ],
    },

    // ── Italic Branch ─────────────────────────────────────────────

    {
      id: 'italic',
      name: 'Italic Peoples / Roman Republic & Empire',
      branch: 'italic',
      description: 'Italic-speaking peoples (Latins, Oscans, Umbrians, Faliscans) entered the Italian peninsula around 1200-1000 BCE, probably via the eastern Alps. Latin, spoken by Romans, spread via military conquest across the entire Mediterranean world. The Roman Empire at its height (2nd century CE) ruled from Britannia to Mesopotamia. Spoken Latin fragmented into the Romance languages (Italian, Spanish, Portuguese, French, Romanian, Catalan, Occitan) as Roman political unity dissolved.',
      startYear: -1300,
      endYear: 500,
      phases: [
        { year: -1300, center: [44.5, 12.5], radius: 180 },
        { year: -1000, center: [43.5, 12.5], radius: 240 },
        { year: -800,  center: [42.5, 12.5], radius: 280 },
        { year: -600,  center: [42.0, 12.8], radius: 240 },
        { year: -400,  center: [42.0, 13.0], radius: 380 },
        { year: -200,  center: [41.5, 13.5], radius: 680 },
        { year: -50,   center: [41.5, 14.0], radius: 1200 },
        { year:  100,  center: [41.5, 15.0], radius: 1550 },
        { year:  200,  center: [41.5, 15.0], radius: 1500 },
        { year:  400,  center: [41.5, 15.0], radius: 1200 },
        { year:  500,  center: [41.5, 14.0], radius: 900 },
      ],
    },

    // ── Celtic Branch ─────────────────────────────────────────────

    {
      id: 'celtic_hallstatt',
      name: 'Proto-Celtic (Hallstatt Culture)',
      branch: 'celtic',
      description: 'The Hallstatt culture (1200-450 BCE) in the Alpine region of Central Europe is associated with the earliest Proto-Celtic speakers. Named for the salt-mining site in Austria where extraordinary burials were found. Hallstatt elites traded amber, tin, and bronze across Europe. The culture developed into the La Tène culture around 450 BCE, which represents the full flowering of Celtic civilization.',
      startYear: -1300,
      endYear: -450,
      phases: [
        { year: -1300, center: [47.5, 13.5], radius: 280 },
        { year: -1100, center: [47.5, 12.5], radius: 380 },
        { year: -900,  center: [47.5, 11.5], radius: 480 },
        { year: -700,  center: [47.0, 10.5], radius: 540 },
        { year: -500,  center: [47.0, 9.5],  radius: 580 },
        { year: -450,  center: [47.0, 9.0],  radius: 560 },
      ],
    },

    {
      id: 'celtic_expansion',
      name: 'Celtic Peoples (La Tène Expansion)',
      branch: 'celtic',
      description: 'The La Tène culture (c. 450 BCE onward) represents the classical Celtic world — distinctive art style, chariot warfare, druids, and heroic culture as described by Greek and Roman writers. Celtic languages once dominated a huge swath of Europe from Ireland to Turkey. Celts sacked Rome in 390 BCE and raided Delphi in 279 BCE. The Galatians settled in central Anatolia after crossing into Asia Minor in 278 BCE. Roman conquest and Germanic migration pressure compressed Celtic speakers to the Atlantic fringe, where Irish, Welsh, Breton, and Scottish Gaelic survive.',
      startYear: -450,
      endYear: 500,
      phases: [
        { year: -450,  center: [47.0, 9.0],  radius: 620 },
        { year: -300,  center: [47.0, 5.0],  radius: 820 },
        { year: -200,  center: [48.0, 1.0],  radius: 950 },
        { year: -100,  center: [50.0, -2.0], radius: 900 },
        { year:    0,  center: [52.0, -3.5], radius: 700 },
        { year:  200,  center: [53.0, -4.5], radius: 550 },
        { year:  500,  center: [53.5, -5.0], radius: 420 },
      ],
    },

    // ── Germanic Branch ───────────────────────────────────────────

    {
      id: 'germanic',
      name: 'Germanic Peoples',
      branch: 'germanic',
      description: 'Proto-Germanic developed in southern Scandinavia and northern Germany out of the Corded Ware/Nordic Bronze Age continuum, roughly 500-200 BCE. The Germanic sound shifts (Grimm\'s Law) mark the definitive split from the rest of Proto-Indo-European. During the Migration Period (350-700 CE), Germanic tribes — Goths, Vandals, Franks, Anglo-Saxons, Lombards — established kingdoms across the former Western Roman Empire, spreading Germanic languages across much of Europe. Modern Germanic languages: English, German, Dutch, Swedish, Norwegian, Danish.',
      startYear: -800,
      endYear: 500,
      phases: [
        { year: -800,  center: [57.0, 10.5], radius: 300 },
        { year: -500,  center: [56.0, 11.0], radius: 420 },
        { year: -300,  center: [55.0, 12.0], radius: 520 },
        { year: -100,  center: [54.0, 13.0], radius: 580 },
        { year:    0,  center: [53.0, 13.5], radius: 640 },
        { year:  200,  center: [52.0, 14.0], radius: 750 },
        { year:  400,  center: [50.0, 12.0], radius: 900 },
        { year:  500,  center: [49.0, 11.0], radius: 1000 },
      ],
    },

    // ── Baltic-Slavic Branch ──────────────────────────────────────

    {
      id: 'baltic',
      name: 'Baltic Peoples',
      branch: 'baltic_slavic',
      description: 'Baltic languages (Lithuanian, Latvian, and the extinct Old Prussian) are among the most archaic surviving Indo-European languages, preserving features lost elsewhere — including a pitch accent system, archaic noun declensions, and vocabulary close to reconstructed PIE. Lithuanian is famous among linguists for its conservatism. The Baltic peoples maintained a relatively stable presence in the eastern Baltic region, largely bypassed by the waves of migration that transformed surrounding areas.',
      startYear: -1500,
      endYear: 500,
      phases: [
        { year: -1500, center: [56.0, 24.0], radius: 320 },
        { year: -1000, center: [56.0, 24.5], radius: 370 },
        { year: -500,  center: [56.0, 25.0], radius: 390 },
        { year:    0,  center: [56.0, 24.5], radius: 370 },
        { year:  300,  center: [56.0, 24.0], radius: 350 },
        { year:  500,  center: [55.5, 24.0], radius: 330 },
      ],
    },

    {
      id: 'slavic',
      name: 'Slavic Peoples',
      branch: 'baltic_slavic',
      description: 'Proto-Slavic emerged in the forest zone of Eastern Europe, perhaps around the Pripyat Marshes region (Belarus/Ukraine border), sometime in the first millennium BCE. The dramatic Slavic expansion of the 5th-7th centuries CE filled the demographic and political vacuum left as Germanic tribes migrated westward during the Migration Period. Slavic languages today are spoken by more people than any other Indo-European branch — Russian, Polish, Ukrainian, Czech, Slovak, Bulgarian, Serbian, Croatian, and others.',
      startYear: -500,
      endYear: 500,
      phases: [
        { year: -500,  center: [51.5, 27.5], radius: 280 },
        { year: -200,  center: [51.5, 27.0], radius: 330 },
        { year:    0,  center: [51.5, 27.5], radius: 370 },
        { year:  200,  center: [51.5, 28.5], radius: 430 },
        { year:  350,  center: [51.5, 30.0], radius: 530 },
        { year:  500,  center: [52.0, 32.0], radius: 750 },
      ],
    },

    // ── Indo-Iranian Branch ───────────────────────────────────────

    {
      id: 'sintashta',
      name: 'Sintashta Culture',
      branch: 'indo_iranian',
      description: 'A pivotal culture of the late 3rd millennium BCE in the southern Urals (modern Russia/Kazakhstan border). Sintashta people invented or perfected the spoked-wheel war chariot around 2100 BCE — a military revolution that transformed warfare across Eurasia. Their fortified settlements (the "Land of Towns") were densely packed with metal smiths producing arsenical bronze weapons. Sintashta warriors were buried with chariots, horses, and weapons. They are the most plausible ancestors of the Indo-Iranian branch of PIE.',
      startYear: -2200,
      endYear: -1700,
      phases: [
        { year: -2200, center: [52.5, 60.5], radius: 220 },
        { year: -2000, center: [52.0, 61.0], radius: 290 },
        { year: -1800, center: [51.5, 61.5], radius: 270 },
        { year: -1700, center: [51.5, 62.0], radius: 240 },
      ],
    },

    {
      id: 'andronovo',
      name: 'Andronovo Culture',
      branch: 'indo_iranian',
      description: 'The Andronovo horizon (c. 2000-900 BCE) is a vast cultural complex of the Central Asian steppe, successor to Sintashta. Andronovo peoples spread Indo-Iranian languages and the horse-chariot complex across an enormous area from the Urals to the Tarim Basin. From Andronovo, the Indo-Aryan branch migrated south into the Indian subcontinent and the Iranian branch settled in Iran, Afghanistan, and surrounding regions. Also called the "Indo-Iranian corridor." Andronovo genetics are essentially Yamnaya-derived with high EHG/CHG ancestry.',
      startYear: -2000,
      endYear: -900,
      phases: [
        { year: -2000, center: [50.0, 66.0], radius: 580 },
        { year: -1800, center: [49.5, 67.0], radius: 800 },
        { year: -1600, center: [49.0, 68.0], radius: 950 },
        { year: -1400, center: [48.5, 68.0], radius: 900 },
        { year: -1200, center: [48.0, 67.0], radius: 820 },
        { year: -1000, center: [47.5, 66.0], radius: 720 },
        { year:  -900, center: [47.0, 65.0], radius: 600 },
      ],
    },

    {
      id: 'vedic_india',
      name: 'Vedic / Indo-Aryan (India)',
      branch: 'indo_iranian',
      description: 'The Indo-Aryan branch entered the Indian subcontinent through the mountain passes of Afghanistan and northwestern Pakistan (Khyber, Bolan) around 1900-1500 BCE. They brought Sanskrit, the Rig Veda, fire-altar rituals, horse sacrifice, and the chariot. Ancient DNA from South Asian archaeological sites shows progressively increasing steppe ancestry from ~2000 BCE onward — exactly matching the pattern expected from an Indo-Aryan migration. Today\'s Indo-Aryan languages (Hindi, Urdu, Bengali, Punjabi, Marathi, Gujarati, Sinhala, and others) are spoken by over 1.5 billion people.',
      startYear: -1800,
      endYear: 500,
      phases: [
        { year: -1800, center: [31.5, 70.5], radius: 200 },
        { year: -1500, center: [30.0, 73.0], radius: 380 },
        { year: -1200, center: [28.0, 76.0], radius: 600 },
        { year: -900,  center: [26.0, 79.0], radius: 820 },
        { year: -600,  center: [24.0, 80.0], radius: 1000 },
        { year: -300,  center: [22.0, 80.0], radius: 1150 },
        { year:    0,  center: [21.0, 80.0], radius: 1250 },
        { year:  300,  center: [20.0, 80.0], radius: 1300 },
        { year:  500,  center: [19.0, 80.0], radius: 1350 },
      ],
    },

    {
      id: 'iranian',
      name: 'Iranian Peoples',
      branch: 'indo_iranian',
      description: 'The Iranian branch includes Medes, Persians, Bactrians, Sogdians, Scythians, and Sarmatians. The Achaemenid Persian Empire (550-330 BCE) was the largest the ancient world had ever seen, stretching from Egypt and the Aegean to northwestern India. Old Persian and Avestan (the language of the Zoroastrian scriptures) are the earliest attested Iranian languages. Modern Iranian languages — Persian (Farsi), Pashto, Kurdish, Balochi, Ossetic, and others — are spoken across a broad arc from Turkey to northwestern India.',
      startYear: -1600,
      endYear: 500,
      phases: [
        { year: -1600, center: [36.0, 57.0], radius: 380 },
        { year: -1300, center: [35.0, 54.0], radius: 480 },
        { year: -1000, center: [34.0, 52.0], radius: 550 },
        { year:  -700, center: [34.5, 51.0], radius: 580 },
        { year:  -550, center: [32.5, 54.0], radius: 1100 },
        { year:  -400, center: [33.0, 55.0], radius: 1350 },
        { year:  -200, center: [34.0, 53.0], radius: 1000 },
        { year:     0, center: [34.0, 52.0], radius: 950 },
        { year:   300, center: [34.0, 52.5], radius: 900 },
        { year:   500, center: [34.0, 52.5], radius: 880 },
      ],
    },

    {
      id: 'scythians',
      name: 'Scythians / Sarmatians (Iranian Steppe)',
      branch: 'indo_iranian',
      description: 'Iranian-speaking nomadic peoples of the Eurasian steppe, renowned for their horsemanship, gold-work art ("animal style"), and ferocity in battle. Scythians (c. 700-200 BCE) dominated the Pontic steppe north of the Black Sea. Herodotus described them in detail. Sarmatians (c. 400 BCE-400 CE) eventually replaced the Scythians westward. The Ossetians of the Caucasus are the closest modern descendants of the Sarmatians. Scythians and Sarmatians spread Iranian languages across the steppe before Turkic and later Slavic replacement.',
      startYear: -1000,
      endYear: 350,
      phases: [
        { year: -1000, center: [47.0, 45.0], radius: 380 },
        { year:  -800, center: [47.0, 42.0], radius: 550 },
        { year:  -600, center: [47.0, 38.0], radius: 700 },
        { year:  -400, center: [47.0, 37.0], radius: 750 },
        { year:  -200, center: [47.0, 38.0], radius: 700 },
        { year:     0, center: [47.5, 40.0], radius: 650 },
        { year:   200, center: [47.5, 42.0], radius: 550 },
        { year:   350, center: [47.0, 43.0], radius: 400 },
      ],
    },

    // ── Armenian Branch ───────────────────────────────────────────

    {
      id: 'armenian',
      name: 'Armenian',
      branch: 'armenian',
      description: 'Armenian is a unique Indo-European branch forming its own sub-family. Armenians appear in historical sources from the 6th century BCE. The Armenian script was invented in 405 CE by Mesrop Mashtots. Armenian shows substantial Iranian and Semitic loanwords reflecting centuries of contact. Genetic analysis shows Armenians carry a mix of Caucasus Hunter-Gatherer, Anatolian Neolithic, and steppe ancestry. Armenian survived millennia despite being surrounded by larger empires (Persian, Roman, Byzantine, Arab, Ottoman).',
      startYear: -1000,
      endYear: 500,
      phases: [
        { year: -1000, center: [40.0, 44.5], radius: 180 },
        { year:  -700, center: [40.0, 44.5], radius: 230 },
        { year:  -500, center: [40.0, 44.5], radius: 270 },
        { year:  -200, center: [40.2, 44.8], radius: 300 },
        { year:     0, center: [40.0, 44.5], radius: 290 },
        { year:   300, center: [40.0, 44.8], radius: 270 },
        { year:   500, center: [40.0, 44.5], radius: 250 },
      ],
    },

    // ── Mitanni (Indo-Aryan elite in Syria) ───────────────────────

    {
      id: 'mitanni',
      name: 'Mitanni Kingdom (Indo-Aryan Elite)',
      branch: 'indo_iranian',
      description: 'A Hurrian-speaking kingdom in northern Syria and Mesopotamia (c. 1600-1260 BCE) whose ruling elite bore Indo-Aryan names and invoked Vedic gods (Mitra, Varuna, Indra, Nasatya) in their treaties with the Hittites. The Mitanni are striking evidence of an early Indo-Aryan diaspora reaching as far as Syria via the steppe migration routes. The chariot and horsemanship terminology in Mitanni texts is Sanskrit-related. This "lost" Indo-Aryan outpost vanished when the Mitanni kingdom was absorbed by the Hittites and Assyrians.',
      startYear: -1600,
      endYear: -1260,
      phases: [
        { year: -1600, center: [36.8, 39.5], radius: 160 },
        { year: -1450, center: [36.5, 40.0], radius: 240 },
        { year: -1350, center: [36.5, 40.5], radius: 260 },
        { year: -1260, center: [36.5, 40.0], radius: 180 },
      ],
    },

  ], // end cultures

  // ── Migration paths ──────────────────────────────────────────────
  // Each migration:
  //   id, name, branch, description
  //   startYear, endYear  – visibility window (full path shown after endYear)
  //   animateStart, animateEnd – years over which the path "draws" itself
  //   path: [[lat,lon], ...] waypoints
  migrations: [

    {
      id: 'mig_east_afanasievo',
      name: 'Eastward: Yamnaya → Afanasievo',
      branch: 'tocharian',
      description: 'c. 3300 BCE — An early group of Yamnaya migrants traversed the Kazakh steppe to the Altai Mountains. Genetically near-identical to Yamnaya, they became the Afanasievo culture — and likely the distant ancestors of the Tocharians who would be found writing in oasis cities 3,000 years later.',
      startYear: -3500,
      endYear:    900,
      animateStart: -3400,
      animateEnd:   -2900,
      path: [
        [47.5, 40.0],
        [49.0, 52.0],
        [50.5, 65.0],
        [51.5, 78.0],
        [52.0, 88.0],
      ],
    },

    {
      id: 'mig_afanasievo_tarim',
      name: 'Eastward: Afanasievo → Tarim Basin (Tocharians)',
      branch: 'tocharian',
      description: 'c. 2000 BCE — Descendants of Afanasievo migrants moved south from the Altai-Minusinsk region into the Tarim Basin (Xinjiang), becoming the Tocharians. This is the easternmost extent of the Indo-European world.',
      startYear: -2200,
      endYear:    900,
      animateStart: -2200,
      animateEnd:   -1700,
      path: [
        [52.0, 88.0],
        [49.0, 86.0],
        [45.5, 84.5],
        [41.5, 83.0],
      ],
    },

    {
      id: 'mig_corded_ware',
      name: 'Westward: Yamnaya → Corded Ware (Europe)',
      branch: 'homeland',
      description: 'c. 3100-2700 BCE — The great westward migration. Yamnaya-related peoples swept into central and northern Europe, creating the Corded Ware culture. Ancient DNA shows this migration replaced up to 75% of the pre-existing Neolithic farmer ancestry in some regions — one of the fastest and most complete genetic replacements ever documented in the archaeological record.',
      startYear: -3200,
      endYear:    500,
      animateStart: -3100,
      animateEnd:   -2600,
      path: [
        [47.5, 38.0],
        [49.5, 30.0],
        [51.5, 22.0],
        [53.0, 15.0],
        [55.5, 10.0],
      ],
    },

    {
      id: 'mig_bell_beaker_west',
      name: 'Westward: Bell Beaker → Atlantic Europe',
      branch: 'celtic',
      description: 'c. 2800-2200 BCE — Bell Beaker expansion brought a second wave of steppe ancestry into Western Europe. The migration extended from Central Europe through France to Iberia, and eventually to Britain and Ireland. In Britain, it replaced over 90% of the Neolithic gene pool within a few centuries.',
      startYear: -2800,
      endYear:    500,
      animateStart: -2800,
      animateEnd:   -2100,
      path: [
        [48.0, 14.0],
        [47.5, 7.5],
        [46.5, 2.0],
        [44.5, -5.0],
        [51.5, -3.5],
        [56.0, -4.0],
      ],
    },

    {
      id: 'mig_bell_beaker_britain',
      name: 'Bell Beaker → British Isles',
      branch: 'celtic',
      description: 'c. 2500-2000 BCE — The Bell Beaker migration into Britain was among the most complete genetic replacements known anywhere. Ancient DNA from British Neolithic and Bronze Age individuals shows the dramatic shift from Neolithic farmer ancestry to near-total replacement by Bell Beaker steppe-derived ancestry. The builders of Stonehenge\'s final phase were Bell Beaker people.',
      startYear: -2500,
      endYear:    500,
      animateStart: -2500,
      animateEnd:   -2000,
      path: [
        [44.5, -5.0],
        [50.5, -4.5],
        [53.5, -4.0],
        [57.0, -4.5],
      ],
    },

    {
      id: 'mig_sintashta_andronovo',
      name: 'Indo-Iranian: Sintashta → Andronovo',
      branch: 'indo_iranian',
      description: 'c. 2200-1800 BCE — From the Sintashta fortified settlements in the southern Urals, chariot-riding peoples expanded eastward and southward, forming the vast Andronovo cultural horizon of the Central Asian steppe. The chariot complex they carried would transform military power from China to Egypt.',
      startYear: -2200,
      endYear:    500,
      animateStart: -2200,
      animateEnd:   -1700,
      path: [
        [52.5, 60.5],
        [51.0, 65.0],
        [50.0, 70.0],
        [49.0, 75.0],
        [48.5, 80.0],
      ],
    },

    {
      id: 'mig_indo_aryan_india',
      name: 'Indo-Aryan: Andronovo → India',
      branch: 'indo_iranian',
      description: 'c. 1900-1400 BCE — Indo-Aryan speakers migrated south from the Andronovo steppe through the mountain passes of Afghanistan (Hindu Kush, Khyber Pass) into the Indian subcontinent. They brought Sanskrit, Vedic religion, the horse-drawn chariot, and fire-altar rituals. This migration is corroborated by ancient DNA from South Asian sites showing increasing steppe ancestry from ~2000 BCE onward.',
      startYear: -2000,
      endYear:    500,
      animateStart: -1900,
      animateEnd:   -1400,
      path: [
        [49.0, 68.0],
        [43.0, 66.0],
        [38.0, 64.0],
        [35.0, 65.0],
        [33.5, 67.5],
        [31.0, 70.0],
        [28.0, 73.0],
      ],
    },

    {
      id: 'mig_iranian_plateau',
      name: 'Iranian: Andronovo → Iranian Plateau',
      branch: 'indo_iranian',
      description: 'c. 1500-1000 BCE — The Iranian branch of Indo-Iranian moved southwestward from the Central Asian steppe onto the Iranian plateau. Medes and Persians consolidated there, eventually producing the Achaemenid Empire. Avestan (the language of the Zoroastrian Avesta) is the oldest attested Iranian language.',
      startYear: -1600,
      endYear:    500,
      animateStart: -1500,
      animateEnd:   -1000,
      path: [
        [49.0, 68.0],
        [45.0, 63.0],
        [40.0, 59.0],
        [36.0, 56.0],
        [33.0, 52.0],
      ],
    },

    {
      id: 'mig_proto_greek',
      name: 'Hellenic: Proto-Greeks enter Greece',
      branch: 'hellenic',
      description: 'c. 2100-1700 BCE — Proto-Greek speakers entered the Greek peninsula from the north, via Thessaly and the Thessalian plain, mixing with pre-existing Aegean (Anatolian Neolithic) populations. The newcomers brought their language and steppe-related genetic ancestry to a region whose population would grow into Mycenaean civilization.',
      startYear: -2200,
      endYear:    500,
      animateStart: -2100,
      animateEnd:   -1700,
      path: [
        [44.5, 21.5],
        [42.0, 22.0],
        [40.5, 22.3],
        [38.5, 22.5],
      ],
    },

    {
      id: 'mig_alexander',
      name: 'Hellenic Expansion: Alexander\'s Conquests',
      branch: 'hellenic',
      description: 'c. 334-323 BCE — Alexander the Great\'s military campaigns spread Greek (Koine) as the administrative language from Egypt and Anatolia to Bactria and the edge of India. This created the Hellenistic world, in which Greek was the prestige language of an enormous region for centuries.',
      startYear: -350,
      endYear:    500,
      animateStart: -334,
      animateEnd:   -320,
      path: [
        [38.0, 23.0],
        [36.0, 28.0],
        [31.0, 29.5],
        [33.0, 35.0],
        [34.5, 43.0],
        [36.5, 53.0],
        [38.5, 61.0],
        [36.0, 66.5],
        [34.0, 71.0],
        [31.5, 74.0],
      ],
    },

    {
      id: 'mig_roman_expansion',
      name: 'Italic / Roman Expansion',
      branch: 'italic',
      description: 'c. 300 BCE-200 CE — Roman military conquest spread Latin across the Western Mediterranean, Gaul, Britain, Iberia, and North Africa. Latin fragmented into the Romance languages (Spanish, French, Italian, Portuguese, Romanian) as the Western Roman Empire dissolved.',
      startYear: -400,
      endYear:    500,
      animateStart: -300,
      animateEnd:    100,
      path: [
        [41.9, 12.5],
        [40.0, 15.0],
        [37.0, 10.0],
        [36.5, 3.0],
        [40.0, -4.0],
        [43.5, -5.5],
        [46.5, -1.5],
        [48.5,  2.5],
        [51.5, -0.5],
        [54.0, -3.0],
      ],
    },

    {
      id: 'mig_celtic_expansion',
      name: 'Celtic (La Tène) Expansion',
      branch: 'celtic',
      description: 'c. 450-200 BCE — Celtic La Tène culture spread westward and northward from the Alpine zone. Celts raided and settled across Europe, reaching Ireland, Scotland, Iberia, northern Italy, the Balkans, and even Anatolia (Galatia). At their peak, Celtic speakers occupied a larger area of Europe than any other language family.',
      startYear: -500,
      endYear:    500,
      animateStart: -450,
      animateEnd:   -200,
      path: [
        [47.0, 9.0],
        [47.0, 3.0],
        [46.5, -2.0],
        [43.5, -5.0],
        [51.0, -2.0],
        [55.0, -4.0],
      ],
    },

    {
      id: 'mig_slavic_expansion',
      name: 'Slavic Expansion (Migration Period)',
      branch: 'baltic_slavic',
      description: 'c. 400-700 CE — As Germanic tribes migrated westward and southward during the Migration Period, Slavic-speaking peoples expanded from their eastern European forest zone into the vast territories left behind. Slavic languages spread across a huge arc from the Baltic to the Balkans and into central Russia.',
      startYear:  300,
      endYear:    500,
      animateStart: 350,
      animateEnd:   550,
      path: [
        [51.5, 27.0],
        [52.5, 32.0],
        [53.5, 38.0],
        [55.0, 43.0],
      ],
    },

    {
      id: 'mig_slavic_balkan',
      name: 'Slavic Expansion into Balkans',
      branch: 'baltic_slavic',
      description: 'c. 500-700 CE — Slavic peoples also expanded southward into the Balkans in the wake of Avar migrations, eventually Slavicising much of the Balkan peninsula and giving rise to Bulgarian, Serbian, Croatian, Slovenian, and Macedonian.',
      startYear:  400,
      endYear:    500,
      animateStart: 450,
      animateEnd:   600,
      path: [
        [51.5, 27.0],
        [48.0, 25.0],
        [45.0, 21.0],
        [43.0, 20.0],
        [42.0, 22.0],
      ],
    },

  ], // end migrations

  // ── Timeline events ──────────────────────────────────────────────
  events: [
    { year: -4500, name: 'Sredny Stog / Khvalynsk cultures: early horse domestication on Pontic steppe', branch: 'homeland' },
    { year: -3800, name: 'Earliest wagon burials on Pontic-Caspian steppe; PIE proto-language forming', branch: 'homeland' },
    { year: -3500, name: 'Yamnaya culture fully formed — PIE homeland established', branch: 'homeland' },
    { year: -3300, name: 'Afanasievo migration: Yamnaya groups travel east to Altai Mountains', branch: 'tocharian' },
    { year: -3100, name: 'Yamnaya expansion westward begins — proto-Corded Ware migration', branch: 'homeland' },
    { year: -2900, name: 'Corded Ware culture appears in Central Europe — 75% steppe ancestry', branch: 'homeland' },
    { year: -2800, name: 'Bell Beaker culture begins spreading westward from Central Europe', branch: 'celtic' },
    { year: -2500, name: 'Bell Beaker reaches Britain; massive genetic replacement of Neolithic population', branch: 'celtic' },
    { year: -2400, name: 'Stonehenge completed by Bell Beaker people', branch: 'celtic' },
    { year: -2200, name: 'Sintashta culture: spoked-wheel war chariot invented in southern Urals', branch: 'indo_iranian' },
    { year: -2100, name: 'Proto-Greeks enter Greek peninsula; Andronovo culture begins', branch: 'hellenic' },
    { year: -2000, name: 'Afanasievo descendants move south into Tarim Basin (Tocharians)', branch: 'tocharian' },
    { year: -1900, name: 'Indo-Aryan migration toward India begins through Hindu Kush passes', branch: 'indo_iranian' },
    { year: -1800, name: 'Hittite Old Kingdom rises; Hittite is oldest attested IE language', branch: 'anatolian' },
    { year: -1700, name: 'Sintashta chariots reach China; Andronovo at maximum extent', branch: 'indo_iranian' },
    { year: -1600, name: 'Mitanni kingdom (Indo-Aryan elite) in northern Syria; Mycenaean Greece begins', branch: 'indo_iranian' },
    { year: -1500, name: 'Rig Veda composed in Sanskrit; Iranian tribes settle Iranian plateau', branch: 'indo_iranian' },
    { year: -1400, name: 'Mycenaean Greece at peak; Linear B (Greek) script in use', branch: 'hellenic' },
    { year: -1350, name: 'Mitanni-Hittite treaty names Vedic gods Mitra, Varuna, Indra, Nasatya', branch: 'indo_iranian' },
    { year: -1200, name: 'Bronze Age Collapse — Hittite Empire, Mycenaean Greece collapse; Proto-Celtic forming', branch: 'celtic' },
    { year: -1180, name: 'Hittite Empire destroyed — Anatolian IE languages begin decline', branch: 'anatolian' },
    { year: -900,  name: 'Scythians dominate Pontic steppe; Hallstatt Proto-Celtic culture', branch: 'celtic' },
    { year: -800,  name: 'Homeric epics (Iliad, Odyssey) composed in Greek', branch: 'hellenic' },
    { year: -700,  name: 'Achaemenid Persians emerging; Avesta (Zoroastrian scripture) composed', branch: 'indo_iranian' },
    { year: -550,  name: 'Achaemenid Persian Empire founded by Cyrus the Great — largest empire yet', branch: 'indo_iranian' },
    { year: -500,  name: 'La Tène Celtic culture begins; Proto-Germanic taking shape in Scandinavia', branch: 'celtic' },
    { year: -450,  name: 'Herodotus writes the Histories — describes Scythians and many IE peoples', branch: 'hellenic' },
    { year: -390,  name: 'Celts sack Rome — Celtic peoples at their geographic peak', branch: 'celtic' },
    { year: -334,  name: 'Alexander the Great invades Persia — Greek spreads east to Bactria and India', branch: 'hellenic' },
    { year: -279,  name: 'Galatians (Celts) cross into Anatolia; settle in central Turkey (Galatia)', branch: 'celtic' },
    { year: -200,  name: 'Roman expansion accelerating; Latin begins replacing Celtic in Western Europe', branch: 'italic' },
    { year:    0,  name: 'Roman Empire at near-peak; Germanic tribes pressing on Rhine frontier', branch: 'italic' },
    { year:   50,  name: 'Roman conquest of Britain; Latin and Celtic coexist', branch: 'italic' },
    { year:  100,  name: 'Trajan\'s Column: Roman Empire at maximum extent', branch: 'italic' },
    { year:  300,  name: 'Migration Period begins; Germanic tribes migrate westward and southward', branch: 'germanic' },
    { year:  375,  name: 'Hunnic invasions accelerate Germanic Migration Period', branch: 'germanic' },
    { year:  405,  name: 'Armenian script invented by Mesrop Mashtots', branch: 'armenian' },
    { year:  476,  name: 'Fall of Western Roman Empire; Romance languages begin fragmenting from Latin', branch: 'italic' },
    { year:  500,  name: 'Slavic expansion fills vacuum left by Germanic migrations westward', branch: 'baltic_slavic' },
  ],

}; // end PIE_DATA
