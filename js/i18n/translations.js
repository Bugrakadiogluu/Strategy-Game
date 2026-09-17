/**
 * translations.js - Complete Trilingual Localization (Türkçe, English, 日本語)
 * WAR ROOM 1942: Grand Strategy Game Engine
 */

export const TRANSLATIONS = {
    tr: {
        // Brand & Header
        game_title: "WAR ROOM 1942",
        status_turn: "TUR",
        commander_turn: "KOMUTAN / SIRA",
        industry_points: "SANAYİ PUANI",
        campaign_phase: "HAREKAT AŞAMASI",
        phase_1_name: "AŞAMA 1: ÜRETİM & TAKVİYE",
        phase_2_name: "AŞAMA 2: ASKERİ TAARRUZ",
        btn_next_to_combat: "HAREKAT AŞAMASINA GEÇ",
        btn_end_turn: "TURU BİTİR",
        btn_sound_on: "Ses: Açık",
        btn_sound_off: "Ses: Kapalı",
        btn_save: "Kaydet",
        btn_load: "Yükle",
        btn_room_prefix: "Oda:",
        room_copied: "Oda Kodu Kopyalandı:",
        zoom_in: "+",
        zoom_out: "-",
        zoom_reset: "Haritayı Ortala",
        zoom_reset_title: "Haritayı Ortala & Görünümü Sıfırla",

        // Navigation Tabs
        tab_production: "ÜRETİM",
        tab_combat: "TAARRUZ",
        tab_movement: "İNTİKAL",
        tab_intel: "İSTİHBARAT",
        tab_radio: "TELSİZ",

        // Tab 1: Production
        title_selected_garrison: "SEÇİLİ GARNİZON ÜSSÜ",
        hint_select_garrison: "Haritadan asker takviyesi yapmak istediğiniz kontrolünüzdeki bir bölgeye tıklayın.",
        title_unit_procurement: "BİRİM TEDARİK VE REZERV",
        unit_inf_name: "Piyade Taburu",
        unit_inf_desc: "Maliyet: 3 IP | Savunma Odaklı",
        unit_arm_name: "Panzer / Zırhlı Birlik",
        unit_arm_desc: "Maliyet: 6 IP | Taarruz Yarma Gücü",
        unit_air_name: "Hava Filosu (Avcı/Bombardıman)",
        unit_air_desc: "Maliyet: 8 IP | Hava Bombardımanı & Destek",
        btn_deploy_units: "BİRLİKLERİ BÖLGEYE KONUŞLANDIR",
        btn_deploy_disabled: "YALNIZCA DOST BÖLGEYE TAKVİYE YAPILABİLİR",
        select_region_prompt: "Bölge Seçiniz",

        // Tab 2: Combat
        title_frontline_combat: "TAARRUZ VE CEPHE HATTI",
        label_origin_base: "Çıkış / Üs:",
        label_target_front: "Hedef / Cephe:",
        hint_select_combat_targets: "Haritadan önce kendi bölgenize, ardından saldırmak istediğiniz komşu düşman bölgesine tıklayın.",
        hint_select_origin_first: "Haritadan çıkış bölgesi seçin",
        hint_select_target_second: "Haritadan komşu hedef bölge seçin",
        slider_attack_inf: "Taarruz Piyadesi",
        slider_attack_arm: "Taarruz Panzeri",
        slider_air_sortie: "Hava Sortisi",
        btn_ground_assault: "KARA HAREKATI BAŞLAT",
        btn_air_strike: "STRATEJİK HAVA HAREKATI",
        btn_blitzkrieg: "BLITZKRIEG (YILDIRIM TAARRUZU)",
        terrain_label: "Arazi:",
        defense_bonus_label: "Savunma Bonusu:",

        // Tab 3: Movement
        title_strategic_movement: "STRATEJİK İNTİKAL VE LOJİSTİK",
        hint_movement: "Dost bölgeleriniz arasında birliklerinizi kaydırarak cephe hattınızı güçlendirin.",
        slider_move_inf: "Taşınacak Piyade",
        slider_move_arm: "Taşınacak Panzer",
        slider_move_air: "Taşınacak Uçak",
        btn_execute_move: "İNTİKAL EMRİ VER",

        // Tab 4: Intel
        title_balance_of_power: "AVRUPA SANAYİ VE HAKİMİYET DENGESİ",
        label_axis: "Mihver",
        label_allies: "Müttefikler",
        victory_conditions: "Zafer Koşulu: Toplam sanayinin %70'ine hakim olmak veya düşman ittifakın iki ana başkentini ele geçirmek.",
        title_strategic_capitals: "STRATEJİK BAŞKENTLER",
        capital_controlled_by: "Kontrol",

        // Tab 5: Radio
        title_radio_terminal: "ASKERİ TELSİZ VE CERİDE RAPORLARI",
        chat_placeholder: "Telsiz mesajı girin...",
        btn_send_chat: "GÖNDER",

        // Lobby Modal
        lobby_title: "2. DÜNYA SAVAŞI KOMUTA MERKEZİ",
        lobby_subtitle: "WebRTC P2P Sıra Tabanlı Strateji Motoru. Lobi kurarak arkadaşlarınızı davet edin veya doğrudan bilgisayara karşı tek oyunculu sefere başlayın.",
        mode_singleplayer_title: "TEK OYUNCULU",
        mode_singleplayer_desc: "Bilgisayara karşı tek başınıza hemen oynayın. İnternet veya sunucu gerektirmez (%100 Çevrimdışı).",
        mode_host_title: "LOBİ KUR (HOST)",
        mode_host_desc: "6 haneli oda kodu üretir. Oyun motorunun otoriter sunucusu (Authoritative Host) olun.",
        lobby_join_title: "ODAYA KATIL (CLIENT)",
        lobby_join_placeholder: "6 HANELİ ODA KODU (ÖRN: W2-7A9B)",
        btn_lobby_join: "BAĞLAN",
        label_select_faction: "KOMUTA EDİLECEK ÜLKE SEÇİMİ:",
        label_commander_name: "KOMUTAN ADI:",
        btn_start_singleplayer: "HAREKATI HEMEN BAŞLAT (TEK OYUNCULU)",
        btn_start_host: "LOBİ OLUŞTUR VE TOPLANMAYA BAŞLA",
        lang_switch_label: "DİL / LANGUAGE / 言語:",

        // Waiting Room & Hot-Join
        waiting_room_title: "ASKERİ TOPLANMA ODASI (BEKLEME LOBİSİ)",
        waiting_room_subtitle: "Oda kodunu arkadaşlarınızla paylaşın. Katılmayan ülkeler otomatik olarak Yapay Zeka (Bot) tarafından yönetilecektir.",
        room_code_label: "ODA KODU:",
        btn_copy_code: "Kodu Kopyala",
        btn_copy_link: "Davet Linki Kopyala",
        btn_leave_lobby: "Lobiden Ayrıl",
        btn_start_campaign_now: "HAREKATI BAŞLAT (HERKESİ SAVAŞA SOK)",
        hotjoin_modal_title: "SAVAŞA KATIL (KOMUTAYI DEVRAL)",
        hotjoin_modal_desc: "Host katılımınızı onayladı! Savaş alanında halen aktif olan ve botlar tarafından yönetilen bir ülkeyi seçin:",
        btn_claim_and_battle: "KOMUTAYI AL VE SAVAŞA GİR",
        toast_code_copied: "Oda kodu panoya kopyalandı!",
        toast_link_copied: "Davet linki panoya kopyalandı!",
        hotjoin_prompt_title: "SAVAŞA KATILIM İSTEĞİ",
        hotjoin_prompt_desc: "devam eden savaşa katılmak istiyor!",
        btn_hotjoin_accept: "KABUL ET",
        toast_hotjoin_rejected: "Host katılım isteğinizi reddetti.",
        toast_hotjoin_no_factions: "Savaş alanında komuta edilecek uygun bot ülke kalmadı!",

        // Developer Portfolio
        btn_developer: "Yapan Kişi",
        btn_developer_credit_full: "Geliştirici: Buğra Kadıoğlu (İş Teklifleri İçin Portföy)",
        dev_modal_title: "Buğra Kadıoğlu | Portföy",
        dev_modal_offer: "İş teklifleri bekliyorum!",
        dev_modal_desc: "Geliştiricinin portföy linki (bugrakadioglu.dev) yeni sekmede açılacaktır. Onaylıyor musunuz?",
        btn_dev_proceed: "Ziyaret Et (Onayla)",
        btn_cancel: "İptal",

        // Strategic Briefing Modal
        header_player_command: "SİZİN KOMUTANIZ:",
        briefing_modal_title: "STRATEJİK HAREKAT DİREKTİFİ",
        briefing_modal_subtitle: "Avrupa & Akdeniz Harp Sahası Görev Emri",
        briefing_nation_directive_title: "MİLLİ HAREKAT STRATEJİSİ",
        briefing_key_tips_title: "TEMEL HARP İPUÇLARI",
        briefing_tip_1: "1. İkmal & Üretim: Dost bir bölgenize tıklayın, Sanayi Puanınızla (IP) piyade, panzer veya uçak konuşlandırın.",
        briefing_tip_2: "2. Taarruz Planı: Çıkış üssünüzü ve komşu düşman bölgesini seçip taarruz veya stratejik hava sortisi emri verin.",
        briefing_tip_3: "3. Taktik İntikal: Dost bölgeleriniz arasında birlik kaydırarak cephe hattınızı güçlendirin.",
        briefing_tip_4: "4. Zafer Koşulu: Avrupa sanayisinin %70'ini ele geçirin veya düşman ittifakın 2 ana başkentini düşürün.",
        briefing_dont_show: "Bu brifingi başlangıçta bir daha gösterme",
        btn_briefing_enter: "KOMUTAYI AL VE HAREKATA BAŞLA",


        // Combat Report Modal
        combat_modal_title: "MUHAREBE RAPORU",
        combat_attacker: "TAARRUZ EDEN",
        combat_defender: "SAVUNAN",
        combat_losses: "Kayıplar",
        combat_remains: "Kalan Kuvvet",
        combat_air_losses: "Uçak Kaybı",
        combat_rounds_title: "MUHAREBE ÇATIŞMA KAYITLARI",
        btn_close_combat_modal: "KAPAT & DEVAM ET",
        combat_victory: "TAARRUZ BAŞARILI! BÖLGE ELE GEÇİRİLDİ",
        combat_defeat: "TAARRUZ PÜSKÜRTÜLDÜ! SAVUNMA DÜŞMEDİ",

        // Game Over Modal
        game_over_victory: "ZAFER! AVRUPA ÖZGÜRLEŞTİRİLDİ",
        game_over_defeat: "YENİLGİ! CEPHEDE ÇÖKÜŞ",
        btn_restart: "YENİ HAREKAT BAŞLAT",

        // Toasts & Messages
        toast_not_enough_ip: "Yetersiz Sanayi Puanı!",
        toast_select_at_least_one: "En az bir birlik seçmelisiniz.",
        toast_select_friendly_region: "Lütfen önce asker yerleştirilecek dost bölgenizi seçin!",
        toast_select_enemy_target: "Lütfen geçerli bir komşu düşman bölgesi seçin!",
        toast_enter_code: "Lütfen 6 haneli oda kodunu girin.",
        toast_turn_yours: "Sıra Sizde! Komutan:",
        toast_game_saved: "Oyun tarayıcı hafızasına kaydedildi.",
        toast_game_loaded: "Kayıtlı oyun başarıyla yüklendi.",
        toast_no_save_found: "Kayıtlı oyun bulunamadı.",
        toast_map_centered: "Harita ortalandı ve taktik görünüm sıfırlandı.",
        zoom_homeland: "Ülkeme Odaklan",
        zoom_homeland_title: "Başkente ve Ana Sahaya Odaklan",
        zoom_reset: "Tüm Harita",
        zoom_reset_title: "Tüm Kıta / Genel Bakış",

        // Factions
        faction_germany_name: "Almanya",
        faction_uk_name: "Birleşik Krallık",
        faction_ussr_name: "Sovyetler Birliği",
        faction_italy_name: "İtalya",
        faction_france_name: "Fransa",
        faction_spain_name: "İspanya",
        faction_turkey_name: "Türkiye",
        slot_bot_name: "Yapay Zeka (Bot)",
        slot_host_badge: "HOST",
        slot_player_badge: "OYUNCU",
        slot_bot_badge: "BOT",
        odds_no_units: "Birlik Tahsis Edilmedi",
        odds_no_selection: "Seçim Yapılmadı",
        odds_overwhelming: "Ezici Üstünlük",
        odds_advantage: "Taarruz Avantajı",
        odds_balanced: "Dengeli",
        odds_risky: "Yüksek Risk / Savunma Üstün",
        factions: {
            germany: { 
                name: "Almanya", 
                fullName: "German Reich", 
                desc: "Almanya (Mihver - 15 Bölge & Ezici Panzer Gücü)",
                directiveTitle: "Yıldırım Taarruzu (Blitzkrieg) & Sanayi Üstünlüğü",
                directiveDesc: "Ruhr, Berlin ve Viyana'daki devasa panzer ve sanayi gücünüzle Batı ve Doğu cephelerinde hızlı yarmalar yapın. Müttefikler mobilize olmadan önce Fransa ve Doğu Avrupa'yı kontrol altına alın.",
                allianceName: "MİHVER İTTİFAKI (AXIS)"
            },
            uk: { 
                name: "Birleşik Krallık", 
                fullName: "United Kingdom", 
                desc: "Birleşik Krallık (Müttefikler - 10 Bölge & Kraliyet Donanması/Akdeniz)",
                directiveTitle: "Ada Savunması & Kraliyet Hava/Deniz Üstünlüğü",
                directiveDesc: "İngiltere Adası, Cebelitarık ve Süveyş hattını koruyun. Stratejik hava bombardımanları ile Mihver sanayisini yıpratıp Akdeniz ve kıta çıkarması hazırlayın.",
                allianceName: "MÜTTEFİK GÜÇLER (ALLIES)"
            },
            ussr: { 
                name: "Sovyetler Birliği", 
                fullName: "Soviet Union", 
                desc: "Sovyetler Birliği (Müttefikler - 10 Bölge & Muazzam Derinlik)",
                directiveTitle: "Muazzam İnsan Gücü & Derin Savunma Hatları",
                directiveDesc: "Geniş coğrafyanızı ve zengin insan gücünüzü kullanarak ilk taarruzları göğüsleyin. Moskova, Stalingrad ve Leningrad tahkimatlarını koruyup Ural ağır sanayisiyle karşı taarruza geçin.",
                allianceName: "MÜTTEFİK GÜÇLER (ALLIES)"
            },
            italy: { 
                name: "İtalya", 
                fullName: "Kingdom of Italy", 
                desc: "İtalya (Mihver - 8 Bölge & Akdeniz-Kuzey Afrika)",
                directiveTitle: "Akdeniz Hakimiyeti & Çöl Lojistiği",
                directiveDesc: "Roma, Po Ovası ve Kuzey Afrika çöl cephesini kontrol altında tutun. Süveyş ve Mısır yönünde ilerleyerek Mihver ittifakının güney kanadını güvenceye alın.",
                allianceName: "MİHVER İTTİFAKI (AXIS)"
            },
            france: { 
                name: "Fransa", 
                fullName: "République Française", 
                desc: "Fransa (Müttefikler - 6 Bölge & Batı Kalesi)",
                directiveTitle: "Kıta Savunması & Maginot Direnişi",
                directiveDesc: "Paris ve Normandiya'dan Cezayir'e uzanan Fransız topraklarını Mihver saldırılarına karşı savunun, müttefiklerle ortak taarruz organize edin.",
                allianceName: "MÜTTEFİK GÜÇLER (ALLIES)"
            },
            spain: { 
                name: "İspanya", 
                fullName: "Estado Español", 
                desc: "İspanya (Mihver Eğilimli / Bağımsız - 5 İberya Bölgesi)",
                directiveTitle: "İberya Yarımadası & Cebelitarık Kontrolü",
                directiveDesc: "Madrid, Katalonya ve Endülüs'ü tahkim edin. Cebelitarık Boğazı ve Akdeniz batı kapısını denetleyerek stratejik üstünlük sağlayın.",
                allianceName: "MİHVER İTTİFAKI (AXIS)"
            },
            turkey: { 
                name: "Türkiye", 
                fullName: "Türkiye Cumhuriyeti", 
                desc: "Türkiye (Müttefik / Bağımsız - 5 Anadolu Bölgesi & Boğazlar)",
                directiveTitle: "Boğazlar Hakimiyeti & Millî Savunma",
                directiveDesc: "Ankara ve İstanbul Boğazı tahkimatlarını koruyun. Balkanlar ve Kafkasya dengesinde Anadolu'yu aşılmaz bir kale haline getirin.",
                allianceName: "MÜTTEFİK GÜÇLER (ALLIES)"
            },
            neutral: { name: "Tarafsızlar", fullName: "Neutral Nations", desc: "Tarafsız Tampon Bölgeler (İsveç, Norveç, İsviçre, Balkanlar vb.)" }
        },

        // Regions
        regions: {
            atlantic: "Atlantik Konvoy Hattı",
            ireland: "İrlanda Adası",
            scotland: "İskoçya & Hebridler",
            midlands: "İngiltere Midlands & Galler",
            london: "Londra & Güney İngiltere",
            normandy: "Normandiya & Bretonya",
            paris: "Paris & Île-de-France",
            aquitaine: "Akitanya & Bordeaux",
            lyon: "Lyon & Rhône Vadisi",
            marseille: "Marsilya & Provence",
            algeria: "Cezayir & Fransız Kuzey Afrika",
            madrid: "Madrid & Yeni Kastilya",
            galicia: "Galiçya & Bask Bölgesi",
            catalonia: "Katalonya & Barselona",
            valencia: "Valensiya & Doğu İspanya",
            andalusia: "Endülüs & Sevilla",
            gibraltar: "Cebelitarık Boğazı",
            berlin: "Berlin & Brandenburg",
            ruhr: "Ruhr & Rhineland",
            hamburg: "Hamburg & Aşağı Saksonya",
            saxony: "Saksonya & Leipzig",
            bavaria: "Bavyera & Münih",
            austria: "Avusturya & Viyana",
            sudeten: "Südetler & Sınır Tahkimatı",
            bohemia: "Bohemya & Prag",
            silesia: "Silezya & Breslau Sanayisi",
            pomerania: "Pomeranya & Baltık Kıyısı",
            e_prussia: "Doğu Prusya & Königsberg",
            warsaw: "Varşova & Vistül Havzası",
            denmark: "Danimarka (Jutland)",
            hungary: "Macaristan & Budapeşte",
            romania: "Romanya & Ploiești Petrolü",
            n_italy: "Kuzey İtalya & Milano",
            tuscany: "Toskana & Floransa",
            rome: "Roma & Lazio",
            s_italy: "Güney İtalya & Napoli",
            sicily: "Sicilya Adası",
            sardinia: "Sardinya & Korsika",
            tripoli: "Trablusgarp (Batı Libya)",
            cyrenaica: "Sirenayka & Bingazi",
            ankara: "Ankara & İç Anadolu",
            istanbul_thrace: "İstanbul & Boğazlar (Trakya)",
            izmir_aegean: "İzmir & Ege Bölgesi",
            antalya_med: "Antalya & Akdeniz",
            erzurum_east: "Erzurum & Doğu Anadolu",
            moscow: "Moskova & Kremlin",
            leningrad: "Leningrad & Ladoga",
            smolensk: "Smolensk & Merkez Rusya",
            minsk: "Minsk & Belarus",
            kiev: "Kiev & Dinyeper Havzası",
            donbass: "Donbass & Harkov",
            crimea: "Kırım & Sivastopol",
            stalingrad: "Stalingrad & Volga",
            caucasus: "Kafkaslar & Bakü Petrolü",
            urals: "Urallar & Ağır Sanayi",
            malta: "Malta & Orta Akdeniz",
            cyprus: "Kıbrıs Adası",
            alexandria: "Mısır & İskenderiye",
            suez: "Kahire & Süveyş Kanalı",
            levant: "Suriye & Levant",
            iraq: "Irak & Basra Petrolü",
            benelux: "Benelüks (Hollanda & Belçika)",
            switzerland: "İsviçre Alpleri (Tarafsız)",
            norway: "Norveç Fiyortları",
            sweden: "İsveç & Demir Yatakları",
            finland: "Finlandiya & Karelya",
            balkans: "Balkanlar & Belgrad"
        },

        // Terrains
        terrains: {
            plains: "Düzlük & Bozkır",
            mountains: "Dağlık Arazi",
            coastal: "Sahil & Kıyı Hattı",
            urban: "Şehir & Tahkimat"
        },

        // Seas & Oceans
        seas: {
            atlantic_ocean: "KUZEY ATLANTİK OKYANUSU",
            north_sea: "KUZEY DENİZİ",
            baltic_sea: "BALTIK DENİZİ",
            west_med: "BATI AKDENİZ",
            east_med: "ORTA VE DOĞU AKDENİZ",
            black_sea: "KARADENİZ",
            caspian_sea: "HAZAR DENİZİ"
        }
    },

    en: {
        // Brand & Header
        game_title: "WAR ROOM 1942",
        status_turn: "TURN",
        commander_turn: "COMMANDER / TURN",
        industry_points: "INDUSTRY POINTS",
        campaign_phase: "CAMPAIGN PHASE",
        phase_1_name: "PHASE 1: PRODUCTION & REINFORCEMENTS",
        phase_2_name: "PHASE 2: MILITARY OPERATIONS & COMBAT",
        btn_next_to_combat: "ADVANCE TO COMBAT PHASE",
        btn_end_turn: "END TURN",
        btn_sound_on: "Sound: On",
        btn_sound_off: "Sound: Off",
        btn_save: "Save",
        btn_load: "Load",
        btn_room_prefix: "Room:",
        room_copied: "Room Code Copied:",
        zoom_in: "+",
        zoom_out: "-",
        zoom_reset: "Center Map",
        zoom_reset_title: "Center Map & Reset View",

        // Navigation Tabs
        tab_production: "PRODUCTION",
        tab_combat: "COMBAT",
        tab_movement: "MOVEMENT",
        tab_intel: "INTEL",
        tab_radio: "RADIO",

        // Tab 1: Production
        title_selected_garrison: "SELECTED GARRISON BASE",
        hint_select_garrison: "Click on a territory under your command on the map to deploy reinforcements.",
        title_unit_procurement: "UNIT PROCUREMENT & RESERVES",
        unit_inf_name: "Infantry Division",
        unit_inf_desc: "Cost: 3 IP | Defense Specialist",
        unit_arm_name: "Panzer / Armor Division",
        unit_arm_desc: "Cost: 6 IP | Assault Breakthrough",
        unit_air_name: "Air Wing (Fighters/Bombers)",
        unit_air_desc: "Cost: 8 IP | Aerial Bombardment & Strike",
        btn_deploy_units: "DEPLOY UNITS TO REGION",
        btn_deploy_disabled: "REINFORCEMENTS ONLY IN FRIENDLY TERRITORIES",
        select_region_prompt: "Select Territory",

        // Tab 2: Combat
        title_frontline_combat: "FRONTLINE COMBAT OPERATIONS",
        label_origin_base: "Origin Base:",
        label_target_front: "Target Front:",
        hint_select_combat_targets: "First click your territory, then click an adjacent enemy territory to launch an attack.",
        hint_select_origin_first: "Select launching territory on map",
        hint_select_target_second: "Select adjacent enemy target on map",
        slider_attack_inf: "Attacking Infantry",
        slider_attack_arm: "Attacking Armor",
        slider_air_sortie: "Air Sorties",
        btn_ground_assault: "LAUNCH GROUND ASSAULT",
        btn_air_strike: "STRATEGIC AIR STRIKE",
        btn_blitzkrieg: "BLITZKRIEG (LIGHTNING ASSAULT)",
        terrain_label: "Terrain:",
        defense_bonus_label: "Defense Bonus:",

        // Tab 3: Movement
        title_strategic_movement: "STRATEGIC REPOSITIONING & LOGISTICS",
        hint_movement: "Shift forces between adjacent friendly regions to reinforce vulnerable defensive lines.",
        slider_move_inf: "Infantry to Move",
        slider_move_arm: "Armor to Move",
        slider_move_air: "Air to Move",
        btn_execute_move: "ORDER REPOSITIONING",

        // Tab 4: Intel
        title_balance_of_power: "EUROPEAN INDUSTRIAL DOMINANCE",
        label_axis: "Axis",
        label_allies: "Allies",
        victory_conditions: "Victory Condition: Control 70% of European industry or capture two major enemy capitals.",
        title_strategic_capitals: "STRATEGIC CAPITALS",
        capital_controlled_by: "Controlled by",

        // Tab 5: Radio
        title_radio_terminal: "MILITARY RADIO & BATTLE DISPATCHES",
        chat_placeholder: "Type military dispatch...",
        btn_send_chat: "SEND",

        // Lobby Modal
        lobby_title: "WAR ROOM 1942: SUPREME HEADQUARTERS",
        lobby_subtitle: "Serverless WebRTC P2P Turn-Based Strategy Engine. Host a multiplayer room with friends or launch an immediate solo campaign against autonomous AI.",
        mode_singleplayer_title: "SOLO CAMPAIGN",
        mode_singleplayer_desc: "Play instantly against autonomous AI. Zero servers or setup required (100% Offline).",
        mode_host_title: "HOST MULTIPLAYER",
        mode_host_desc: "Generates a 6-digit room code. Your browser acts as the authoritative match engine.",
        lobby_join_title: "JOIN ROOM (CLIENT)",
        lobby_join_placeholder: "6-DIGIT ROOM CODE (E.G. W2-7A9B)",
        btn_lobby_join: "CONNECT",
        label_select_faction: "SELECT YOUR FACTION:",
        label_commander_name: "COMMANDER NAME:",
        btn_start_singleplayer: "LAUNCH CAMPAIGN (SOLO PLAY)",
        btn_start_host: "CREATE ROOM & OPEN GATHERING LOBBY",
        lang_switch_label: "LANGUAGE / DİL / 言語:",

        // Waiting Room & Hot-Join
        waiting_room_title: "MILITARY BRIEFING ROOM (GATHERING LOBBY)",
        waiting_room_subtitle: "Share the room code with friends. Unclaimed factions will automatically be commanded by autonomous AI bots.",
        room_code_label: "ROOM CODE:",
        btn_copy_code: "Copy Code",
        btn_copy_link: "Copy Invite Link",
        btn_leave_lobby: "Leave Lobby",
        btn_start_campaign_now: "LAUNCH CAMPAIGN (START WAR FOR ALL)",
        hotjoin_modal_title: "JOIN ONGOING BATTLE (TAKE COMMAND)",
        hotjoin_modal_desc: "Host approved your request! Choose an active faction currently commanded by an AI bot:",
        btn_claim_and_battle: "CLAIM COMMAND & ENTER BATTLE",
        toast_code_copied: "Room code copied to clipboard!",
        toast_link_copied: "Invite link copied to clipboard!",
        hotjoin_prompt_title: "REINFORCEMENT REQUEST",
        hotjoin_prompt_desc: "wants to join the ongoing war!",
        btn_hotjoin_accept: "APPROVE",
        toast_hotjoin_rejected: "Host rejected your join request.",
        toast_hotjoin_no_factions: "No available bot-commanded factions remaining!",

        // Developer Portfolio
        btn_developer: "Created By",
        btn_developer_credit_full: "Developer: Buğra Kadıoğlu (Portfolio for Job Offers)",
        dev_modal_title: "Buğra Kadıoğlu | Portfolio",
        dev_modal_offer: "Open for job opportunities!",
        dev_modal_desc: "The developer's portfolio link (bugrakadioglu.dev) will open in a new tab. Do you confirm?",
        btn_dev_proceed: "Visit (Confirm)",
        btn_cancel: "Cancel",

        // Strategic Briefing Modal
        header_player_command: "YOUR COMMAND:",
        briefing_modal_title: "STRATEGIC CAMPAIGN DIRECTIVE",
        briefing_modal_subtitle: "European & Mediterranean Theater of War",
        briefing_nation_directive_title: "NATIONAL STRATEGY & OBJECTIVES",
        briefing_key_tips_title: "ESSENTIAL WARFARE DIRECTIVES",
        briefing_tip_1: "1. Procurement & Reserves: Click any friendly territory to recruit Infantry, Panzer Armor, or Air Wings using Industry Points (IP).",
        briefing_tip_2: "2. Tactical Combat: Select your origin base and an adjacent hostile territory to execute ground assaults or strategic air strikes.",
        briefing_tip_3: "3. Strategic Movement: Relocate garrison units between connected friendly territories to reinforce contested frontlines.",
        briefing_tip_4: "4. Victory Condition: Control 70% of total European industry or capture 2 opposing enemy capital cities.",
        briefing_dont_show: "Do not show this briefing again on startup",
        btn_briefing_enter: "ASSUME COMMAND & ENTER WAR ROOM",


        // Combat Report Modal
        combat_modal_title: "AFTER-ACTION REPORT (AAR)",
        combat_attacker: "ATTACKING FORCE",
        combat_defender: "DEFENDING FORCE",
        combat_losses: "Casualties",
        combat_remains: "Survivors",
        combat_air_losses: "Air Losses",
        combat_rounds_title: "ROUND-BY-ROUND ENGAGEMENT LOG",
        btn_close_combat_modal: "CLOSE & PROCEED",
        combat_victory: "VICTORY! ENEMY LINE BROKEN & REGION CAPTURED",
        combat_defeat: "ASSAULT REPELLED! DEFENDING FORCES HELD",

        // Game Over Modal
        game_over_victory: "VICTORY! EUROPE IS LIBERATED",
        game_over_defeat: "DEFEAT! STRATEGIC COLLAPSE",
        btn_restart: "START NEW CAMPAIGN",

        // Toasts & Messages
        toast_not_enough_ip: "Insufficient Industry Points!",
        toast_select_at_least_one: "You must commit at least one unit.",
        toast_select_friendly_region: "Please select a friendly territory to deploy troops.",
        toast_select_enemy_target: "Please select an adjacent enemy territory to target.",
        toast_enter_code: "Please enter a 6-digit room code.",
        toast_turn_yours: "It's Your Turn! Commander:",
        toast_game_saved: "Game saved to browser storage.",
        toast_game_loaded: "Saved campaign restored successfully.",
        toast_no_save_found: "No saved campaign found in storage.",
        toast_map_centered: "Map centered & tactical view reset.",
        zoom_homeland: "Focus Homeland",
        zoom_homeland_title: "Center on Capital & Homeland",
        zoom_reset: "All Theater",
        zoom_reset_title: "Full Continental Overview",

        // Factions
        faction_germany_name: "Germany",
        faction_uk_name: "United Kingdom",
        faction_ussr_name: "Soviet Union",
        faction_italy_name: "Italy",
        faction_france_name: "France",
        faction_spain_name: "Spain",
        faction_turkey_name: "Turkey",
        slot_bot_name: "Artificial Intelligence (Bot)",
        slot_host_badge: "HOST",
        slot_player_badge: "PLAYER",
        slot_bot_badge: "BOT",
        odds_no_units: "No Units Assigned",
        odds_no_selection: "No Selection",
        odds_overwhelming: "Decisive Superiority",
        odds_advantage: "Offensive Advantage",
        odds_balanced: "Balanced",
        odds_risky: "High Risk / Defense Favored",
        factions: {
            germany: { 
                name: "Germany", 
                fullName: "German Reich", 
                desc: "Germany (Axis - 15 Territories & High Panzer Strength)",
                directiveTitle: "Blitzkrieg & Industrial Supremacy",
                directiveDesc: "Leverage formidable Panzer divisions in Ruhr, Berlin, and Vienna to strike swiftly across Europe before Allied mobilization.",
                allianceName: "AXIS POWERS"
            },
            uk: { 
                name: "United Kingdom", 
                fullName: "United Kingdom", 
                desc: "United Kingdom (Allies - 10 Territories & Royal Navy/Mediterranean)",
                directiveTitle: "Island Fortress & Royal Navy",
                directiveDesc: "Defend the British Isles, Gibraltar, and the Suez Canal. Soften enemy industrial hubs with strategic air strikes before launching mainland invasions.",
                allianceName: "ALLIED POWERS"
            },
            ussr: { 
                name: "Soviet Union", 
                fullName: "Soviet Union", 
                desc: "Soviet Union (Allies - 10 Territories & Strategic Depth)",
                directiveTitle: "Immense Manpower & Strategic Depth",
                directiveDesc: "Absorb initial Axis pushes across vast territories. Fortify Moscow, Stalingrad, and Leningrad while mobilizing Ural heavy industry for massive counter-offensives.",
                allianceName: "ALLIED POWERS"
            },
            italy: { 
                name: "Italy", 
                fullName: "Kingdom of Italy", 
                desc: "Italy (Axis - 8 Territories & Mediterranean-North Africa)",
                directiveTitle: "Mediterranean Dominance & North Africa",
                directiveDesc: "Dominate the Mediterranean sea lanes and advance through North Africa towards Egypt and Suez, securing the Axis southern flank.",
                allianceName: "AXIS POWERS"
            },
            france: { 
                name: "France", 
                fullName: "French Republic", 
                desc: "France (Allies - 6 Territories & Western Bastion)",
                directiveTitle: "Continental Defense & Resistance",
                directiveDesc: "Defend Paris, Normandy, and French North Africa against Axis incursions, coordinating joint offensives with British and Allied forces.",
                allianceName: "ALLIED POWERS"
            },
            spain: { 
                name: "Spain", 
                fullName: "Spanish State", 
                desc: "Spain (Axis-leaning / Independent - 5 Iberian Territories)",
                directiveTitle: "Iberian Peninsula & Straits Control",
                directiveDesc: "Fortify Madrid, Catalonia, and Andalusia. Seize control of the Strait of Gibraltar to dictate naval passage into the Mediterranean.",
                allianceName: "AXIS POWERS"
            },
            turkey: { 
                name: "Turkey", 
                fullName: "Republic of Turkey", 
                desc: "Turkey (Allies-leaning / Independent - 5 Anatolian Territories & Straits)",
                directiveTitle: "Turkish Straits & Anatolian Redoubt",
                directiveDesc: "Fortify the Bosporus Straits and Ankara. Maintain a fortified neutral redoubt while projecting force into the Balkans and Caucasus.",
                allianceName: "ALLIED POWERS"
            },
            neutral: { name: "Neutrals", fullName: "Neutral Nations", desc: "Neutral Buffer States (Sweden, Norway, Switzerland, Balkans, etc.)" }
        },

        // Regions
        regions: {
            atlantic: "Atlantic Sea Convoys",
            ireland: "Irish Free State",
            scotland: "Scotland & Hebrides",
            midlands: "Midlands & Wales",
            london: "London & Southern Britain",
            normandy: "Normandy & Brittany",
            paris: "Paris & Île-de-France",
            aquitaine: "Aquitaine & Bordeaux",
            lyon: "Lyon & Rhône Valley",
            marseille: "Marseille & Provence",
            algeria: "French Algeria & North Africa",
            madrid: "Madrid & New Castile",
            galicia: "Galicia & Basque Country",
            catalonia: "Catalonia & Barcelona",
            valencia: "Valencia & Eastern Spain",
            andalusia: "Andalusia & Seville",
            gibraltar: "Strait of Gibraltar",
            berlin: "Berlin & Brandenburg",
            ruhr: "Ruhr & Rhineland",
            hamburg: "Hamburg & Lower Saxony",
            saxony: "Saxony & Leipzig",
            bavaria: "Bavaria & Munich",
            austria: "Austria & Vienna",
            sudeten: "Sudetenland Border Forts",
            bohemia: "Bohemia & Prague",
            silesia: "Silesia & Breslau Industry",
            pomerania: "Pomerania & Baltic Coast",
            e_prussia: "East Prussia & Königsberg",
            warsaw: "Warsaw & Vistula Plain",
            denmark: "Denmark (Jutland)",
            hungary: "Hungary & Budapest",
            romania: "Romania & Ploiești Oilfields",
            n_italy: "Northern Italy & Milan",
            tuscany: "Tuscany & Florence",
            rome: "Rome & Lazio",
            s_italy: "Southern Italy & Naples",
            sicily: "Sicily Island",
            sardinia: "Sardinia & Corsica",
            tripoli: "Tripolitania (Western Libya)",
            cyrenaica: "Cyrenaica & Benghazi",
            ankara: "Ankara & Central Anatolia",
            istanbul_thrace: "Istanbul & Straits (Thrace)",
            izmir_aegean: "Izmir & Aegean Region",
            antalya_med: "Antalya & Mediterranean",
            erzurum_east: "Erzurum & Eastern Anatolia",
            moscow: "Moscow & Kremlin",
            leningrad: "Leningrad & Lake Ladoga",
            smolensk: "Smolensk & Central Russia",
            minsk: "Minsk & Belarus",
            kiev: "Kyiv & Dnieper Basin",
            donbass: "Donbas & Kharkiv",
            crimea: "Crimea & Sevastopol",
            stalingrad: "Stalingrad & Volga River",
            caucasus: "Caucasus & Baku Oilfields",
            urals: "Ural Heavy Industrial Zone",
            malta: "Malta & Central Mediterranean",
            cyprus: "Cyprus Island",
            alexandria: "Egypt & Alexandria",
            suez: "Cairo & Suez Canal",
            levant: "Syria & Levant",
            iraq: "Iraq & Basra Oilfields",
            benelux: "Benelux (Netherlands & Belgium)",
            switzerland: "Swiss Alps (Neutral)",
            norway: "Norway & Fjords",
            sweden: "Sweden & Iron Ore Mines",
            finland: "Finland & Karelia",
            balkans: "Balkans & Belgrade"
        },

        // Terrains
        terrains: {
            plains: "Plains & Steppes",
            mountains: "Mountainous Terrain",
            coastal: "Coastal & Littoral Zone",
            urban: "Urban & Fortifications"
        },

        // Seas & Oceans
        seas: {
            atlantic_ocean: "NORTH ATLANTIC OCEAN",
            north_sea: "NORTH SEA",
            baltic_sea: "BALTIC SEA",
            west_med: "WESTERN MEDITERRANEAN",
            east_med: "CENTRAL & EASTERN MEDITERRANEAN",
            black_sea: "BLACK SEA",
            caspian_sea: "CASPIAN SEA"
        }
    },

    ja: {
        // Brand & Header
        game_title: "WAR ROOM 1942",
        status_turn: "ターン",
        commander_turn: "作戦指揮 / 手番",
        industry_points: "工業生産力 (IP)",
        campaign_phase: "作戦フェーズ",
        phase_1_name: "第1段階: 生産・増援配備",
        phase_2_name: "第2段階: 軍事作戦・戦闘",
        btn_next_to_combat: "戦闘フェーズへ移行",
        btn_end_turn: "ターン終了",
        btn_sound_on: "音声: オン",
        btn_sound_off: "音声: オフ",
        btn_save: "セーブ",
        btn_load: "ロード",
        btn_room_prefix: "ルーム:",
        room_copied: "ルームコードをコピーしました:",
        zoom_in: "+",
        zoom_out: "-",
        zoom_reset: "マップを中央揃え",
        zoom_reset_title: "マップを中央に配置して視点をリセット",

        // Navigation Tabs
        tab_production: "軍備生産",
        tab_combat: "作戦攻撃",
        tab_movement: "部隊再配置",
        tab_intel: "戦況諜報",
        tab_radio: "無線通信",

        // Tab 1: Production
        title_selected_garrison: "選択中の駐留拠点",
        hint_select_garrison: "増援を配備したい自軍の支配地域を地図上でクリックしてください。",
        title_unit_procurement: "部隊調達および予備戦力",
        unit_inf_name: "歩兵師団",
        unit_inf_desc: "コスト: 3 IP | 陣地防衛専門",
        unit_arm_name: "戦車・機甲師団",
        unit_arm_desc: "コスト: 6 IP | 強襲突撃・戦線突破",
        unit_air_name: "航空航空隊 (戦闘・爆撃機)",
        unit_air_desc: "コスト: 8 IP | 戦略爆撃・航空支援",
        btn_deploy_units: "部隊を地域に配備する",
        btn_deploy_disabled: "自軍の領土にのみ増援配備が可能です",
        select_region_prompt: "領土を選択してください",

        // Tab 2: Combat
        title_frontline_combat: "前線戦闘・攻撃作戦",
        label_origin_base: "出撃拠点:",
        label_target_front: "攻撃目標:",
        hint_select_combat_targets: "まず自軍の地域をクリックし、続いて隣接する敵軍地域をクリックして目標を指定してください。",
        hint_select_origin_first: "出撃元の地域を選択",
        hint_select_target_second: "隣接する攻撃目標を選択",
        slider_attack_inf: "出撃歩兵",
        slider_attack_arm: "出撃戦車",
        slider_air_sortie: "航空出撃",
        btn_ground_assault: "地上総攻撃を開始",
        btn_air_strike: "戦略爆撃を実施",
        btn_blitzkrieg: "電撃戦 (ブリッツクリーク)",
        terrain_label: "地形:",
        defense_bonus_label: "防御補正:",

        // Tab 3: Movement
        title_strategic_movement: "戦略的移動および兵站",
        hint_movement: "隣接する友軍地域間で戦力を再配置し、脆弱な防衛線を強化してください。",
        slider_move_inf: "移動歩兵数",
        slider_move_arm: "移動戦車数",
        slider_move_air: "移動航空機数",
        btn_execute_move: "部隊再配置命令を発令",

        // Tab 4: Intel
        title_balance_of_power: "欧州工業生産力と勢力均衡",
        label_axis: "枢軸国",
        label_allies: "連合国",
        victory_conditions: "勝利条件: 全欧州工業力の70%を掌握するか、敵同盟の主要2大首都を完全占領すること。",
        title_strategic_capitals: "戦略的首都一覧",
        capital_controlled_by: "支配勢力",

        // Tab 5: Radio
        title_radio_terminal: "軍事無線通信および戦闘日誌",
        chat_placeholder: "無線通信文を入力...",
        btn_send_chat: "送信",

        // Lobby Modal
        lobby_title: "1942作戦司令部 (第2次世界大戦)",
        lobby_subtitle: "サーバー不要のWebRTC P2Pターン制戦略エンジン。ルームを作成して世界中の仲間と対戦するか、AIとの単独作戦を開始してください。",
        mode_singleplayer_title: "単独作戦 (ソロプレイ)",
        mode_singleplayer_desc: "自律思考AIを相手に即座に対戦。外部サーバー・ネットワーク設定は一切不要 (100%オフライン対応)。",
        mode_host_title: "マルチプレイ作成 (ホスト)",
        mode_host_desc: "6桁の対戦ルームコードを発行。あなたのブラウザが完全な対戦ホストサーバーになります。",
        lobby_join_title: "ルームに参加 (クライアント)",
        lobby_join_placeholder: "6桁のルームコード (例: W2-7A9B)",
        btn_lobby_join: "接続する",
        label_select_faction: "指揮する国家を選択:",
        label_commander_name: "指揮官名:",
        btn_start_singleplayer: "作戦を直ちに開始 (単独作戦)",
        btn_start_host: "ロビーを作成して集結を開始",
        lang_switch_label: "言語 / LANGUAGE / DİL:",

        // Waiting Room & Hot-Join
        waiting_room_title: "作戦集結司令部 (待機ロビー)",
        waiting_room_subtitle: "ルームコードを仲間に共有してください。未参戦の国家はすべて自律思考AIボットが自動で指揮します。",
        room_code_label: "作戦コード:",
        btn_copy_code: "コードをコピー",
        btn_copy_link: "招待リンクをコピー",
        btn_leave_lobby: "ロビーを退室",
        btn_start_campaign_now: "作戦を開始する (全員で開戦)",
        hotjoin_modal_title: "戦場に途中参戦 (指揮権の継承)",
        hotjoin_modal_desc: "ホストが参戦を承認しました！現在AIボットが指揮している生存国家を選択してください:",
        btn_claim_and_battle: "指揮を執り戦場へ突入",
        toast_code_copied: "ルームコードをクリップボードにコピーしました！",
        toast_link_copied: "招待リンクをクリップボードにコピーしました！",
        hotjoin_prompt_title: "援軍参戦リクエスト",
        hotjoin_prompt_desc: "が進行中の作戦への参戦を希望しています！",
        btn_hotjoin_accept: "承認する",
        toast_hotjoin_rejected: "ホストにより参戦リクエストが拒否されました。",
        toast_hotjoin_no_factions: "現在指揮可能なAI国家はありません！",

        // Developer Portfolio
        btn_developer: "開発者",
        btn_developer_credit_full: "開発者: Buğra Kadıoğlu (お仕事のご依頼・ポートフォリオ)",
        dev_modal_title: "Buğra Kadıoğlu | ポートフォリオ",
        dev_modal_offer: "お仕事のご依頼をお待ちしております！",
        dev_modal_desc: "開発者のポートフォリオページ (bugrakadioglu.dev) を新しいタブで開きます。よろしいですか？",
        btn_dev_proceed: "移動する (承認)",
        btn_cancel: "キャンセル",

        // Strategic Briefing Modal
        header_player_command: "あなたの指揮国:",
        briefing_modal_title: "戦略作戦発動司令書",
        briefing_modal_subtitle: "欧州および地中海戦域作戦要綱",
        briefing_nation_directive_title: "国家戦略方針と主要目標",
        briefing_key_tips_title: "作戦行動の基本指針",
        briefing_tip_1: "1. 軍備生産と配備: 自軍の支配地域を選択し、工業生産力 (IP) を用いて歩兵・戦車・航空部隊を増援配備します。",
        briefing_tip_2: "2. 前線作戦攻撃: 出撃拠点と隣接する敵領土を選択し、地上電撃侵攻または戦略空爆を実施します。",
        briefing_tip_3: "3. 部隊戦略再配置: 友軍地域間で戦力を移動させ、最前線の防衛線を強化します。",
        briefing_tip_4: "4. 勝利達成条件: 全欧州工業生産力の70%を掌握するか、敵対陣営の主要2大首都を陥落させます。",
        briefing_dont_show: "起動時にこの作戦司令書を再表示しない",
        btn_briefing_enter: "指揮権を掌握し、作戦を開始する",


        // Combat Report Modal
        combat_modal_title: "戦闘詳報 (交戦結果報告)",
        combat_attacker: "攻撃側部隊",
        combat_defender: "防衛側部隊",
        combat_losses: "損害数",
        combat_remains: "残存戦力",
        combat_air_losses: "航空機損害",
        combat_rounds_title: "ラウンド別交戦記録",
        btn_close_combat_modal: "閉じて進む",
        combat_victory: "攻撃成功！ 敵防衛線を突破し地域を占領",
        combat_defeat: "攻撃失敗！ 敵防衛部隊の頑強な抵抗により撃退",

        // Game Over Modal
        game_over_victory: "偉大なる勝利！ 欧州戦線完全制覇",
        game_over_defeat: "敗北！ 全戦線の戦略的崩壊",
        btn_restart: "新たな作戦を開始する",

        // Toasts & Messages
        toast_not_enough_ip: "工業生産力 (IP) が不足しています！",
        toast_select_at_least_one: "最低1個部隊を出撃させる必要があります。",
        toast_select_friendly_region: "増援を配備する友軍領土を選択してください！",
        toast_select_enemy_target: "攻撃対象となる隣接する敵領土を選択してください！",
        toast_enter_code: "6桁のルームコードを入力してください。",
        toast_turn_yours: "あなたの手番です！ 指揮官:",
        toast_game_saved: "ブラウザのローカルメモリにゲームを保存しました。",
        toast_game_loaded: "保存された作戦状況を復元しました。",
        toast_no_save_found: "セーブデータが見つかりませんでした。",
        toast_map_centered: "マップを中央揃えにし、視点をリセットしました。",
        zoom_homeland: "本国に注目",
        zoom_homeland_title: "首都と本国にフォーカス",
        zoom_reset: "全体マップ",
        zoom_reset_title: "全欧州大陸概要",

        // Factions
        faction_germany_name: "ドイツ国",
        faction_uk_name: "イギリス",
        faction_ussr_name: "ソビエト連邦",
        faction_italy_name: "イタリア王国",
        faction_france_name: "フランス",
        faction_spain_name: "スペイン",
        faction_turkey_name: "トルコ",
        slot_bot_name: "人工知能 (AI Bot)",
        slot_host_badge: "ホスト",
        slot_player_badge: "プレイヤー",
        slot_bot_badge: "ボット",
        odds_no_units: "部隊未割り当て",
        odds_no_selection: "未選択",
        odds_overwhelming: "圧倒的優位",
        odds_advantage: "攻勢有利",
        odds_balanced: "互角",
        odds_risky: "危険 / 敵防衛優位",
        factions: {
            germany: { 
                name: "ドイツ国", 
                fullName: "German Reich", 
                desc: "ドイツ国 (枢軸国 - 15領土＆強力な機甲戦力)",
                directiveTitle: "電撃戦と圧倒的工業力",
                directiveDesc: "ルール、ベルリン、ウィーンの強力な機甲戦力を集中運用し、欧州全域を制圧せよ。",
                allianceName: "枢軸国陣営 (AXIS)"
            },
            uk: { 
                name: "イギリス", 
                fullName: "United Kingdom", 
                desc: "イギリス (連合国 - 10領土＆大西洋航路と海空軍)",
                directiveTitle: "要塞島と海空軍の誇り",
                directiveDesc: "英本土、ジブラルタル、スエズ運河を防衛し、地中海と大陸反攻の主導権を握れ。",
                allianceName: "連合国陣営 (ALLIES)"
            },
            ussr: { 
                name: "ソビエト連邦", 
                fullName: "Soviet Union", 
                desc: "ソビエト連邦 (連合国 - 10領土＆膨大な縦深防御)",
                directiveTitle: "膨大な人的資源と縦深防御",
                directiveDesc: "モスクワ、スターリングラード、レニングラードを死守し、ウラル重工業で反攻せよ。",
                allianceName: "連合国陣営 (ALLIES)"
            },
            italy: { 
                name: "イタリア王国", 
                fullName: "Kingdom of Italy", 
                desc: "イタリア王国 (枢軸国 - 8領土＆地中海・北アフリカ)",
                directiveTitle: "地中海制圧と砂漠戦線",
                directiveDesc: "地中海の制海権を確保し、北アフリカからエジプト・スエズ方面へ進出せよ。",
                allianceName: "枢軸国陣営 (AXIS)"
            },
            france: { 
                name: "フランス", 
                fullName: "République Française", 
                desc: "フランス (連合国 - 6領土＆西欧の要塞)",
                directiveTitle: "本土防衛とレジスタンス",
                directiveDesc: "パリと北アフリカ植民地を枢軸国の進撃から守り、連合国軍と呼応して戦線を維持せよ。",
                allianceName: "連合国陣営 (ALLIES)"
            },
            spain: { 
                name: "スペイン", 
                fullName: "Estado Español", 
                desc: "スペイン (枢軸寄り独立国 - 5領土＆イベリア半島)",
                directiveTitle: "イベリア防衛とジブラルタル掌握",
                directiveDesc: "マドリードとカタルーニャを要塞化し、ジブラルタル海峡を押さえて地中海西口を統制せよ。",
                allianceName: "枢軸国陣営 (AXIS)"
            },
            turkey: { 
                name: "トルコ", 
                fullName: "Türkiye Cumhuriyeti", 
                desc: "トルコ (連合寄り独立国 - 5領土＆海峡の守護者)",
                directiveTitle: "海峡防衛とアナトリアの砦",
                directiveDesc: "アンカラとボスポラス海峡を死守し、バルカン・コーカサス情勢の中で不抜の拠点を築け。",
                allianceName: "連合国陣営 (ALLIES)"
            },
            neutral: { name: "中立国", fullName: "Neutral Nations", desc: "中立緩衝地帯 (スウェーデン、ノルウェー、スイス、バルカンなど)" }
        },

        // Regions
        regions: {
            atlantic: "大西洋輸送航路",
            ireland: "アイルランド島",
            scotland: "スコットランド＆ヘブリディーズ",
            midlands: "イングランド中部＆ウェールズ",
            london: "ロンドン＆イングランド南部",
            normandy: "ノルマンディー＆ブルターニュ",
            paris: "パリ＆イル＝ド＝フランス",
            aquitaine: "アキテーヌ＆ボルドー",
            lyon: "リヨン＆ローヌ渓谷",
            marseille: "マルセイユ＆プロヴァンス",
            algeria: "アルジェリア＆北アフリカ",
            madrid: "マドリード＆カスティーリャ",
            galicia: "ガリシア＆バスク",
            catalonia: "カタルーニャ＆バルセロナ",
            valencia: "バレンシア＆東スペイン",
            andalusia: "アンダルシア＆セビリア",
            gibraltar: "ジブラルタル海峡",
            berlin: "ベルリン＆ブランデンブルク",
            ruhr: "ルール＆ラインラント",
            hamburg: "ハンブルク＆ニーダーザクセン",
            saxony: "ザクセン＆ライプツィヒ",
            bavaria: "バイエルン＆ミュンヘン",
            austria: "オーストリア＆ウィーン",
            sudeten: "ズデーテン要塞地帯",
            bohemia: "ボヘミア＆プラハ",
            silesia: "シレジア＆ブレスラウ工業区",
            pomerania: "ポメラニア＆バルト海沿岸",
            e_prussia: "東プロイセン＆ケーニヒスベルク",
            warsaw: "ワルシャワ＆ヴィスワ平原",
            denmark: "デンマーク (ユトランド)",
            hungary: "ハンガリー＆ブダペスト",
            romania: "ルーマニア＆プロエシュティ油田",
            n_italy: "北イタリア＆ミラノ",
            tuscany: "トスカーナ＆フィレンツェ",
            rome: "ローマ＆ラツィオ",
            s_italy: "南イタリア＆ナポリ",
            sicily: "シチリア島",
            sardinia: "サルデーニャ＆コルシカ",
            tripoli: "トリポリタニア (西リビア)",
            cyrenaica: "キレナイカ＆ベンガジ",
            ankara: "アンカラ＆中央アナトリア",
            istanbul_thrace: "イスタンブール＆海峡 (トラキア)",
            izmir_aegean: "イズミル＆エーゲ海沿岸",
            antalya_med: "アンタルヤ＆地中海",
            erzurum_east: "エルズルム＆東部アナトリア",
            moscow: "モスクワ＆クレムリン",
            leningrad: "レニングラード＆ラドガ湖",
            smolensk: "スモレンスク＆ロシア中央",
            minsk: "ミンスク＆ベラルーシ",
            kiev: "キーウ＆ドニエプル川",
            donbass: "ドンバス＆ハリコフ",
            crimea: "クリミア＆セヴァストポリ",
            stalingrad: "スターリングラード＆ヴォルガ川",
            caucasus: "コーカサス＆バクー油田",
            urals: "ウラル重工業地帯",
            malta: "マルタ島＆中央地中海",
            cyprus: "キプロス島",
            alexandria: "エジプト＆アレクサンドリア",
            suez: "カイロ＆スエズ運河",
            levant: "シリア＆レバント",
            iraq: "イラク＆バスラ油田",
            benelux: "ベネルクス (オランダ＆ベルギー)",
            switzerland: "スイスアルプス (永世中立)",
            norway: "ノルウェー＆フィヨルド",
            sweden: "スウェーデン鉄鉱石山地",
            finland: "フィンランド＆カレリア",
            balkans: "バルカン半島＆ベオグラード"
        },

        // Terrains
        terrains: {
            plains: "平原・ステップ地帯",
            mountains: "山岳地帯",
            coastal: "海岸・沿岸地帯",
            urban: "都市・要塞拠点"
        },

        // Seas & Oceans
        seas: {
            atlantic_ocean: "北大西洋",
            north_sea: "北海",
            baltic_sea: "バルト海",
            west_med: "西地中海",
            east_med: "中・東部地中海",
            black_sea: "黒海",
            caspian_sea: "カスピ海"
        }
    }
};

class I18nManager {
    constructor() {
        const urlParams = typeof window !== 'undefined' && window.location ? new URLSearchParams(window.location.search) : null;
        const paramLang = urlParams ? urlParams.get('lang') : null;
        const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('ww2_game_lang') : null;
        this.currentLang = (paramLang && TRANSLATIONS[paramLang]) 
            ? paramLang 
            : (savedLang && TRANSLATIONS[savedLang] ? savedLang : 'tr');
        this.listeners = [];
    }

    t(key) {
        if (!key) return '';
        const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.tr;
        if (key.includes('.')) {
            const parts = key.split('.');
            let val = dict;
            for (const p of parts) {
                if (val && val[p] !== undefined) val = val[p];
                else { val = undefined; break; }
            }
            if (val !== undefined) return val;

            let defVal = TRANSLATIONS.tr;
            for (const p of parts) {
                if (defVal && defVal[p] !== undefined) defVal = defVal[p];
                else { defVal = undefined; break; }
            }
            return defVal !== undefined ? defVal : key;
        }
        return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.tr[key] || key);
    }

    getFactionData(factionId) {
        const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.tr;
        if (dict.factions && dict.factions[factionId]) {
            return dict.factions[factionId];
        }
        return (TRANSLATIONS.tr.factions && TRANSLATIONS.tr.factions[factionId]) || {};
    }

    getRegionName(regionId) {
        const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.tr;
        if (dict.regions && dict.regions[regionId]) {
            return dict.regions[regionId];
        }
        return TRANSLATIONS.tr.regions[regionId] || regionId;
    }

    getFactionName(factionId) {
        const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.tr;
        if (dict.factions && dict.factions[factionId]) {
            return dict.factions[factionId].name;
        }
        return factionId;
    }

    getTerrainName(terrainId) {
        const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.tr;
        if (dict.terrains && dict.terrains[terrainId]) {
            return dict.terrains[terrainId];
        }
        return terrainId;
    }

    getSeaName(seaId) {
        const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.tr;
        if (dict.seas && dict.seas[seaId]) {
            return dict.seas[seaId];
        }
        return (TRANSLATIONS.tr.seas && TRANSLATIONS.tr.seas[seaId]) || seaId;
    }

    setLanguage(lang) {
        if (!TRANSLATIONS[lang]) return;
        this.currentLang = lang;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('ww2_game_lang', lang);
        }
        this.applyToDOM();
        this.listeners.forEach(fn => {
            try { fn(lang); } catch (e) { console.error('i18n listener error:', e); }
        });
    }

    addListener(fn) {
        this.listeners.push(fn);
    }

    applyToDOM() {
        if (typeof document === 'undefined') return;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) el.textContent = translation;
        });

        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            const translation = this.t(key);
            if (translation) el.innerHTML = translation;
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation) el.placeholder = translation;
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation) el.title = translation;
        });

        // Update active class on all language buttons
        document.querySelectorAll('[data-lang]').forEach(btn => {
            const l = btn.getAttribute('data-lang');
            btn.classList.toggle('active', l === this.currentLang);
        });

        const langBadge = document.getElementById('current-lang-label');
        if (langBadge) {
            langBadge.textContent = this.currentLang.toUpperCase();
        }
    }
}

export const i18n = new I18nManager();
