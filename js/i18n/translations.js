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
        btn_next_to_combat: "⚔️ HAREKAT AŞAMASINA GEÇ",
        btn_end_turn: "⏭️ TURU BİTİR",
        btn_sound_on: "🔊 Ses: Açık",
        btn_sound_off: "🔇 Ses: Kapalı",
        btn_save: "💾 Kaydet",
        btn_load: "📂 Yükle",
        btn_room_prefix: "🔑 Oda:",
        room_copied: "Oda Kodu Kopyalandı:",
        zoom_in: "+",
        zoom_out: "-",
        zoom_reset: "⟲ Haritayı Ortala",

        // Navigation Tabs
        tab_production: "🪖 ÜRETİM",
        tab_combat: "⚔️ TAARRUZ",
        tab_movement: "🚚 İNTİKAL",
        tab_intel: "📊 İSTİHBARAT",
        tab_radio: "📻 TELSİZ",

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
        btn_deploy_units: "🪖 BİRLİKLERİ BÖLGEYE KONUŞLANDIR",
        btn_deploy_disabled: "⚠️ YALNIZCA DOST BÖLGEYE TAKVİYE YAPILABİLİR",
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
        btn_ground_assault: "⚔️ KARA HAREKATI BAŞLAT",
        btn_air_strike: "✈️ STRATEJİK HAVA HAREKATI",
        btn_blitzkrieg: "⚡ BLITZKRIEG (YILDIRIM TAARRUZU)",
        terrain_label: "Arazi:",
        defense_bonus_label: "Savunma Bonusu:",

        // Tab 3: Movement
        title_strategic_movement: "STRATEJİK İNTİKAL VE LOJİSTİK",
        hint_movement: "Dost bölgeleriniz arasında birliklerinizi kaydırarak cephe hattınızı güçlendirin.",
        slider_move_inf: "Taşınacak Piyade",
        slider_move_arm: "Taşınacak Panzer",
        slider_move_air: "Taşınacak Uçak",
        btn_execute_move: "🚚 İNTİKAL EMRİ VER",

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
        lobby_title: "⚔️ 2. DÜNYA SAVAŞI KOMUTA MERKEZİ",
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
        btn_start_singleplayer: "🚀 HAREKATI HEMEN BAŞLAT (TEK OYUNCULU)",
        btn_start_host: "🌐 LOBİ OLUŞTUR VE BAŞLAT (HOST)",
        lang_switch_label: "🌐 DİL / LANGUAGE / 言語:",

        // Combat Report Modal
        combat_modal_title: "⚔️ MUHAREBE RAPORU",
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
        game_over_victory: "🎖️ ZAFER! AVRUPA ÖZGÜRLEŞTİRİLDİ",
        game_over_defeat: "💀 YENİLGİ! CEPHEDE ÇÖKÜŞ",
        btn_restart: "YENİ HAREKAT BAŞLAT",

        // Toasts & Messages
        toast_not_enough_ip: "Yetersiz Sanayi Puanı!",
        toast_select_at_least_one: "En az bir birlik seçmelisiniz.",
        toast_select_friendly_region: "Lütfen önce asker yerleştirilecek dost bölgenizi seçin!",
        toast_select_enemy_target: "Lütfen geçerli bir komşu düşman bölgesi seçin!",
        toast_enter_code: "Lütfen 6 haneli oda kodunu girin.",
        toast_turn_yours: "🚩 Sıra Sizde! Komutan:",
        toast_game_saved: "💾 Oyun tarayıcı hafızasına kaydedildi.",
        toast_game_loaded: "📂 Kayıtlı oyun başarıyla yüklendi.",
        toast_no_save_found: "Kayıtlı oyun bulunamadı.",

        // Factions
        factions: {
            germany: { name: "Almanya", fullName: "German Reich", desc: "Almanya (Mihver - Yüksek Başlangıç Panzer Gücü)" },
            uk: { name: "Birleşik Krallık", fullName: "United Kingdom", desc: "Birleşik Krallık (Müttefikler - Atlantik & Kraliyet Donanması)" },
            ussr: { name: "Sovyetler Birliği", fullName: "Soviet Union", desc: "Sovyetler Birliği (Müttefikler - Muazzam İnsan Gücü & Sanayi)" },
            italy: { name: "İtalya", fullName: "Kingdom of Italy", desc: "İtalya (Mihver - Akdeniz & Kuzey Afrika Cephesi)" },
            neutral: { name: "Tarafsızlar", fullName: "Neutral Nations", desc: "Tarafsız Ülkeler" }
        },

        // Regions
        regions: {
            atlantic: "Atlantik Konvoy Hattı",
            scotland: "İskoçya & Hebridler",
            ireland: "İrlanda Adası",
            london: "Londra & Güney İngiltere",
            n_france: "Kuzey Fransa & Normandiya",
            s_france: "Güney Fransa & Marsilya",
            benelux: "Benelüks & Alçak Ülkeler",
            ruhr: "Ruhr & Ren Sanayi Havzası",
            berlin: "Berlin & Brandenburg",
            bavaria: "Bavyera & Münih",
            e_prussia: "Doğu Prusya & Königsberg",
            poland: "Varşova & Vistül Havzası",
            denmark: "Danimarka & Kopenhag",
            norway: "Norveç & Fiyortlar",
            sweden: "İsveç & Demir Yatakları",
            finland: "Finlandiya & Helsinki",
            n_italy: "Kuzey İtalya & Po Ovası",
            rome: "Roma & İtalya Yarımadası",
            hungary: "Macaristan & Budapeşte",
            romania: "Romanya & Ploiești Petrolü",
            balkans: "Balkanlar & Belgrad",
            baltics: "Baltık Ülkeleri",
            leningrad: "Leningrad & Baltık Filosu",
            moscow: "Moskova & Kremlin",
            ukraine: "Ukrayna & Dinyeper Havzası",
            stalingrad: "Stalingrad & Volga Hattı",
            caucasus: "Kafkasya & Bakü Petrolü",
            urals: "Ural Sanayi Havzası",
            spain: "İspanya & Madrid",
            gibraltar: "Cebelitarık Boğazı",
            turkey: "Türkiye & Boğazlar",
            morocco_algeria: "Fas & Cezayir",
            libya: "Libya & Trablus",
            egypt: "Mısır & İskenderiye",
            middle_east: "Ortadoğu & Süveyş Kanalı"
        },

        // Terrains
        terrains: {
            plains: "Düzlük & Bozkır",
            mountains: "Dağlık Arazi",
            coastal: "Sahil & Kıyı Hattı",
            urban: "Şehir & Tahkimat"
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
        btn_next_to_combat: "⚔️ ADVANCE TO COMBAT PHASE",
        btn_end_turn: "⏭️ END TURN",
        btn_sound_on: "🔊 Sound: On",
        btn_sound_off: "🔇 Sound: Off",
        btn_save: "💾 Save",
        btn_load: "📂 Load",
        btn_room_prefix: "🔑 Room:",
        room_copied: "Room Code Copied:",
        zoom_in: "+",
        zoom_out: "-",
        zoom_reset: "⟲ Center Map",

        // Navigation Tabs
        tab_production: "🪖 PRODUCTION",
        tab_combat: "⚔️ COMBAT",
        tab_movement: "🚚 MOVEMENT",
        tab_intel: "📊 INTEL",
        tab_radio: "📻 RADIO",

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
        btn_deploy_units: "🪖 DEPLOY UNITS TO REGION",
        btn_deploy_disabled: "⚠️ REINFORCEMENTS ONLY IN FRIENDLY TERRITORIES",
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
        btn_ground_assault: "⚔️ LAUNCH GROUND ASSAULT",
        btn_air_strike: "✈️ STRATEGIC AIR STRIKE",
        btn_blitzkrieg: "⚡ BLITZKRIEG (LIGHTNING ASSAULT)",
        terrain_label: "Terrain:",
        defense_bonus_label: "Defense Bonus:",

        // Tab 3: Movement
        title_strategic_movement: "STRATEGIC REPOSITIONING & LOGISTICS",
        hint_movement: "Shift forces between adjacent friendly regions to reinforce vulnerable defensive lines.",
        slider_move_inf: "Infantry to Move",
        slider_move_arm: "Armor to Move",
        slider_move_air: "Air to Move",
        btn_execute_move: "🚚 ORDER REPOSITIONING",

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
        lobby_title: "⚔️ WAR ROOM 1942: SUPREME HEADQUARTERS",
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
        btn_start_singleplayer: "🚀 LAUNCH CAMPAIGN (SOLO PLAY)",
        btn_start_host: "🌐 CREATE LOBBY & HOST",
        lang_switch_label: "🌐 LANGUAGE / DİL / 言語:",

        // Combat Report Modal
        combat_modal_title: "⚔️ AFTER-ACTION REPORT (AAR)",
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
        game_over_victory: "🎖️ VICTORY! EUROPE IS LIBERATED",
        game_over_defeat: "💀 DEFEAT! STRATEGIC COLLAPSE",
        btn_restart: "START NEW CAMPAIGN",

        // Toasts & Messages
        toast_not_enough_ip: "Insufficient Industry Points!",
        toast_select_at_least_one: "You must commit at least one unit.",
        toast_select_friendly_region: "Please select a friendly territory to deploy troops.",
        toast_select_enemy_target: "Please select an adjacent enemy territory to target.",
        toast_enter_code: "Please enter a 6-digit room code.",
        toast_turn_yours: "🚩 It's Your Turn! Commander:",
        toast_game_saved: "💾 Game saved to browser storage.",
        toast_game_loaded: "📂 Saved campaign restored successfully.",
        toast_no_save_found: "No saved campaign found in storage.",

        // Factions
        factions: {
            germany: { name: "Germany", fullName: "German Reich", desc: "Germany (Axis - High Initial Panzer Strength)" },
            uk: { name: "United Kingdom", fullName: "United Kingdom", desc: "United Kingdom (Allies - Atlantic & Royal Navy)" },
            ussr: { name: "Soviet Union", fullName: "Soviet Union", desc: "Soviet Union (Allies - Immense Manpower & Industry)" },
            italy: { name: "Italy", fullName: "Kingdom of Italy", desc: "Italy (Axis - Mediterranean & North Africa)" },
            neutral: { name: "Neutrals", fullName: "Neutral Nations", desc: "Neutral Nations" }
        },

        // Regions
        regions: {
            atlantic: "Atlantic Sea Convoys",
            scotland: "Scotland & Hebrides",
            ireland: "Irish Free State",
            london: "London & Southern Britain",
            n_france: "Northern France & Normandy",
            s_france: "Southern France & Marseille",
            benelux: "Benelux & Lowlands",
            ruhr: "Ruhr & Rhine Industrial Basin",
            berlin: "Berlin & Brandenburg",
            bavaria: "Bavaria & Munich",
            e_prussia: "East Prussia & Königsberg",
            poland: "Warsaw & Vistula Plain",
            denmark: "Denmark & Copenhagen",
            norway: "Norway & Fjords",
            sweden: "Sweden & Iron Ore Mines",
            finland: "Finland & Helsinki",
            n_italy: "Northern Italy & Po Valley",
            rome: "Rome & Italian Peninsula",
            hungary: "Hungary & Budapest",
            romania: "Romania & Ploiești Oilfields",
            balkans: "Balkans & Belgrade",
            baltics: "Baltic States",
            leningrad: "Leningrad & Baltic Fleet",
            moscow: "Moscow & Kremlin",
            ukraine: "Ukraine & Dnieper River",
            stalingrad: "Stalingrad & Volga River",
            caucasus: "Caucasus & Baku Oilfields",
            urals: "Ural Heavy Industrial Zone",
            spain: "Spain & Madrid",
            gibraltar: "Strait of Gibraltar",
            turkey: "Turkey & Turkish Straits",
            morocco_algeria: "Morocco & Algeria",
            libya: "Libya & Tripoli",
            egypt: "Egypt & Alexandria",
            middle_east: "Middle East & Suez Canal"
        },

        // Terrains
        terrains: {
            plains: "Plains & Steppes",
            mountains: "Mountainous Terrain",
            coastal: "Coastal & Littoral Zone",
            urban: "Urban & Fortifications"
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
        btn_next_to_combat: "⚔️ 戦闘フェーズへ移行",
        btn_end_turn: "⏭️ ターン終了",
        btn_sound_on: "🔊 音声: オン",
        btn_sound_off: "🔇 音声: オフ",
        btn_save: "💾 セーブ",
        btn_load: "📂 ロード",
        btn_room_prefix: "🔑 ルーム:",
        room_copied: "ルームコードをコピーしました:",
        zoom_in: "+",
        zoom_out: "-",
        zoom_reset: "⟲ 地図を中央に戻す",

        // Navigation Tabs
        tab_production: "🪖 軍備生産",
        tab_combat: "⚔️ 作戦攻撃",
        tab_movement: "🚚 部隊再配置",
        tab_intel: "📊 戦況諜報",
        tab_radio: "📻 無線通信",

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
        btn_deploy_units: "🪖 部隊を地域に配備する",
        btn_deploy_disabled: "⚠️ 自軍の領土にのみ増援配備が可能です",
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
        btn_ground_assault: "⚔️ 地上総攻撃を開始",
        btn_air_strike: "✈️ 戦略爆撃を実施",
        btn_blitzkrieg: "⚡ 電撃戦 (ブリッツクリーク)",
        terrain_label: "地形:",
        defense_bonus_label: "防御補正:",

        // Tab 3: Movement
        title_strategic_movement: "戦略的移動および兵站",
        hint_movement: "隣接する友軍地域間で戦力を再配置し、脆弱な防衛線を強化してください。",
        slider_move_inf: "移動歩兵数",
        slider_move_arm: "移動戦車数",
        slider_move_air: "移動航空機数",
        btn_execute_move: "🚚 部隊再配置命令を発令",

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
        lobby_title: "⚔️ 1942作戦司令部 (第2次世界大戦)",
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
        btn_start_singleplayer: "🚀 作戦を直ちに開始 (単独作戦)",
        btn_start_host: "🌐 ロビーを作成して開始 (ホスト)",
        lang_switch_label: "🌐 言語 / LANGUAGE / DİL:",

        // Combat Report Modal
        combat_modal_title: "⚔️ 戦闘詳報 (交戦結果報告)",
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
        game_over_victory: "🎖️ 偉大なる勝利！ 欧州戦線完全制覇",
        game_over_defeat: "💀 敗北！ 全戦線の戦略的崩壊",
        btn_restart: "新たな作戦を開始する",

        // Toasts & Messages
        toast_not_enough_ip: "工業生産力 (IP) が不足しています！",
        toast_select_at_least_one: "最低1個部隊を出撃させる必要があります。",
        toast_select_friendly_region: "増援を配備する友軍領土を選択してください！",
        toast_select_enemy_target: "攻撃対象となる隣接する敵領土を選択してください！",
        toast_enter_code: "6桁のルームコードを入力してください。",
        toast_turn_yours: "🚩 あなたの手番です！ 指揮官:",
        toast_game_saved: "💾 ブラウザのローカルメモリにゲームを保存しました。",
        toast_game_loaded: "📂 保存された作戦状況を復元しました。",
        toast_no_save_found: "セーブデータが見つかりませんでした。",

        // Factions
        factions: {
            germany: { name: "ドイツ国", fullName: "German Reich", desc: "ドイツ国 (枢軸国 - 強力な機甲戦力)" },
            uk: { name: "イギリス", fullName: "United Kingdom", desc: "イギリス (連合国 - 大西洋航路と海空軍)" },
            ussr: { name: "ソビエト連邦", fullName: "Soviet Union", desc: "ソビエト連邦 (連合国 - 膨大な人的資源と重工業)" },
            italy: { name: "イタリア王国", fullName: "Kingdom of Italy", desc: "イタリア王国 (枢軸国 - 地中海・北アフリカ戦線)" },
            neutral: { name: "中立国", fullName: "Neutral Nations", desc: "中立国" }
        },

        // Regions
        regions: {
            atlantic: "大西洋輸送航路",
            scotland: "スコットランド＆ヘブリディーズ",
            ireland: "アイルランド島",
            london: "ロンドン＆イングランド南部",
            n_france: "北フランス＆ノルマンディー",
            s_france: "南フランス＆マルセイユ",
            benelux: "ベネルクス低地帯",
            ruhr: "ルール＆ライン工業地帯",
            berlin: "ベルリン＆ブランデンブルク",
            bavaria: "バイエルン＆ミュンヘン",
            e_prussia: "東プロイセン＆ケーニヒスベルク",
            poland: "ワルシャワ＆ヴィスワ平原",
            denmark: "デンマーク＆コペンハーゲン",
            norway: "ノルウェー＆フィヨルド",
            sweden: "スウェーデン鉄鉱石山地",
            finland: "フィンランド＆ヘルシンキ",
            n_italy: "北イタリア＆ポー平原",
            rome: "ローマ＆イタリア半島",
            hungary: "ハンガリー＆ブダペスト",
            romania: "ルーマニア＆プロエシュティ油田",
            balkans: "バルカン半島＆ベオグラード",
            baltics: "バルト三国",
            leningrad: "レニングラード＆バルト海艦隊",
            moscow: "モスクワ＆クレムリン",
            ukraine: "ウクライナ＆ドニエプル川",
            stalingrad: "スターリングラード＆ヴォルガ川",
            caucasus: "コーカサス＆バクー油田",
            urals: "ウラル重工業地帯",
            spain: "スペイン＆マドリード",
            gibraltar: "ジブラルタル海峡",
            turkey: "トルコ＆ボスポラス海峡",
            morocco_algeria: "モロッコ＆アルジェリア",
            libya: "リビア＆トリポリ",
            egypt: "エジプト＆アレクサンドリア",
            middle_east: "中東＆スエズ運河"
        },

        // Terrains
        terrains: {
            plains: "平原・ステップ地帯",
            mountains: "山岳地帯",
            coastal: "海岸・沿岸地帯",
            urban: "都市・要塞拠点"
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
        const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.tr;
        return dict[key] !== undefined ? dict[key] : (TRANSLATIONS.tr[key] || key);
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
