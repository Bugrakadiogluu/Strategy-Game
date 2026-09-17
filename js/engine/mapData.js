/**
 * mapData.js - Authentic WW2 Theater Topography & Seamless European/Mediterranean Geography
 * Every territory shares exact border nodes with neighbors for a continuous, seamless,
 * realistic world-map aesthetic: realistic capes, fjords, the Italian boot & Sicily,
 * Brittany & Normandy, the British Isles, Jutland, Crimea, Aegean, and Anatolia.
 */

export const MAP_DIMENSIONS = {
    width: 1400,
    height: 900
};

export const INITIAL_REGIONS = [
    // =========================================================================
    // 1. BRITISH ISLES & ATLANTIC
    // =========================================================================
    {
        id: 'atlantic',
        name: 'Atlantik Konvoy Hattı',
        owner: 'uk',
        terrain: 'coastal',
        industry: 3,
        capital: false,
        x: 100,
        y: 260,
        path: "M 30,50 L 180,50 L 180,240 L 140,430 L 135,545 L 90,620 L 40,550 L 30,250 Z",
        polygon: [[30,50], [180,50], [180,240], [140,430], [135,545], [90,620], [40,550], [30,250]],
        neighbors: ['scotland', 'ireland', 'london', 'gibraltar'],
        initialUnits: { infantry: 2, armor: 1, air: 2 }
    },
    {
        id: 'scotland',
        name: 'İskoçya & Hebridler',
        owner: 'uk',
        terrain: 'mountains',
        industry: 2,
        capital: false,
        x: 350,
        y: 155,
        path: "M 330,80 L 370,75 L 390,100 L 385,140 L 375,195 L 385,230 L 335,235 L 320,200 L 295,130 Z",
        polygon: [[330,80], [370,75], [390,100], [385,140], [375,195], [385,230], [335,235], [320,200], [295,130]],
        neighbors: ['atlantic', 'ireland', 'london', 'norway'],
        initialUnits: { infantry: 4, armor: 1, air: 1 }
    },
    {
        id: 'ireland',
        name: 'İrlanda Adası',
        owner: 'neutral',
        terrain: 'plains',
        industry: 1,
        capital: false,
        x: 235,
        y: 305,
        path: "M 210,230 L 235,220 L 265,245 L 275,310 L 270,360 L 230,385 L 195,370 L 200,300 L 205,250 Z",
        polygon: [[210,230], [235,220], [265,245], [275,310], [270,360], [230,385], [195,370], [200,300], [205,250]],
        neighbors: ['atlantic', 'scotland', 'london'],
        initialUnits: { infantry: 2, armor: 0, air: 0 }
    },
    {
        id: 'london',
        name: 'İngiltere & Galler',
        owner: 'uk',
        terrain: 'city',
        industry: 5,
        capital: true,
        x: 365,
        y: 335,
        path: "M 335,235 L 385,230 L 395,250 L 430,305 L 435,335 L 455,345 L 435,385 L 425,410 L 375,420 L 325,435 L 275,430 L 315,400 L 290,380 L 300,350 L 335,320 Z",
        polygon: [[335,235], [385,230], [395,250], [430,305], [435,335], [455,345], [435,385], [425,410], [375,420], [325,435], [275,430], [315,400], [290,380], [300,350], [335,320]],
        neighbors: ['scotland', 'ireland', 'atlantic', 'n_france', 'benelux'],
        initialUnits: { infantry: 8, armor: 3, air: 3 }
    },

    // =========================================================================
    // 2. WESTERN EUROPE (FRANCE & BENELUX)
    // =========================================================================
    {
        id: 'n_france',
        name: 'Kuzey Fransa & Paris',
        owner: 'uk',
        terrain: 'city',
        industry: 4,
        capital: true,
        x: 395,
        y: 475,
        path: "M 420,425 L 445,440 L 495,470 L 535,485 L 545,520 L 540,560 L 510,550 L 460,545 L 390,530 L 355,530 L 320,525 L 280,510 L 250,480 L 320,470 L 330,445 L 365,450 L 405,435 L 415,425 Z",
        polygon: [[420,425], [445,440], [495,470], [535,485], [545,520], [540,560], [510,550], [460,545], [390,530], [355,530], [320,525], [280,510], [250,480], [320,470], [330,445], [365,450], [405,435], [415,425]],
        neighbors: ['london', 'benelux', 's_france', 'ruhr'],
        initialUnits: { infantry: 6, armor: 2, air: 1 }
    },
    {
        id: 's_france',
        name: 'Güney Fransa & Vichy',
        owner: 'uk',
        terrain: 'plains',
        industry: 3,
        capital: false,
        x: 445,
        y: 590,
        path: "M 355,530 L 390,530 L 460,545 L 510,550 L 540,560 L 550,595 L 560,635 L 530,640 L 515,630 L 480,615 L 440,600 L 440,580 L 340,560 L 350,570 Z",
        polygon: [[355,530], [390,530], [460,545], [510,550], [540,560], [550,595], [560,635], [530,640], [515,630], [480,615], [440,600], [440,580], [340,560], [350,570]],
        neighbors: ['n_france', 'spain', 'n_italy'],
        initialUnits: { infantry: 4, armor: 1, air: 0 }
    },
    {
        id: 'benelux',
        name: 'Benelüks (Hollanda/Belçika)',
        owner: 'uk',
        terrain: 'plains',
        industry: 3,
        capital: false,
        x: 475,
        y: 420,
        path: "M 420,425 L 450,420 L 475,405 L 485,380 L 535,385 L 515,410 L 510,435 L 515,460 L 495,470 L 445,440 Z",
        polygon: [[420,425], [450,420], [475,405], [485,380], [535,385], [515,410], [510,435], [515,460], [495,470], [445,440]],
        neighbors: ['london', 'n_france', 'ruhr', 'denmark'],
        initialUnits: { infantry: 3, armor: 1, air: 0 }
    },

    // =========================================================================
    // 3. GERMANY & CENTRAL EUROPE
    // =========================================================================
    {
        id: 'ruhr',
        name: 'Ruhr & Rhineland',
        owner: 'germany',
        terrain: 'city',
        industry: 5,
        capital: false,
        x: 555,
        y: 450,
        path: "M 535,385 L 585,380 L 615,385 L 595,420 L 585,450 L 565,485 L 545,520 L 535,485 L 495,470 L 515,460 L 510,435 L 515,410 Z",
        polygon: [[535,385], [585,380], [615,385], [595,420], [585,450], [565,485], [545,520], [535,485], [495,470], [515,460], [510,435], [515,410]],
        neighbors: ['benelux', 'n_france', 'berlin', 'bavaria'],
        initialUnits: { infantry: 8, armor: 5, air: 3 }
    },
    {
        id: 'berlin',
        name: 'Berlin & Brandenburg',
        owner: 'germany',
        terrain: 'city',
        industry: 6,
        capital: true,
        x: 655,
        y: 410,
        path: "M 615,385 L 620,370 L 645,360 L 675,355 L 710,370 L 715,440 L 685,485 L 645,480 L 610,500 L 565,485 L 585,450 L 595,420 Z",
        polygon: [[615,385], [620,370], [645,360], [675,355], [710,370], [715,440], [685,485], [645,480], [610,500], [565,485], [585,450], [595,420]],
        neighbors: ['ruhr', 'bavaria', 'poland', 'denmark', 'e_prussia'],
        initialUnits: { infantry: 10, armor: 6, air: 4 }
    },
    {
        id: 'bavaria',
        name: 'Bavyera & Avusturya',
        owner: 'germany',
        terrain: 'mountains',
        industry: 4,
        capital: false,
        x: 640,
        y: 540,
        path: "M 545,520 L 565,485 L 610,500 L 645,480 L 685,485 L 710,510 L 705,545 L 740,550 L 735,580 L 705,595 L 630,590 L 570,585 L 540,560 Z",
        polygon: [[545,520], [565,485], [610,500], [645,480], [685,485], [710,510], [705,545], [740,550], [735,580], [705,595], [630,590], [570,585], [540,560]],
        neighbors: ['ruhr', 'berlin', 'n_italy', 'hungary', 'poland'],
        initialUnits: { infantry: 5, armor: 3, air: 1 }
    },
    {
        id: 'e_prussia',
        name: 'Doğu Prusya & Königsberg',
        owner: 'germany',
        terrain: 'plains',
        industry: 2,
        capital: false,
        x: 795,
        y: 335,
        path: "M 770,365 L 805,345 L 825,305 L 830,335 L 820,375 L 785,380 Z",
        polygon: [[770,365], [805,345], [825,305], [830,335], [820,375], [785,380]],
        neighbors: ['berlin', 'poland', 'baltics'],
        initialUnits: { infantry: 4, armor: 2, air: 1 }
    },
    {
        id: 'poland',
        name: 'Polonya & Varşova',
        owner: 'germany',
        terrain: 'plains',
        industry: 3,
        capital: false,
        x: 765,
        y: 435,
        path: "M 710,370 L 735,360 L 770,365 L 785,380 L 820,375 L 845,420 L 840,490 L 800,515 L 760,520 L 685,485 L 715,440 Z",
        polygon: [[710,370], [735,360], [770,365], [785,380], [820,375], [845,420], [840,490], [800,515], [760,520], [685,485], [715,440]],
        neighbors: ['berlin', 'e_prussia', 'bavaria', 'baltics', 'ukraine', 'hungary'],
        initialUnits: { infantry: 6, armor: 3, air: 1 }
    },

    // =========================================================================
    // 4. SCANDINAVIAN PENINSULA
    // =========================================================================
    {
        id: 'denmark',
        name: 'Danimarka (Jutland)',
        owner: 'germany',
        terrain: 'plains',
        industry: 2,
        capital: false,
        x: 600,
        y: 300,
        path: "M 575,360 L 570,300 L 595,230 L 610,290 L 645,320 L 620,370 Z",
        polygon: [[575,360], [570,300], [595,230], [610,290], [645,320], [620,370]],
        neighbors: ['benelux', 'berlin', 'norway', 'sweden'],
        initialUnits: { infantry: 3, armor: 1, air: 0 }
    },
    {
        id: 'norway',
        name: 'Norveç Fiyortları',
        owner: 'neutral',
        terrain: 'mountains',
        industry: 2,
        capital: false,
        x: 580,
        y: 160,
        path: "M 680,50 L 600,80 L 565,125 L 525,175 L 515,220 L 545,250 L 585,240 L 595,185 L 615,140 L 655,90 Z",
        polygon: [[680,50], [600,80], [565,125], [525,175], [515,220], [545,250], [585,240], [595,185], [615,140], [655,90]],
        neighbors: ['scotland', 'denmark', 'sweden', 'finland'],
        initialUnits: { infantry: 3, armor: 0, air: 0 }
    },
    {
        id: 'sweden',
        name: 'İsveç & Baltık Sahili',
        owner: 'neutral',
        terrain: 'mountains',
        industry: 3,
        capital: false,
        x: 660,
        y: 190,
        path: "M 680,50 L 710,80 L 740,125 L 690,185 L 680,240 L 665,260 L 635,305 L 610,320 L 580,275 L 585,240 L 595,185 L 615,140 L 655,90 Z",
        polygon: [[680,50], [710,80], [740,125], [690,185], [680,240], [665,260], [635,305], [610,320], [580,275], [585,240], [595,185], [615,140], [655,90]],
        neighbors: ['norway', 'denmark', 'finland'],
        initialUnits: { infantry: 4, armor: 1, air: 0 }
    },
    {
        id: 'finland',
        name: 'Finlandiya & Karelya',
        owner: 'neutral',
        terrain: 'mountains',
        industry: 2,
        capital: false,
        x: 820,
        y: 150,
        path: "M 710,80 L 770,60 L 810,65 L 855,110 L 985,205 L 945,185 L 870,215 L 825,210 L 765,160 L 740,125 Z",
        polygon: [[710,80], [770,60], [810,65], [855,110], [985,205], [945,185], [870,215], [825,210], [765,160], [740,125]],
        neighbors: ['norway', 'sweden', 'leningrad'],
        initialUnits: { infantry: 4, armor: 0, air: 1 }
    },

    // =========================================================================
    // 5. ITALY & MEDITERRANEAN (THE AUTHENTIC BOOT & SICILY)
    // =========================================================================
    {
        id: 'n_italy',
        name: 'Kuzey İtalya & Milano',
        owner: 'italy',
        terrain: 'city',
        industry: 4,
        capital: false,
        x: 620,
        y: 615,
        path: "M 560,635 L 550,595 L 540,560 L 570,585 L 630,590 L 705,595 L 705,630 L 680,635 L 670,650 L 630,655 L 610,655 L 580,660 L 560,645 Z",
        polygon: [[560,635], [550,595], [540,560], [570,585], [630,590], [705,595], [705,630], [680,635], [670,650], [630,655], [610,655], [580,660], [560,645]],
        neighbors: ['s_france', 'bavaria', 'rome', 'balkans'],
        initialUnits: { infantry: 5, armor: 3, air: 1 }
    },
    {
        id: 'rome',
        name: 'İtalya Çizmesi & Roma',
        owner: 'italy',
        terrain: 'city',
        industry: 5,
        capital: true,
        x: 685,
        y: 750,
        // The Authentic Italian Boot (Calabria toe, Puglia heel, Taranto gulf) + Sicily island
        path: "M 580,660 L 610,655 L 630,655 L 670,650 L 695,680 L 710,715 L 745,725 L 755,750 L 775,770 L 785,790 L 750,785 L 755,820 L 725,850 L 685,780 L 665,760 L 635,730 L 615,705 Z M 720,855 L 730,885 L 685,880 L 655,860 L 680,845 Z",
        polygon: [[580,660], [630,655], [670,650], [695,680], [710,715], [745,725], [775,770], [785,790], [750,785], [755,820], [725,850], [685,780], [665,760], [635,730], [615,705]],
        neighbors: ['n_italy', 'balkans', 'libya'],
        initialUnits: { infantry: 7, armor: 3, air: 2 }
    },

    // =========================================================================
    // 6. CENTRAL & EASTERN EUROPE (BALKANS & DANUBE)
    // =========================================================================
    {
        id: 'hungary',
        name: 'Macaristan & Karpatlar',
        owner: 'germany',
        terrain: 'plains',
        industry: 2,
        capital: false,
        x: 770,
        y: 555,
        path: "M 760,520 L 800,515 L 835,545 L 815,595 L 785,625 L 730,615 L 735,580 L 740,550 L 705,545 L 710,510 Z",
        polygon: [[760,520], [800,515], [835,545], [815,595], [785,625], [730,615], [735,580], [740,550], [705,545], [710,510]],
        neighbors: ['bavaria', 'poland', 'romania', 'balkans'],
        initialUnits: { infantry: 4, armor: 2, air: 0 }
    },
    {
        id: 'romania',
        name: 'Romanya (Ploiești Petrolü)',
        owner: 'germany',
        terrain: 'plains',
        industry: 4,
        capital: false,
        x: 885,
        y: 575,
        path: "M 800,515 L 860,515 L 935,560 L 960,595 L 950,635 L 920,635 L 885,640 L 820,635 L 785,625 L 815,595 L 835,545 Z",
        polygon: [[800,515], [860,515], [935,560], [960,595], [950,635], [920,635], [885,640], [820,635], [785,625], [815,595], [835,545]],
        neighbors: ['hungary', 'ukraine', 'balkans', 'turkey'],
        initialUnits: { infantry: 6, armor: 3, air: 1 }
    },
    {
        id: 'balkans',
        name: 'Balkanlar & Yunanistan',
        owner: 'neutral',
        terrain: 'mountains',
        industry: 3,
        capital: false,
        x: 775,
        y: 690,
        // Dalmatia coast, Greece, Peloponnese fingers (825,820), Aegean and Thrace
        path: "M 705,630 L 730,615 L 785,625 L 820,635 L 885,640 L 920,665 L 915,700 L 865,715 L 855,785 L 825,820 L 830,785 L 815,780 L 800,745 L 780,725 L 750,680 L 725,650 L 715,635 Z",
        polygon: [[705,630], [730,615], [785,625], [820,635], [885,640], [920,665], [915,700], [865,715], [855,785], [825,820], [830,785], [815,780], [800,745], [780,725], [750,680], [725,650], [715,635]],
        neighbors: ['n_italy', 'rome', 'hungary', 'romania', 'turkey'],
        initialUnits: { infantry: 4, armor: 1, air: 0 }
    },

    // =========================================================================
    // 7. SOVIET UNION & EASTERN FRONT
    // =========================================================================
    {
        id: 'baltics',
        name: 'Baltık Devletleri',
        owner: 'ussr',
        terrain: 'plains',
        industry: 2,
        capital: false,
        x: 865,
        y: 330,
        path: "M 825,305 L 870,275 L 880,230 L 910,235 L 915,275 L 910,315 L 890,375 L 860,400 L 845,420 L 820,375 L 830,335 Z",
        polygon: [[825,305], [870,275], [880,230], [910,235], [915,275], [910,315], [890,375], [860,400], [845,420], [820,375], [830,335]],
        neighbors: ['e_prussia', 'poland', 'leningrad', 'moscow', 'ukraine'],
        initialUnits: { infantry: 4, armor: 2, air: 1 }
    },
    {
        id: 'leningrad',
        name: 'Leningrad & Ladoga',
        owner: 'ussr',
        terrain: 'city',
        industry: 4,
        capital: false,
        x: 990,
        y: 220,
        path: "M 910,235 L 950,225 L 985,205 L 1050,175 L 1080,225 L 1040,265 L 990,280 L 945,285 L 915,275 Z",
        polygon: [[910,235], [950,225], [985,205], [1050,175], [1080,225], [1040,265], [990,280], [945,285], [915,275]],
        neighbors: ['finland', 'baltics', 'moscow', 'urals'],
        initialUnits: { infantry: 7, armor: 2, air: 2 }
    },
    {
        id: 'moscow',
        name: 'Moskova & Merkez Rusya',
        owner: 'ussr',
        terrain: 'city',
        industry: 6,
        capital: true,
        x: 1040,
        y: 350,
        path: "M 915,275 L 945,285 L 990,280 L 1040,265 L 1080,225 L 1140,275 L 1180,310 L 1190,380 L 1140,420 L 1070,435 L 1015,440 L 940,390 L 890,375 L 910,315 Z",
        polygon: [[915,275], [945,285], [990,280], [1040,265], [1080,225], [1140,275], [1180,310], [1190,380], [1140,420], [1070,435], [1015,440], [940,390], [890,375], [910,315]],
        neighbors: ['baltics', 'leningrad', 'ukraine', 'stalingrad', 'urals'],
        initialUnits: { infantry: 12, armor: 6, air: 4 }
    },
    {
        id: 'ukraine',
        name: 'Ukrayna & Dinyester',
        owner: 'ussr',
        terrain: 'plains',
        industry: 4,
        capital: false,
        x: 955,
        y: 470,
        // Dnieper basin, Black Sea coast, Crimean Peninsula (990,575)
        path: "M 845,420 L 860,400 L 890,375 L 940,390 L 1015,440 L 1070,435 L 1045,470 L 1080,520 L 1050,535 L 1040,555 L 990,575 L 980,535 L 945,560 L 960,595 L 935,560 L 860,515 L 840,490 Z",
        polygon: [[845,420], [860,400], [890,375], [940,390], [1015,440], [1070,435], [1045,470], [1080,520], [1050,535], [1040,555], [990,575], [980,535], [945,560], [960,595], [935,560], [860,515], [840,490]],
        neighbors: ['poland', 'baltics', 'moscow', 'stalingrad', 'romania', 'caucasus'],
        initialUnits: { infantry: 7, armor: 4, air: 1 }
    },
    {
        id: 'stalingrad',
        name: 'Stalingrad & Aşağı Volga',
        owner: 'ussr',
        terrain: 'city',
        industry: 5,
        capital: false,
        x: 1145,
        y: 460,
        path: "M 1070,435 L 1140,420 L 1190,380 L 1240,390 L 1240,520 L 1180,540 L 1080,520 L 1045,470 Z",
        polygon: [[1070,435], [1140,420], [1190,380], [1240,390], [1240,520], [1180,540], [1080,520], [1045,470]],
        neighbors: ['moscow', 'ukraine', 'caucasus', 'urals'],
        initialUnits: { infantry: 9, armor: 5, air: 2 }
    },
    {
        id: 'caucasus',
        name: 'Kafkaslar & Bakü Petrolü',
        owner: 'ussr',
        terrain: 'mountains',
        industry: 4,
        capital: false,
        x: 1205,
        y: 600,
        // Greater Caucasus, Black Sea coast to Caspian Sea Baku Absheron cape (1310,620)
        path: "M 1080,520 L 1180,540 L 1240,520 L 1265,570 L 1310,620 L 1285,655 L 1250,675 L 1220,675 L 1200,665 L 1145,615 L 1095,575 L 1040,555 Z",
        polygon: [[1080,520], [1180,540], [1240,520], [1265,570], [1310,620], [1285,655], [1250,675], [1220,675], [1200,665], [1145,615], [1095,575], [1040,555]],
        neighbors: ['ukraine', 'stalingrad', 'turkey'],
        initialUnits: { infantry: 6, armor: 3, air: 1 }
    },
    {
        id: 'urals',
        name: 'Urallar & Sanayi Havzası',
        owner: 'ussr',
        terrain: 'mountains',
        industry: 3,
        capital: false,
        x: 1270,
        y: 280,
        path: "M 1050,175 L 1080,225 L 1140,275 L 1180,310 L 1190,380 L 1240,390 L 1330,440 L 1370,350 L 1380,250 L 1340,180 Z",
        polygon: [[1050,175], [1080,225], [1140,275], [1180,310], [1190,380], [1240,390], [1330,440], [1370,350], [1380,250], [1340,180]],
        neighbors: ['leningrad', 'moscow', 'stalingrad'],
        initialUnits: { infantry: 5, armor: 3, air: 1 }
    },

    // =========================================================================
    // 8. IBERIA & MEDITERRANEAN GATES
    // =========================================================================
    {
        id: 'spain',
        name: 'İspanya & Portekiz',
        owner: 'neutral',
        terrain: 'mountains',
        industry: 3,
        capital: false,
        x: 275,
        y: 650,
        // Full Iberian peninsula: Cabo Finisterre, Cabo da Roca, Cadiz, Valencia, Pyrenees
        path: "M 340,560 L 440,580 L 430,615 L 410,645 L 395,685 L 350,755 L 300,770 L 275,775 L 240,765 L 180,760 L 150,755 L 140,690 L 155,615 L 150,580 L 135,545 L 160,525 L 220,530 L 280,540 L 315,545 Z",
        polygon: [[340,560], [440,580], [430,615], [410,645], [395,685], [350,755], [300,770], [275,775], [240,765], [180,760], [150,755], [140,690], [155,615], [150,580], [135,545], [160,525], [220,530], [280,540], [315,545]],
        neighbors: ['s_france', 'gibraltar'],
        initialUnits: { infantry: 4, armor: 1, air: 0 }
    },
    {
        id: 'gibraltar',
        name: 'Cebelitarık Boğazı',
        owner: 'uk',
        terrain: 'coastal',
        industry: 2,
        capital: false,
        x: 275,
        y: 780,
        path: "M 265,770 L 285,770 L 285,790 L 265,790 Z",
        polygon: [[265,770], [285,770], [285,790], [265,790]],
        neighbors: ['spain', 'atlantic', 'morocco_algeria'],
        initialUnits: { infantry: 4, armor: 1, air: 1 }
    },

    // =========================================================================
    // 9. ANATOLIAN BRIDGE & TURKEY
    // =========================================================================
    {
        id: 'turkey',
        name: 'Türkiye & Anadolu',
        owner: 'neutral',
        terrain: 'mountains',
        industry: 3,
        capital: false,
        x: 1060,
        y: 710,
        // Authentic Anatolian Peninsula: Thrace, Bosporus, Sinop cape (1055,630), Aegean, Antalya & Iskenderun gulfs
        path: "M 920,665 L 940,650 L 955,655 L 985,645 L 1020,635 L 1055,630 L 1085,650 L 1150,665 L 1200,665 L 1220,675 L 1240,725 L 1210,770 L 1165,775 L 1125,780 L 1100,790 L 1075,795 L 1030,810 L 995,810 L 965,805 L 940,795 L 930,765 L 930,730 L 935,710 L 915,700 Z",
        polygon: [[920,665], [940,650], [955,655], [985,645], [1020,635], [1055,630], [1085,650], [1150,665], [1200,665], [1220,675], [1240,725], [1210,770], [1165,775], [1125,780], [1100,790], [1075,795], [1030,810], [995,810], [965,805], [940,795], [930,765], [930,730], [935,710], [915,700]],
        neighbors: ['romania', 'balkans', 'caucasus', 'middle_east', 'egypt'],
        initialUnits: { infantry: 5, armor: 2, air: 1 }
    },

    // =========================================================================
    // 10. NORTH AFRICA THEATER & MIDDLE EAST
    // =========================================================================
    {
        id: 'morocco_algeria',
        name: 'Fas & Cezayir',
        owner: 'uk',
        terrain: 'desert',
        industry: 2,
        capital: false,
        x: 380,
        y: 835,
        // North African coast from Tangier to Tunis, Atlas mountains and Sahara
        path: "M 270,795 L 350,785 L 415,780 L 475,780 L 535,785 L 540,825 L 535,885 L 450,890 L 320,890 L 210,885 L 230,830 Z",
        polygon: [[270,795], [350,785], [415,780], [475,780], [535,785], [540,825], [535,885], [450,890], [320,890], [210,885], [230,830]],
        neighbors: ['gibraltar', 'libya'],
        initialUnits: { infantry: 3, armor: 2, air: 1 }
    },
    {
        id: 'libya',
        name: 'Trablus & Libya',
        owner: 'italy',
        terrain: 'desert',
        industry: 3,
        capital: false,
        x: 690,
        y: 840,
        // Gulf of Sidra (Sirte) deep crescent curve (680,850), Benghazi/Cyrenaica, Tobruk
        path: "M 535,785 L 585,810 L 630,825 L 680,850 L 735,815 L 780,800 L 830,805 L 850,810 L 850,885 L 750,890 L 535,885 L 540,825 Z",
        polygon: [[535,785], [585,810], [630,825], [680,850], [735,815], [780,800], [830,805], [850,810], [850,885], [750,890], [535,885], [540,825]],
        neighbors: ['morocco_algeria', 'rome', 'egypt'],
        initialUnits: { infantry: 5, armor: 4, air: 1 }
    },
    {
        id: 'egypt',
        name: 'Mısır & İskenderiye',
        owner: 'uk',
        terrain: 'desert',
        industry: 4,
        capital: false,
        x: 935,
        y: 845,
        // Nile Delta, Alexandria, Suez Canal, and Sinai Peninsula (1030,890)
        path: "M 850,810 L 900,810 L 930,805 L 960,800 L 990,805 L 1020,805 L 1040,865 L 1030,890 L 1000,860 L 960,845 L 960,890 L 850,885 Z",
        polygon: [[850,810], [900,810], [930,805], [960,800], [990,805], [1020,805], [1040,865], [1030,890], [1000,860], [960,845], [960,890], [850,885]],
        neighbors: ['libya', 'middle_east', 'turkey'],
        initialUnits: { infantry: 7, armor: 3, air: 2 }
    },
    {
        id: 'middle_east',
        name: 'Suriye & Orta Doğu',
        owner: 'uk',
        terrain: 'desert',
        industry: 3,
        capital: false,
        x: 1140,
        y: 825,
        // Levant, Fertile Crescent, Tigris & Euphrates, Arabian Desert
        path: "M 1020,805 L 1025,790 L 1035,765 L 1050,750 L 1100,790 L 1125,780 L 1165,775 L 1210,770 L 1240,810 L 1270,875 L 1260,890 L 1120,885 L 1040,865 Z",
        polygon: [[1020,805], [1025,790], [1035,765], [1050,750], [1100,790], [1125,780], [1165,775], [1210,770], [1240,810], [1270,875], [1260,890], [1120,885], [1040,865]],
        neighbors: ['egypt', 'turkey'],
        initialUnits: { infantry: 4, armor: 2, air: 1 }
    }
];
