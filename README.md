# WAR ROOM 1942 - STRATEGY GAME ENGINE & MATHEMATICAL DOCUMENTATION

## 1. TURKISH (TÜRKÇE DOKÜMANTASYON)

### 1.1 Genel Mimari ve Proje Özeti
WAR ROOM 1942, 2. Dünya Savaşı Avrupa ve Akdeniz Harekat Sahasını simüle eden, Web Tabanlı Büyük Strateji (Grand Strategy) oyun motorudur. 
Sistem, tamamen istemci taraflı JavaScript (ES6+ Modüler Mimari), HTML5 Canvas ve Vanilla CSS ile geliştirilmiştir. Harita katmanı, gerçek dünya EPSG:4326 coğrafi koordinatlarını içeren GeoJSON veri setinden Spherical Mercator Projeksiyonu ile 2400x1600 piksel çözünürlüğe dönüştürülmekte ve Voronoi yarı-düzlem poligon kırpma algoritmasıyla eyaletlere ayrılmaktadır.

### 1.2 Kurumsal Ağ ve Güvenlik Uyumluluğu (Fortinet, Firewall ve Proxy Uyumluluğu)
Sistem, katı kurumsal siber güvenlik politikalarına ve kurumsal ağ altyapılarına tam uyumlu olarak tasarlanmıştır:
- Fortinet (FortiGate), Palo Alto Networks, Check Point, Zscaler ve Cisco kurumsal güvenlik duvarları (firewall), SSL Denetimi (Deep Packet Inspection) ve kurumsal proxy arkasında sorunsuz çalışır.
- Oyunun tek oyunculu sefer modu, yapay zeka karar mekanizmaları, muharebe çözümlemeleri ve kayıt sistemleri tamamen yerel tarayıcı yürütme alanında (Browser Sandbox) çalışır.
- Hiçbir harici bağımlı sunucuya, harici telemetri soketine veya şüpheli üçüncü taraf API uç noktasına istek atmaz.
- Çok oyunculu mod, WebRTC veri kanalları üzerinden doğrudan Eşler Arası (Peer-to-Peer) olarak haberleşir; harici websocket sunucularının güvenlik duvarı tarafından engellendiği durumlarda oyun motoru yerel yetkili ana makine (Local Authoritative Host) moduna otomatik olarak geçer ve kesintisiz çalışmayı garanti eder.

### 1.3 Muharebe Matematiksel Modeli ve Girdi-Çıktı Formülleri
Muharebeler, olasılıksal zar atımları, arazi çarpanları, ordu morali yorgunluk katsayıları ve başkent işgal zafiyetlerinin bileşimiyle deterministik simülasyon adımlarında çözülür.

#### 1.3.1 Birlik Tipleri ve Temel Zar Dağılımları (6 Yüzlü Zar / d6)
- Piyade (Maliyet: 3 IP):
  - Taarruz Vuruş Eşiği: 4 ve üzeri zar (Zar >= 4; Basit Olasılık: 3/6 = %50.00)
  - Savunma Vuruş Eşiği: 3 ve üzeri zar (Zar >= 3; Basit Olasılık: 4/6 = %66.67)
  - Tahkimat Bonusu: Savunulan bölge Dağlık veya Şehir arazisi ise (Savunma Bonusu >= +%25), savunma eşiği 2 ve üzerine düşer (Zar >= 2; Basit Olasılık: 5/6 = %83.33).
- Panzer / Zırhlı Birlik (Maliyet: 6 IP):
  - Taarruz Vuruş Eşiği: 3 ve üzeri zar (Zar >= 3; Basit Olasılık: 4/6 = %66.67)
  - Araziye Göre Taarruz Modifikatörü:
    - Çöl / Düzlük arazide: Eşik 2 ve üzeri (Olasılık: %83.33)
    - Dağlık / Şehir arazisinde: Eşik 4 ve üzeri (Olasılık: %50.00)
  - Savunma Vuruş Eşiği: 3 ve üzeri zar (Zar >= 3; Basit Olasılık: %66.67)
- Hava Filosu (Maliyet: 8 IP):
  - Ön Bombardıman Sortisi: 4 ve üzeri zar (Zar >= 4; Basit Olasılık: %50.00)
  - Muharebe Hava Desteği Taarruzu: 3 ve üzeri zar (Zar >= 3; Basit Olasılık: %66.67)
  - Savunma Hava Koruması: 4 ve üzeri zar (Zar >= 4; Basit Olasılık: %50.00)

#### 1.3.2 Ordu Morali ve Taarruz Yorgunluğu (Blitz Fatigue) Sistemi
Bir fraksiyonun aynı tur içerisinde gerçekleştirdiği ardışık taarruz sayısı arttıkça, ikmal hatlarının uzaması ve birliklerin yıpranması ordu moralini düşürür:
- 1. Taarruz: Morale = %100, Hasar Çarpanı = 1.00x, Zayiat Riski Çarpanı = 1.00x
- 2. Taarruz: Morale = %75, Hasar Çarpanı = 0.75x, Zayiat Riski Çarpanı = 1.25x (Savunanın karşı ateşi %25 daha ölümcül olur)
- 3. Taarruz: Morale = %50, Hasar Çarpanı = 0.50x, Zayiat Riski Çarpanı = 1.50x (Savunanın karşı ateşi %50 daha ölümcül olur)
- 4. ve Sonraki Taarruzlar: Morale = %25, Hasar Çarpanı = 0.25x, Zayiat Riski Çarpanı = 2.00x (Taarruz eden birlikler 2 kat zayiat alır)

Hesaplama Formülü:
- Efektif Taarruz İsabeti = Maksimum(0, Yuvarla(Hesaplanan_Taarruz_Zar_İsabetleri * Hasar_Çarpanı))
- Efektif Savunma Karşı Ateş İsabeti = Yukarı_Yuvarla(Hesaplanan_Savunma_Zar_İsabetleri * Zayiat_Riski_Çarpanı)
- Yeni tura geçildiğinde veya tur devredildiğinde ordu morali tekrar %100 seviyesine sıfırlanır.

#### 1.3.3 Başkent İşgal Zafiyeti (Capital Occupation Debuff) & Başkent Taşıma
- Bir ülkenin başkenti düşman kuvvetleri tarafından işgal edildiğinde, o ülkenin savunmadaki tüm birlikleri organizasyon kaybına uğrar ve 3 tur boyunca 2 kat hasar alır:
  - Efektif Alınan Hasar = Efektif Taarruz İsabeti * 2.00
- Eğer başkent 5 tur boyunca düşman kontrolünde kalırsa:
  - Ülkenin elinde en az 3 eyalet bulunuyorsa, hükümet ve genelkurmay otomatik olarak en yüksek sanayiye sahip güvenli iç eyalete tahliye edilir (Başkent Taşıma).
  - Ülkenin elinde 3'ten az eyalet kalmışsa, devlet teslim olur ve elenir.

#### 1.3.4 Yapay Zeka (Bot) Zorluk Seviyeleri Modifikatörleri
- Kolay Mod (Easy):
  - Bot birimlerinin taarruz ve savunma zar isabetleri %75 ile çarpılır (0.75x).
  - Bot taarruz eşiği: Kendi kuvveti hedefin en az 1.70 katı olmadıkça saldırmaz.
  - Bot tur geliri %75'e düşürülür.
- Orta Mod (Normal - Tarihsel Dengeli):
  - Standart 1.00x zar ve gelir katsayısı.
  - Bot taarruz eşiği: 1.25 kat kuvvet üstünlüğü.
- Zor Mod (Hard):
  - Bot birimlerinin zar isabetleri %125 ile çarpılır (1.25x).
  - Bot taarruz eşiği: 1.05 kat kuvvet üstünlüğünde dahi agresif saldırı yapar.
  - Bot tur geliri %125'e çıkarılır.

#### 1.3.5 Zayiat Dağıtım Mantığı (Casualty Distribution)
Bir turda oluşan efektif isabetler birliklere şu öncelik sırasına göre tahsis edilir:
1. Piyade Birlikleri: Ön cephe hattı olarak ilk isabetleri emer.
2. Zırhlı Birlikler: Piyadeler tamamen tükendiğinde zırh zayiatı başlar.
3. Hava Filoları: Yalnızca kara birliklerinin tamamı imha edildiğinde üste konuşlu hava araçları vurulur.

---

## 2. ENGLISH (TECHNICAL DOCUMENTATION)

### 2.1 Architecture Overview
WAR ROOM 1942 is a client-side World War II Grand Strategy game engine simulating the European and Mediterranean Theaters of War.
The engine is written in pure vanilla JavaScript (ES6 Modules), HTML5 Canvas, and Vanilla CSS. The map geometry is projected from real-world GeoJSON datasets (EPSG:4326) into a 2400x1600 canvas coordinate system using Spherical Mercator projection, subdivided into distinct provinces via iterative Sutherland-Hodgman Voronoi half-plane clipping.

### 2.2 Enterprise Network & Security Compliance (Fortinet, Firewall, and Proxy Friendly)
The game engine is engineered to operate reliably within strict enterprise IT environments:
- 100% compatible with Fortinet (FortiGate), Palo Alto Networks, Check Point, Zscaler, and Cisco enterprise firewalls, Deep Packet Inspection (DPI), and SSL inspection proxies.
- Singleplayer campaigns, bot artificial intelligence, combat calculations, and persistence state execute entirely within the local browser sandbox.
- Requires zero outbound telemetry, zero external third-party API dependencies, and no untrusted binary downloads.
- Multiplayer connectivity operates over standard WebRTC data channels. If corporate firewalls restrict external signaling or STUN/TURN, the engine seamlessly defaults to local authoritative host mode without breaking gameplay execution.

### 2.3 Mathematical Combat Model & Input/Output Formats

#### 2.3.1 Unit Statistics & Dice Probabilities (6-Sided Dice / d6)
- Infantry (Cost: 3 IP):
  - Attack Hit Threshold: Roll >= 4 (Probability: 3/6 = 50.00%)
  - Defense Hit Threshold: Roll >= 3 (Probability: 4/6 = 66.67%)
  - Fortification Modifier: When defending in Mountains or Urban terrain (Defense Bonus >= +25%), threshold drops to Roll >= 2 (Probability: 5/6 = 83.33%).
- Armor (Cost: 6 IP):
  - Attack Hit Threshold: Roll >= 3 (Probability: 4/6 = 66.67%)
  - Terrain Combat Modifier:
    - Plains / Desert: Roll >= 2 (Probability: 83.33%)
    - Mountains / Urban: Roll >= 4 (Probability: 50.00%)
  - Defense Hit Threshold: Roll >= 3 (Probability: 66.67%)
- Tactical Air Fleet (Cost: 8 IP):
  - Strategic Air Strike: Roll >= 4 (Probability: 50.00%)
  - Combat Air Support: Roll >= 3 (Probability: 66.67%)
  - Air Defense Interception: Roll >= 4 (Probability: 50.00%)

#### 2.3.2 Army Morale & Blitz Fatigue Degradation
When a faction launches consecutive attacks within the same turn, logistical strain and combat fatigue progressively degrade army morale:
- Attack 1: Morale = 100%, Damage Multiplier = 1.00x, Casualty Risk Multiplier = 1.00x
- Attack 2: Morale = 75%, Damage Multiplier = 0.75x, Casualty Risk Multiplier = 1.25x (+25% casualty vulnerability)
- Attack 3: Morale = 50%, Damage Multiplier = 0.50x, Casualty Risk Multiplier = 1.50x (+50% casualty vulnerability)
- Attack 4+: Morale = 25%, Damage Multiplier = 0.25x, Casualty Risk Multiplier = 2.00x (Double casualties sustained)

Formulas:
- Effective Attacker Hits = Max(0, Round(Attacker_Raw_Hits * Damage_Multiplier))
- Effective Defender Counter-Fire = Ceil(Defender_Raw_Hits * Casualty_Risk_Multiplier)
- Morale resets to 100% at the start of each faction turn.

#### 2.3.3 Capital Occupation Debuff & Emergency Capital Relocation
- When a nation's capital is captured by enemy forces, defending forces suffer organizational disruption, taking double damage for 3 turns:
  - Casualties Sustained = Effective Attacker Hits * 2.00
- If the capital remains occupied for 5 turns:
  - If the nation controls >= 3 provinces, the government is evacuated to the safest interior province with the highest industrial yield (Emergency Relocation).
  - If the nation controls < 3 provinces, the nation capitulates and is eliminated.

#### 2.3.4 Artificial Intelligence (Bot) Difficulty Levels
- Easy:
  - Bot hit output multiplied by 0.75x.
  - Aggression threshold: requires 1.70x numerical superiority before attacking.
  - Income scaled to 0.75x.
- Normal (Historical Balance):
  - 1.00x hit rate and standard income.
  - Aggression threshold: requires 1.25x superiority.
- Hard:
  - Bot hit output multiplied by 1.25x.
  - Aggression threshold: requires only 1.05x superiority (highly aggressive).
  - Income scaled to 1.25x.

#### 2.3.5 Casualty Allocation Priority
1. Infantry: Absorbs incoming damage first.
2. Armor: Takes hits once all infantry casualties are exhausted.
3. Air Fleets: Sustains damage only if all ground defense forces are destroyed.

---

## 3. FILE AND COMPONENT MAP
- index.html: Main application layout, HUD docking, and SVG tactical insignia.
- css/style.css: Military dark tactical interface, glassmorphic HUD styling, and responsive controls.
- js/app.js: Application lifecycle, event delegation, and multiplayer coordination.
- js/engine/geoProjection.js: High-precision GIS Spherical Mercator projection and Voronoi clipping engine.
- js/engine/mapData.js: GeoJSON polygon ingestion, province metadata, and bidirectional neighbor graph.
- js/engine/gameState.js: Turn phase state machine, dynamic diplomacy matrix, morale tracking, and capital relocation.
- js/engine/combat.js: Tactical combat engine, dice simulation, fatigue debuffs, and casualty assignment.
- js/engine/ai.js: Strategic AI decision tree, fast-pass neutral turn loop, and difficulty heuristics.
- js/ui/renderer.js: Hardware-accelerated Canvas Path2D rendering, zoom/pan navigation, and province hit testing.
- js/ui/hud.js: Tactical tab panels (Production, Combat, Movement, Intel, Radio) and toast notification system.
- js/i18n/translations.js: Trilingual localization engine supporting Turkish, English, and Japanese.
