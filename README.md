# 🎖️ WAR ROOM 1942 - OYUN KILAVUZU & HAREKAT REHBERİ

**WAR ROOM 1942**, 2. Dünya Savaşı Avrupa ve Akdeniz cephesinde geçen, sıra tabanlı, taktiksel harita ve ordu yönetimi odaklı bir strateji oyunudur. 

Hiçbir harici yazılım, veritabanı veya karmaşık kurulum gerektirmez. Doğrudan web tarayıcınız üzerinden tek tıkla çalışır.

---

## 🚀 1. OYUN NASIL BAŞLATILIR?

1. Oyun klasöründeki **`OYNA.bat`** dosyasına çift tıklayın.
2. Arka planda hafif yerel sunucu otomatik olarak ayağa kalkar ve varsayılan web tarayıcınızda oyun açılır:
   - Alternatif olarak tarayıcınızın adres çubuğuna şu adresi yazabilirsiniz:  
     👉 **`http://localhost:51942/`**
3. Karşınıza gelen harekat merkezinden oyun modunuzu seçin:
   - **🎖️ TEK OYUNCULU:** Doğrudan bilgisayara karşı tek başınıza hemen sefere başlayın (%100 çevrimdışı çalışır).
   - **🌐 LOBİ KUR (HOST):** Arkadaşlarınızla oynamak için 6 haneli bir oda kodu üretir (Örn: `NORM42`).
   - **🔗 LOBİYE KATIL:** Arkadaşınızın kurduğu lobinin 6 haneli kodunu girerek oyuna dahil olun.

---

## 🗺️ 2. HARİTA VE KOMUTA KONTROLLERİ

Oyun haritası, 1942 yılı Avrupa, Akdeniz, Kuzey Afrika ve Doğu Cephesi'nin gerçek coğrafi sınırlarını kapsar:

- **Haritada Gezinme (Pan):** Fare sol tuşuna basılı tutarak haritayı dilediğiniz yöne sürükleyebilirsiniz.
- **Yakınlaştırma (Zoom):** Fare tekerleğini ileri/geri çevirerek haritayı yakınlaştırıp uzaklaştırabilirsiniz (veya sol alttaki `+` ve `-` butonlarını kullanabilirsiniz).
- **Haritayı Ortala:** Sol alttaki **"Haritayı Ortala"** butonu haritayı başlangıç konumuna getirir.
- **Bölge Seçimi:** Haritadaki herhangi bir ülkeye veya bölgeye tıkladığınızda o bölgenin garnizon durumu, sanayi kapasitesi ve arazisi sağ panelde açılır.

---

## ⏳ 3. SIRA VE AŞAMA (FAZ) DÖNGÜSÜ

Her tur 3 ana askeri aşamadan meydana gelir:

```
[ AŞAMA 1: ÜRETİM ] ➔ [ AŞAMA 2: TAARRUZ ] ➔ [ AŞAMA 3: İNTİKAL ] ➔ [ TURU BİTİR ]
```

### 🏭 Aşama 1: Üretim ve Takviye (Production)
- Tur başında kontrol ettiğiniz tüm bölgelerin sanayi kapasitesi toplanarak size **Sanayi Puanı (IP)** olarak verilir.
- Haritada kontrolünüz altında olan bir bölgeye tıklayın.
- Sağ paneldeki **ÜRETİM** sekmesinden takviye etmek istediğiniz birlikleri seçin ve **"Birlikleri Bölgeye Konuşlandır"** butonuna basın.

#### Askeri Birimler ve Maliyetleri:
| Birim | Maliyet | Rolü ve Taktik Özelliği |
| :--- | :---: | :--- |
| 🪖 **Piyade Taburu** | **3 IP** | Savunmada güçlüdür. Savunma zarlarında 4, 5 ve 6 atarak düşmanı püskürtür. |
| 🚜 **Panzer (Zırhlı)** | **6 IP** | Taarruzun bel kemiğidir. Hücumda 3, 4, 5 ve 6 atarak vurur. Her 2 panzer taarruz gücünüze +1 ilave bonus sağlar. |
| ✈️ **Taktik Hava Filosu**| **8 IP** | Kara muharebesinden önce düşman mevzilerine hava sortisi düzenleyerek garnizonu yıpratır. |

---

### ⚔️ Aşama 2: Taarruz ve Muharebe (Combat)
Üretimi tamamladıktan sonra üst bardaki **"Harekat Aşamasına Geç"** butonuna basın.

1. **Çıkış Bölgesini Seçin (Origin):** Taarruzu başlatacağınız kendi bölgenize tıklayın (Sarı renkle parıldar).
2. **Hedef Bölgeyi Seçin (Target):** Saldırmak istediğiniz komşu düşman veya tarafsız bölgeye tıklayın (Kırmızı renkle parıldar).
3. **Hava Sortisi (İsteğe Bağlı):** Bölgenizde avcı/bombardıman uçağı varsa önce **"Hava Sortisi Başlat"** butonuna basarak düşman hatlarını bombalayabilirsiniz.
4. **Taarruzu Başlatın:** Saldırıya katılacak piyade ve panzer sayısını belirleyip **"TAARRUZ EMRİNİ VER"** butonuna tıklayın.

#### Muharebe Mekaniği ve Zar Sistemi:
- Muharebe başladığında her iki tarafın birlikleri için otomatik olarak 6 yüzlü zarlar (D6) atılır.
- **Arazi Primi:** Şehirlerde ve dağlık arazilerde savunan taraf korugan avantajına sahiptir (+1 savunma primi).
- Muharebe sonucunda **AAR (After Action Report)** muharebe ceridesi açılır. Her iki tarafın kayıpları listelenir.
- Düşmanın tüm savunma hatları kırıldığında bölge ele geçirilir ve saldıran birlikleriniz yeni toprağa intikal eder!

---

### 🚚 Aşama 3: Stratejik İntikal (Maneuver)
- Muharebeler tamamlandıktan sonra üst bardaki butona basarak intikal aşamasına geçebilirsiniz.
- Bu aşamada, cephe gerisindeki dost birliklerinizi sınır boylarındaki sıcak çatışma bölgelerine aktarabilirsiniz.
- İşleminiz bitince **"Turu Bitir"** butonuna basarak sırayı bir sonraki komutana devredin.

---

## 🚩 4. BÜYÜK DEVLETLER (FACTIONS)

| Bayrak & Devlet | Başkent | Başlangıç Durumu ve Strateji |
| :--- | :--- | :--- |
| 🇩🇪 **Almanya (Mihver)** | **Berlin** | Yüksek sanayi kapasitesi ve ölümcül panzer tümenleri. Doğu ve Batı cephelerinde hızlı yarma harekatı yapmalıdır. |
| 🇬🇧 **Birleşik Krallık (Müttefik)** | **Londra** | Atlantik konvoy hattı, İngiltere adası ve Akdeniz boğazlarını (Cebelitarık, Mısır) elinde tutar. Deniz ve hava üstünlüğü hedefler. |
| 🇷🇺 **Sovyetler Birliği (Müttefik)** | **Moskova** | Geniş bozkırlar, derin savunma hatları ve yüksek insan gücü rezervi. Stalingrad ve Urallar sanayisiyle yıpratma savaşı yürütür. |
| 🇮🇹 **İtalya (Mihver)** | **Roma** | Akdeniz havzası ve Kuzey Afrika çöl harekatı. Trablusgarp ve Balkanlar üzerinde hakimiyet kurmayı hedefler. |
| ⚪ **Tarafsız Ülkeler** | - | İspanya, İsviçre, Türkiye, İsveç gibi tarafsız devletler. İşgal edilirlerse direnirler ancak fethedildiklerinde değerli sanayi puanı sağlarlar. |

---

## 🏆 5. ZAFER ŞARTLARI

Oyunu kazanmak için iki yoldan birini tamamlamalısınız:

1. **Ekonomik ve Sanayi Hakimiyeti:** Haritadaki toplam sanayi kapasitesinin en az **%70'ini** ele geçirip kontrol altına almak.
2. **Mutlak Askeri Zafer:** Tüm düşman başkentlerini (Berlin, Londra, Moskova, Roma) işgal ederek rakiplerinizi tamamen haritadan silmek.

---

## 💾 6. KAYIT VE YÜKLEME (SAVE / LOAD)

- **Oyun Kaydetme:** Üst komuta panelindeki **"💾 Kaydet"** butonuna bastığınızda, mevcut oyun durumu, birimler, sınırlar ve tur geçmişi tarayıcınızın yerel hafızasına (`localStorage`) şifrelenmiş olarak yazılır.
- **Kayıt Yükleme:** İstediğiniz zaman **"📂 Yükle"** butonuna basarak daha önce kaydettiğiniz sefere kaldığınız yerden kesintisiz devam edebilirsiniz.

---

## 📻 7. TELSİZ CERİDESİ VE İSTİHBARAT

- Sağ dock panelindeki **İSTİHBARAT** sekmesinden tüm devletlerin toplam bölge sayısı, canlı birlik mevcudu ve sanayi gelirlerini anlık grafiklerle takip edebilirsiniz.
- **TELSİZ** sekmesinden savaş boyunca gerçekleşen tüm sınır çatışmalarını, fetihleri ve diplomatik gelişmeleri kronolojik askeri ceride olarak okuyabilirsiniz.

---

*İyi harekatlar, Komutan! Zafer stratejinizde saklıdır.*
