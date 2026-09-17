# 🌍 WAR ROOM 1942 | Strateji Oyunu

[🇹🇷 Türkçe](#-türkçe) | [🇬🇧 English](#-english)

---

## 🇹🇷 TÜRKÇE

Selamlar! 👋 

Bu projeyi geliştirirken tek bir amacım vardı: **Hiçbir şey yüklemekle, veritabanı kurmakla veya harici sunucularla uğraşmadan**, doğrudan tarayıcı üzerinden açıp arkadaşlarımla ya da tek başıma oynayabileceğim, masaüstü kutu oyunları (Axis & Allies, Risk) tadında derinliği olan gerçek bir **2. Dünya Savaşı sıra tabanlı strateji oyunu** yapmak.

Haritayı basit karelerden veya yapay kutulardan ibaret bırakmadım; İskandinav fiyortlarından Bretonya ve Normandiya burunlarına, İtalya çizmesinden Kırım, Anadolu ve Kuzey Afrika çöllerine kadar 35 gerçekçi bölgeyi vektörel kıyı sınırlarıyla ilmek ilmek işledim.

---

### ✨ Öne Çıkan Özellikler

- 🚀 **Sıfır Kurulum & Sıfır Altyapı:** Ne Redis, ne SQL veritabanı ne de karmaşık sunucular. Çift tıkla, saniyeler içinde oyna.
- 🗺️ **35 Bölgeli Canlı Avrupa & Akdeniz Haritası:** Kare kutular yok! Birbiriyle kenetli gerçek kıyı sınırları, yarımadalar, deniz yolları ve körfezler.
- 🎨 **Ayırt Edici Tarihsel Ülke Renkleri:** Almanya artık çelik grisi/antrasit (`#1e293b`), Tarafsız Ülkeler ise sıcak çöl kumu/kumtaşı beji (`#716550`) ile anında ayırt edilir. İngiltere Kraliyet Mavisi (`#1d4ed8`), Sovyetler Kızıl Ordu Kırmızısı (`#b91c1c`), İtalya Alp Yeşili (`#15803d`).
- 🌐 **WebRTC P2P Çok Oyunculu:** Odayı kuran kişi (Host) doğrudan oyunun sunucusu olur. 6 haneli oda kodunu arkadaşına gönder, aracı sunucu olmadan doğrudan tarayıcıdan tarayıcıya (P2P) bağlanıp savaşın.
- 🎖️ **Dinamik Sıra Sistemi:** Hangi ülkeyi seçerseniz seçin (Almanya, İngiltere, Sovyetler veya İtalya), ilk turda sizin seçtiğiniz ülke başlar. Sıra yapay zekaya geldiğinde otomatik botlar takılmadan hamlelerini icra eder.
- ⚡ **60 FPS Lag-Free Canvas 2D:** Çift katmanlı donanım hızlandırmalı fırça darbeleri ve akıllı önbellekleme sayesinde harita akıcı ve takılmasız çalışır.
- 🔊 **Prosedürel Web Audio:** Dışarıdan MP3 indirmeden, tarayıcının ses sentezleyicisiyle anlık üretilen topçu gümbürtüleri, sirenler ve telsiz cızırtıları.
- 💾 **Yerel Hafıza Kaydı:** Oyunu dilediğiniz an tarayıcınıza kaydedip daha sonra kaldığınız yerden devam ettirebilirsiniz.

---

### 🕹️ Hızlı Başlangıç

1. Projeyi bilgisayarına indir.
2. Klasördeki **`OYNA.bat`** dosyasına çift tıkla.
3. Yerel servis anında başlar ve tarayıcın otomatik açılır:  
   👉 `http://localhost:51942/`
4. Lobiden ülkenizi seçin, ister tek kişilik seferi başlatın, ister arkadaşlarınız için oda kurun!

---

### 📊 Detaylı Askeri Mekanikler & Hasar Matematiği

Oyundaki çatışmalar, masaüstü harp oyunlarındaki gibi 6 yüzlü zar (d6) sistemi ve arazi katsayıları üzerine kuruludur:

#### 1. Birlik Türleri ve Savaş Gücü

| Birlik | Maliyet (IP) | Taarruz İsabeti | Savunma İsabeti | Özel Taktiksel Yetenek |
| :--- | :---: | :---: | :---: | :--- |
| 🪖 **Piyade** | **3 IP** | **4+** *(%50)* | **3+** *(%66.7)* | **Siper ve Garnizon:** Savunmada son derece etkilidir. Şehir ve dağda isabet eşiği 2+'ya iner. Gelen ateşi ilk göğüsleyen birimdir. |
| 🚜 **Panzer (Zırhlı)** | **6 IP** | **3+** *(%66.7)* | **3+** *(%66.7)* | **Yarma Gücü (Blitzkrieg):** Düzlük ve çöl arazilerinde taarruzun belkemiğidir. Çölde 2+ (%83.3) ile ezer geçer. Dağda manevrası kısıtlanır (4+). |
| ✈️ **Taktik Hava Filosu** | **8 IP** | **3+** *(%66.7)* | **4+** *(%50)* | **Araziyi Es Geçen Bombardıman:** Kara savaşı öncesinde hava sortisi düzenleyerek düşman mevzilerini doğrudan bombalar. |

---

#### 2. Tankın Verdiği Hasar ve Arazi Çarpanları

Panzerler taarruzun en ölümcül silahıdır; ancak savaşılan arazi tankların hareket kabiliyetini doğrudan etkiler:
- **Ova ve Normal Arazi (Plains):** Panzer taarruzda her zar için **3 ve üzeri (3, 4, 5, 6)** attığında 1 düşman birimini yok eder (İsabet şansı: **%66.7**).
- **Çöl Arazisi (Desert - Kuzey Afrika / Trablus / Tobruk):** Açık arazide tanklar azami hızına ulaşır! Panzer taarruz eşiği **2 ve üzerine (2, 3, 4, 5, 6)** iner. İsabet şansı **%83.3** olur! Rommel taktiği burada can bulur.
- **Dağlık Arazi (Mountains - Alpler / Balkanlar / Kafkaslar):** Dar geçitler ve kayalıklar tank paletlerini kilitler. Panzer taarruz eşiği **4 ve üzerine (4, 5, 6)** geriler (İsabet şansı: **%50**). Dağlık bölgelere piyade ile saldırmak çok daha karlı ve mantıklıdır.

---

#### 3. Uçağın Verdiği Hasar ve Taktik Hava Sortisi

Hava filoları iki farklı şekilde kullanılabilir:

1. **Hava Sortisi (Air Strike - Ön Bombardıman):**
   - Kara birliklerini riske atmadan komşu düşman bölgesine uçak gönderilir.
   - Her uçak için bir zar atılır. **4, 5, 6** gelen her zar doğrudan **1 kesin isabet** demektir (%50 şans).
   - **Kritik Avantaj:** Hava sortisi düşmanın dağ ve şehir savunma tahkimatlarını **tamamen es geçer**! Savunma zarı atılmaz, savunan birlikler karşı ateş açamaz. Kara taarruzu öncesinde düşman yığınağını eritmek için kullanılır.

2. **Müşterek Kara Taarruzunda Hava Desteği:**
   - Piyade ve tanklarla birlikte hücuma kalkan uçaklar **3 ve üzeri** zarlarla taarruza destek verir (%66.7 isabet şansı).

---

#### 4. Hasar Dağılımı ve Zayiat Sıralaması (Casualty Priority)

Bir muharebe turunda isabet alındığında kayıplar şu mantıkla paylaştırılır:
1. **Piyade Kalkanı:** Gelen ilk hasarları her zaman piyadeler üstlenir.
2. **Zırhlı Birlikler:** Piyadeler tükendiğinde tanklar hasar almaya başlar.
3. **Hava Filosu:** En değerli birlik olan uçaklar en son vurulur.
*Taktik İpucu: Pahalı tanklarınızı ve uçaklarınızı korumak için ordunuzun önünde daima ucuz piyade taburları bulundurun!*

---

#### 5. Arazi Türleri ve Savunma Tahkimatları

| Arazi Türü | Simge | Savunma Bonusu | Panzer Taarruz Eşiği | Açıklama |
| :--- | :---: | :---: | :---: | :--- |
| **Ova (Plains)** | 🌾 | **+%0** | 3+ *(%66.7)* | Standart açık arazi. Zırhlı manevrası için uygundur. |
| **Dağ (Mountains)** | ⛰️ | **+%35** | 4+ *(%50)* | Alpler, Norveç, Kafkaslar. Savunan piyade 2+ ile vurur. |
| **Çöl (Desert)** | 🏜️ | **+%10** | 2+ *(%83.3)* | Libya, Mısır. Tankların cirit attığı yüksek tempolu cephe. |
| **Şehir / Başkent (Urban)** | 🏙️ | **+%50** | 3+ *(%66.7)* | Berlin, Londra, Moskova, Roma, Stalingrad. Sokak savaşı savunanı neredeyse yenilmez kılar (Savunma zarı 2+). |

---

#### 6. Sanayi Puanı (IP) ve Gelir Matematiği

Her tur başında kontrol ettiğiniz bölgelerin sanayi kapasitesi toplanarak hazinenize eklenir:
$$\text{Tur Başı IP Geliri} = \sum (\text{Kontrol Edilen Bölge Sanayisi}) + \text{Başkent Bonusu (+5 IP)}$$
- Başkentinizi (Berlin, Londra, Moskova veya Roma) elinizde tuttuğunuz sürece her tur fazladan **+5 IP** alırsınız.
- Başkentinizi kaybederseniz geliriniz ciddi oranda düşer!
- Asgari gelir güvencesi: En kötü durumda bile ülkenin toparlanabilmesi için tur başı asgari **3 IP** garanti edilir.

---

### 🏛️ Ülke Başlangıç Taktikleri

- **🦅 Almanya (Mihver):** Geniş sanayi ve zırhlı gücüyle başlar. İlk turlarda Fransa ve Polonya'yı hızla düşürüp sanayisini katlamalı, iki cepheli savaşa yakalanmadan önce doğu veya batıdan birini emniyete almalıdır.
- **🦁 İngiltere (Müttefik):** Manş Deniz
i ve donanma yollarıyla korunan bir ada kalesidir. Güçlü hava filosuyla kıtadaki düşman yığınaklarını yıpratmalı, Kuzey Afrika ve Akdeniz'i İtalyanlara kaptırmamalıdır.
- **⭐ Sovyetler Birliği (Müttefik):** Geniş insan gücü ve derin toprakları vardır. Moskova ve Stalingrad'ı tahkim edip kış rezervlerini toplamalı, Mihver taarruzu kırıldığında karşı taarruza geçmelidir.
- **🐺 İtalya (Mihver):** Akdeniz havzasının kilit gücüdür. Balkanlar ve Kuzey Afrika'ya doğru genişleyerek Süveyş kanalını zorlamalı, güney cephesini müttefik çıkarmalarına karşı emniyete almalıdır.

---
---

## 🇬🇧 ENGLISH

Hello commanders! 👋

I built **WAR ROOM 1942** with one core philosophy: crafting a rich, authentic **WW2 turn-based grand strategy game** that requires **zero server setups, zero databases, and zero external downloads**—running directly in your web browser with the strategic depth of classic board games like *Axis & Allies* and *Risk*.

Instead of plain square tiles or abstract grids, the game features a seamless vector map with 35 historical territories—complete with realistic coastlines from the fjords of Scandinavia to the cliffs of Dover, the Italian peninsula, Crimea, and the deserts of North Africa.

---

### ✨ Key Features

- 🚀 **Zero Setup & Instant Play:** No Redis, no SQL, no backend configuration. Just double-click and play.
- 🗺️ **35 Handcrafted Vector Territories:** Organic coastal curves, natural peninsulas, maritime choke points, and tactical fronts.
- 🎨 **Distinct Faction Color Palettes:** Germany is rendered in Wehrmacht slate charcoal (`#1e293b`), Neutrals in warm sandstone tan (`#716550`), the UK in Royal Blue (`#1d4ed8`), the USSR in Crimson Red (`#b91c1c`), and Italy in Alpine Green (`#15803d`).
- 🌐 **Serverless P2P Multiplayer (WebRTC):** The room host acts as the authoritative match engine. Share your 6-digit room code with a friend for direct peer-to-peer combat over encrypted DataChannels.
- 🛡️ **Bypasses Fortinet, Enterprise Firewalls & School Blockers:** Runs seamlessly across corporate networks, universities, and strict internet filters:
  - Uses standard **HTTPS (Port 443) and WebRTC TLS/WSS** instead of blocked game ports (Steam 27015, Minecraft 25565, etc.).
  - Deep packet inspection filters (Fortinet FortiGate, Cisco Umbrella, Zscaler, Palo Alto) recognize it as ordinary secure web traffic.
  - 100% in-browser client execution: zero executable downloads or third-party launchers required.
- 🌍 **Trilingual Global Interface:** Seamlessly switch between **English (EN)**, **Turkish (TR)**, and **Japanese (日本語)** with a single click. The entire map, unit descriptions, combat logs, and HUD adapt in real time.
- 🎖️ **Dynamic Starting Turns & Smart Lobby:** Select your game mode at your own pace; the game waits until you click the launch button. Whichever nation you command (Germany, UK, USSR, or Italy), you start first on Turn 1.
- ⚡ **60 FPS Hardware-Accelerated Canvas:** Replaced heavy CPU gaussian blurs with dual-stroke vector passes and cached measurements for butter-smooth map navigation.
- 🔊 **Procedural Web Audio Engine:** Generates realistic artillery thuds, sirens, and radio communications dynamically using the Web Audio API without downloading audio files.
- 💾 **Local Campaign Saves:** Save and restore your battle progress directly in browser storage at any time.

---

### 🌐 Deploying to Netlify & Custom Domain (`bugrakadioglu.dev`)

You can publish the game online and connect it to a subdomain of your personal website (e.g., `game.bugrakadioglu.dev`) in just 2 minutes:

#### Step 1: Deploy on Netlify
1. Log in to [Netlify.com](https://www.netlify.com) using your GitHub account.
2. Click **"Add new site" -> "Import an existing project"** and select **GitHub**.
3. Choose the repository `Bugrakadiogluu/Strategy-Game`.
4. In **Build Settings**:
   - **Build command:** *(Leave empty)* — It's pure HTML/JS/CSS, no build step needed!
   - **Publish directory:** `.` (root directory).
5. Click **"Deploy site"**. Your game is live in seconds at `https://[your-site].netlify.app`!

#### Step 2: Connect Subdomain (`game.bugrakadioglu.dev`) via WordPress DNS
1. In Netlify, go to **Site configuration** -> **Domain management** -> **Add custom domain** and enter `game.bugrakadioglu.dev`.
2. In WordPress.com Domain Manager, go to **Domains** -> `bugrakadioglu.dev` -> **Manage DNS / DNS Records**.
3. Click **Add New Record**:
   - **Type:** `CNAME`
   - **Name (Host):** `game`
   - **Target (Points to):** Your Netlify domain (e.g., `strategy-game-1942.netlify.app`)
   - **TTL:** 3600
4. Save the record. Within 5–10 minutes, Netlify automatically provisions a free SSL certificate, and your game is accessible worldwide at `https://game.bugrakadioglu.dev`!

---

### 📊 Combat Mechanics & Damage Formulas

Combat resolution is calculated using a six-sided die (d6) system combined with defensive terrain multipliers:

#### 1. Unit Profiles

| Unit | Cost (IP) | Attack Hit | Defense Hit | Tactical Role |
| :--- | :---: | :---: | :---: | :--- |
| 🪖 **Infantry** | **3 IP** | **4+** *(50%)* | **3+** *(66.7%)* | **Entrenched Defense:** Reliable shield line. In mountains or cities, defense threshold drops to 2+. Absorbs incoming hits first. |
| 🚜 **Armor (Tank)** | **6 IP** | **3+** *(66.7%)* | **3+** *(66.7%)* | **Blitzkrieg Spearhead:** The offensive backbone. Scores hits on 2+ in desert terrain. Hindered in mountains (4+). |
| ✈️ **Air Squadron** | **8 IP** | **3+** *(66.7%)* | **4+** *(50%)* | **Fortification Buster:** Performs pre-assault air raids bypassing all ground terrain fortifications. |

---

#### 2. Tank Damage & Terrain Modifiers

Tanks are the primary spearhead in any offensive operation, but terrain determines their effectiveness:
- **Plains / Standard Terrain:** Tanks score hits on rolls of **3 or higher (3, 4, 5, 6)**, granting a **66.7% hit probability**.
- **Desert Terrain (North Africa):** Open expanses unlock maximum armored speed! The attack threshold drops to **2+ (2, 3, 4, 5, 6)**, yielding an immense **83.3% hit probability**.
- **Mountainous Terrain (Alps, Balkans, Caucasus):** Choke points hamper armored movement. Tanks hit only on rolls of **4 or higher (4, 5, 6)** (**50% hit probability**).

---

#### 3. Air Strike & Air Support Mechanics

Air wings can be deployed in two operational modes:

1. **Tactical Air Raid (Pre-Assault Bombardment):**
   - Dispatches aircraft against an adjacent hostile territory without committing ground forces.
   - Rolls 1 die per plane; each roll of **4, 5, or 6** scores a guaranteed hit (50% chance).
   - **Crucial Advantage:** Air strikes completely **bypass city and mountain defense bonuses**! Defenders cannot roll defensive return fire during an air strike.

2. **Combined Arms Ground Support:**
   - Aircraft accompanying ground divisions score hits on rolls of **3 or higher** (66.7% chance).

---

#### 4. Casualty Distribution (Armor & Air Protection)

When taking hits during battle rounds, damage is allocated strictly in order of value:
1. **Infantry:** Absorbs all incoming fire first as frontline riflemen.
2. **Armor (Tanks):** Damaged only after all friendly infantry in the assault are eliminated.
3. **Air Squadrons:** Targeted last to safeguard valuable air assets.

---

#### 5. Terrain Fortification Table

| Terrain | Icon | Defense Bonus | Tank Attack Roll | Overview |
| :--- | :---: | :---: | :---: | :--- |
| **Plains** | 🌾 | **+0%** | 3+ *(66.7%)* | Standard open land; ideal for tank advances. |
| **Mountains** | ⛰️ | **+35%** | 4+ *(50%)* | Rugged peaks; defenders hit on 2+. |
| **Desert** | 🏜️ | **+10%** | 2+ *(83.3%)* | High-mobility theater; prime tank territory. |
| **Urban / Capital** | 🏙️ | **+50%** | 3+ *(66.7%)* | Street-to-street fighting makes cities fortress bastions (defenders hit on 2+). |

---

#### 6. Industry Points (IP) & Economy

$$\text{Turn Income} = \sum (\text{Controlled Territory IP}) + \text{Capital Bonus (+5 IP)}$$
- Holding your national capital (Berlin, London, Moscow, or Rome) provides a permanent **+5 IP bonus** per turn.
- A guaranteed baseline income of **3 IP** ensures players always have a chance to mount a comeback.

---

### 🕹️ How to Run

1. Clone or download this repository.
2. Double-click **`OYNA.bat`** (Windows).
3. The game opens in your browser at `http://localhost:51942/`.
4. Pick your nation and lead your forces to victory!

---
*Created by [Bugra Kadioglu](https://github.com/Bugrakadiogluu). Have fun commanding!*
