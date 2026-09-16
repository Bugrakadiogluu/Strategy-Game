# 🌍 WAR ROOM 1942 | Strategy Game

[🇹🇷 Türkçe](#-türkçe) | [🇬🇧 English](#-english)

---

## 🇹🇷 TÜRKÇE

Selamlar! 👋 

Bu projeyi geliştirirken tek bir amacım vardı: **Hiçbir şey yüklemekle, veritabanı kurmakla veya sunucu yapılandırmakla uğraşmadan**, doğrudan tarayıcı üzerinden açıp arkadaşlarımla ya da tek başıma oynayabileceğim keyifli bir **2. Dünya Savaşı sıra tabanlı strateji oyunu** yapmak.

Haritayı basit karelerden veya kutulardan ibaret bırakmak istemedim; İtalya çizmesinden Bretonya burunlarına, Normandiya kıyılarından Anadolu ve Kırım'a kadar gerçekçi kıyı çizgileriyle yaşayan bir Avrupa cephesi çizdim.

---

### ✨ Öne Çıkan Özellikler

- 🚀 **Sıfır Kurulum & Sıfır Altyapı:** Ne Redis, ne SQL veritabanı ne de ekstra bir sunucu. Tıkla ve hemen oyna.
- 🗺️ **Gerçekçi Avrupa & Akdeniz Haritası:** Kare kutular yok! Birbiriyle kenetli gerçek kıyı sınırları, fiyortlar, yarımadalar ve denizler.
- 🌐 **Arkadaşınla Oyna (P2P WebRTC):** Oda kuran kişi otomatik olarak oyunun sunucusu olur. 6 haneli oda kodunu arkadaşına gönder, aynı lobide buluşun.
- 🎖️ **Tek Kişilik Sefer Modu:** İnternetin olmasa bile bilgisayara karşı tek başına cephe yönet.
- 🔊 **Prosedürel Ses Motoru:** MP3 dosyalarıyla uğraşmadan, tarayıcının Web Audio API'siyle kod tarafından gerçek zamanlı üretilen topçu, telsiz ve uçak sesleri.
- 💾 **Kayıt Sistemi:** Oyunu kapatman gerekirse tek tıkla tarayıcının hafızasına kaydet, sonra kaldığın yerden devam et.

---

### 🕹️ Nasıl Başlatılır?

1. Projeyi bilgisayarına indir.
2. Klasördeki **`OYNA.bat`** dosyasına çift tıkla.
3. Yerel servis anında başlar ve tarayıcın otomatik açılır:  
   👉 `http://localhost:51942/`
4. Lobiden ister tek kişilik seferi seç, ister arkadaşların için lobi kur!

---

### 🎯 Oyun Nasıl Oynanır?

Oyun sıra tabanlıdır ve her tur 3 ana aşamadan oluşur:

#### 1. Üretim Aşaması (Takviye)
Tur başında sahip olduğun bölgelerden sanayi puanı (IP) kazanırsın. Kendi toprağına tıklayıp asker satın alarak garnizonunu güçlendir:
- 🪖 **Piyade (3 IP):** Savunması kuvvetli, ucuz ve güvenilir omurga birliği.
- 🚜 **Panzer (6 IP):** Taarruzun ana gücü. Her 2 panzer saldırılarına +1 zar avantajı sağlar.
- ✈️ **Taktik Hava Filosu (8 IP):** Kara saldırısından önce düşman hatlarını bombalayıp yıpratır.

#### 2. Taarruz Aşaması (Muharebe)
- Saldırı yapacağın kendi bölgene tıkla, ardından komşu düşman bölgesini seç.
- Uçağın varsa önce hava sortisi ile düşmanı zayıflat.
- Asker sayını belirleyip taarruzu başlat. Zarlar atılır; şehir ve dağ arazileri savunan tarafa avantaj sağlar. Düşman garnizonu bittiğinde o toprak senindir!

#### 3. İntikal Aşaması (Manevra)
- Çatışmalar bitince cephe gerisinde kalan askerlerini dost komşu bölgelere kaydırabilir, sınırlarını sağlama alabilirsin.
- Ardından **"Turu Bitir"** diyerek sırayı devret.

#### 🏆 Zafer Şartı
Avrupa sanayisinin en az **%70'ini** kontrolü altına alan veya tüm düşman başkentlerini (Berlin, Londra, Moskova, Roma) işgal eden taraf savaşı kazanır.

---
---

## 🇬🇧 ENGLISH

Hey there! 👋 

I built **WAR ROOM 1942** with a clear goal in mind: creating an authentic, browser-based **WW2 turn-based strategy game** that requires **zero external servers, zero databases, and zero tedious installations**. Just pure tactical gameplay you can jump into instantly alone or with friends.

Instead of generic square tiles or grid boxes, I crafted a seamless, organic European map featuring authentic coastlines—from the rugged fjords of Norway and the Brittany peninsula to the Italian boot, Sicily, Crimea, and Anatolia.

---

### ✨ Core Features

- 🚀 **Zero Dependency & Plug-and-Play:** No Redis, no SQL, no backend infrastructure needed. Runs directly in any modern browser.
- 🗺️ **Handcrafted Continental Map:** Seamless territory borders with natural peninsulas, bays, and accurate historical theaters.
- 🌐 **P2P Multiplayer (WebRTC):** The lobby host acts as the authoritative game server. Share a 6-digit room code with a friend to play together.
- 🎖️ **Singleplayer Campaign:** Offline-ready mode with automated strategic commanders controlling enemy nations.
- 🔊 **Procedural Web Audio:** No audio files loaded over the network; artillery booms, radio chirps, and sirens are synthesized in real-time.
- 💾 **Local Save / Load:** Save your campaign state straight to browser storage and resume whenever you want.

---

### 🕹️ Quick Start

1. Clone or download this repository.
2. Double-click **`OYNA.bat`** (Windows).
3. The lightweight server starts automatically and opens your browser:  
   👉 `http://localhost:51942/`
4. Choose **Singleplayer** or create a **Multiplayer Lobby** and start conquering!

---

### 🎯 Gameplay Rules

Each turn follows a 3-phase strategic sequence:

#### 1. Production Phase
Collect Industry Points (IP) from your regions at the start of your turn. Select any friendly territory to recruit reinforcements:
- 🪖 **Infantry (3 IP):** Defense specialist; cost-effective garrison backbone.
- 🚜 **Armor / Tank (6 IP):** Offensive powerhouse; every 2 armor units grant a +1 roll combat bonus.
- ✈️ **Fighter Squadron (8 IP):** Conducts preliminary air raids to soften up enemy defenses before ground invasion.

#### 2. Combat Phase
- Select your attacking territory, then click an adjacent hostile territory.
- Optionally launch an air strike to weaken defenders.
- Commit your infantry and armor to assault. Dice are rolled with terrain modifiers (cities and mountains provide defensive bonuses). Wipe out defenders to capture the region!

#### 3. Maneuver Phase
- Relocate rear-guard troops to reinforce newly conquered frontlines.
- Click **End Turn** to pass command to the next faction.

#### 🏆 Victory Condition
Control at least **70% of total European industry** or capture all enemy capitals (Berlin, London, Moscow, Rome) to claim total victory.

---

### 🛠️ Tech Stack

- **Frontend:** Vanilla HTML5, Canvas 2D (`Path2D` vector topology), Modern CSS3 (military glassmorphism war room theme).
- **Audio:** Web Audio API (procedural synthesis).
- **Networking:** PeerJS / WebRTC DataChannels (P2P zero-server multiplayer).
- **Local Server:** Built-in lightweight PowerShell / Node.js static listeners.

---
*Created by [Bugra Kadioglu](https://github.com/Bugrakadiogluu). Feedback and contributions are welcome!*
