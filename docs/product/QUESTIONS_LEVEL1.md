# Seviye 1 Soru Havuzu — İlk Tanışma

Sürüm: 1.0 (Aşama 3 çıktısı — onay bekliyor)
Son güncelleme: 2026-07-07
Kalite kapısı: `docs/product/QUESTION_WRITING_GUIDE.md` (Bölüm 15 checklist'i her soruya uygulandı)
Sistem uyumu: `docs/product/QUESTION_SYSTEM_DESIGN.md` (metadata şeması, set kısıtları)

Bu ilk parti, varsayılan oda boyutunu (24 soru) tek başına karşılayacak şekilde 24 sorudan oluşur ve set kısıtlarını parti içinde de sağlar: kategori başına ≤3, trait başına ≤2, tip dağılımı 8 ikilem / 10 çoktan seçmeli / 6 slider (~%33/%42/%25).

## Parti Özeti

| # | ID | Kategori | Trait | Tip | Tartışma | Eğlence | Slot |
|---|---|---|---|---|---|---|---|
| 01 | `hep-aldigim-sey` | lezzet | merak-tarzi | ikilem | 4 | 4 | |
| 02 | `gece-mutfagi` | lezzet | ritual-bagliligi | çoktan seçmeli | 3 | 5 | |
| 03 | `catal-diplomasisi` | lezzet | paylasim-istahi | slider | 4 | 5 | |
| 04 | `gece-yolculugu-teklifi` | kesif | spontanlik | ikilem | 5 | 4 | açılış |
| 05 | `tatil-aksami-testi` | kesif | plan-sevgisi | çoktan seçmeli | 4 | 4 | |
| 06 | `valiz-zamani` | kesif | plan-sevgisi | slider | 3 | 4 | |
| 07 | `ezber-film` | kultur | konfor-alani | ikilem | 4 | 4 | |
| 08 | `yeni-sarki-refleksi` | kultur | paylasim-istahi | çoktan seçmeli | 4 | 4 | |
| 09 | `yaz-tatili-karesi` | nostalji | nostalji-bagi | çoktan seçmeli | 4 | 5 | kapanış |
| 10 | `ilk-harclik` | nostalji | para-keyif-dengesi | ikilem | 3 | 4 | |
| 11 | `gecmisle-aran` | nostalji | nostalji-bagi | slider | 3 | 3 | |
| 12 | `hediye-saat` | ritim | sabah-gece-ritmi | ikilem | 4 | 4 | açılış |
| 13 | `bos-pazar` | ritim | ev-disari-dengesi | çoktan seçmeli | 4 | 4 | açılış |
| 14 | `hayat-temposu` | ritim | tempo | slider | 3 | 4 | |
| 15 | `bir-gunluk-hayat` | hayal | macera-istahi | çoktan seçmeli | 4 | 5 | |
| 16 | `mutevazi-super-guc` | hayal | macera-istahi | ikilem | 5 | 5 | açılış/kapanış |
| 17 | `bir-yil-izin` | hayal | oncelik-puslasi | çoktan seçmeli | 4 | 4 | |
| 18 | `gizli-keyif` | itiraf | kucuk-keyifler | çoktan seçmeli | 4 | 5 | |
| 19 | `mesaj-itirafi` | itiraf | temas-ritmi | ikilem | 4 | 4 | |
| 20 | `ev-konseri` | itiraf | kucuk-keyifler | slider | 3 | 5 | kapanış |
| 21 | `tatil-plancisi` | sosyal | grup-rolu | çoktan seçmeli | 5 | 4 | |
| 22 | `gece-sonrasi` | sosyal | enerji-kaynagi | ikilem | 4 | 3 | |
| 23 | `kaos-sistemi` | ev | duzen-kaos | slider | 4 | 4 | |
| 24 | `evden-cikmama-gunu` | ev | ev-disari-dengesi | çoktan seçmeli | 3 | 4 | |

Registry notu: `kucuk-keyifler` trait'i bu partiyle kayda eklenir (zararsız kişisel keyifler ve onları yaşama biçimi). `temas-ritmi` ve `para-keyif-dengesi` normalde S2-3 trait'leridir; burada arkadaşlık/çocukluk çerçevesine alınarak S1'e güvenli biçimde indirilmiştir (ilgili sorularda gerekçesi var).

---

## Tat & Mutfak

### 01 · `hep-aldigim-sey`

kategori `lezzet` (restoran ritüelleri) · trait `merak-tarzi` · seviye 1 · zorluk 1 · tip ikilem · ~8 sn · tartışma 4/5 · eğlence 4/5

**Soru:** Çok sevdiğin bir mekândasın. Menüde hiç denemediğin ama kulağa harika gelen bir şey var. Ne yaparsın?

**Seçenekler:**
- A) Riske girmem — hep aldığımı alırım, zaten o yüzden seviyorum burayı
- B) Yeni olan neyse o — en kötü senin tabağından alırım

**Neden kaliteli:** Sıfat sormadan ("maceracı mısın?") merak tarzını sahneyle yoklar; iki cevap da savunulabilir ve sevimli. B seçeneğindeki "senin tabağından alırım" iki kişilik bağlama göz kırpar, gülümsetir.

**Sohbet önerisi:** Birbirinize "değişmez siparişim" dediğiniz klasiği ve onu ilk keşfettiğiniz anı anlatın.

### 02 · `gece-mutfagi`

kategori `lezzet` (gece atıştırması) · trait `ritual-bagliligi` · seviye 1 · zorluk 1 · tip çoktan seçmeli · ~10 sn · tartışma 3/5 · eğlence 5/5

**Soru:** Gece yarısı, herkes uyuyor, mutfağa süzüldün. Elinde büyük ihtimalle ne var?

**Seçenekler:**
- Dolapta ne bulursam — soğuk soğuk, gerekirse tencereden
- Tatlı bir şeyler; çikolata radarım gece de kapanmaz
- Ciddi iş: kendime düzgün bir sandviç kuruyorum
- Ben sadece su almaya inmiştim, yemin ederim

**Neden kaliteli:** Evrensel ve suçsuz bir "küçük itiraf" sahnesi; her seçenek bir mini karakter vinyeti. Dördüncü seçenek "kaçış" değil, kendi başına espri — rehber 9.3'e örnek uygulama.

**Sohbet önerisi:** Gece mutfağının en garip eserini itiraf etme turu: en tuhaf gece atıştırması hanginizde?

### 03 · `catal-diplomasisi`

kategori `lezzet` (masa kültürü) · trait `paylasim-istahi` · seviye 1 · zorluk 1 · tip slider · ~6 sn · tartışma 4/5 · eğlence 5/5

**Soru:** Masada yemek paylaşımı konusunda neredesin?

**Uçlar:** "Tabağım kalemdir, sınırdır" ↔ "Masadaki her şey ortaktır, çatalım gezer"

**Neden kaliteli:** İki uç da pozitif ve sahiplenilebilir (rehber 11); gerçek bir spektrum. Bir buluşma masasında sorulması bizzat o masayı sohbet konusu yapar — soru, bağlamının içinde yaşar.

**Sohbet önerisi:** Masada tabak paylaşımının kuralları ne olmalı? İkiniz bir "çatal anayasası" yazın.

## Seyahat & Keşif

### 04 · `gece-yolculugu-teklifi`

kategori `kesif` (spontane plan) · trait `spontanlik` · seviye 1 · zorluk 1 · tip ikilem · ~8 sn · tartışma 5/5 · eğlence 4/5 · açılış adayı

**Soru:** Arkadaşın gece 22.00'de aradı: "Hadi şimdi yola çıkalım, sabah deniz kenarındayız." İlk tepkin?

**Seçenekler:**
- A) Çantam beş dakikada hazır, yoldan mesaj atarım
- B) Harika fikir — hafta sonu için planlayalım, düzgün yapalım

**Neden kaliteli:** Rehberin örnek sorusunun (1.1) havuza alınmış hâli: spontanlığı etiketle değil sahneyle yoklar. B seçeneği "reddetmek" değil "iyi planlamak" olarak yazıldı; iki cevap da maceraya açık, sadece zamanlaması farklı.

**Sohbet önerisi:** Hiç plansız çıkılmış bir yolculuğunuz oldu mu? En iyisini ya da en felaket olanını anlatın.

### 05 · `tatil-aksami-testi`

kategori `kesif` (tatil ritmi) · trait `plan-sevgisi` · seviye 1 · zorluk 1 · tip çoktan seçmeli · ~12 sn · tartışma 4/5 · eğlence 4/5

**Soru:** Tatildesin ve bugün tamamen senin. Akşam olduğunda "harika bir gündü" dedirtecek olan hangisi?

**Seçenekler:**
- Haritada yıldızladığım yerlerin hepsini gezmiş olmak
- Plansız sokaklarda kaybolup beklenmedik bir şey keşfetmiş olmak
- Manzara karşısında kitap, uyku ve sıfır acele
- Yerel pazardan garip şeyler alıp bir günlüğüne oralı gibi yaşamış olmak

**Neden kaliteli:** "Nasıl tatil yaparsın?" anket sorusunu akşam muhasebesi sahnesine çevirir; dört seçenek dört farklı zevk, hiçbiri "doğru turist" değil.

**Sohbet önerisi:** Bu dört akşamdan hangisi hayalinizdeki rotada olurdu? Bir sonraki tatil gününü birlikte kurgulayın.

### 06 · `valiz-zamani`

kategori `kesif` (yolculuk hazırlığı) · trait `plan-sevgisi` · seviye 1 · zorluk 1 · tip slider · ~6 sn · tartışma 3/5 · eğlence 4/5

**Soru:** Yolculuğa bir hafta var. Valiz cephesinde durum ne?

**Uçlar:** "Valiz çoktan hazır, listem de var" ↔ "Valiz mi? Çıkarken bir çanta doldururum"

**Neden kaliteli:** Rehber 11'deki örnek etiketlerin uygulanışı: iki uç da karakterli ve övünülebilir, sayı yok, orta nokta ("çoğu hazır, son gece panik") meşru bir konum.

**Sohbet önerisi:** Valizde asla eksik olmayan tuhaf eşyanız ne? İkiniz de birer tane söyleyin.

## Kültür & Eğlence

### 07 · `ezber-film`

kategori `kultur` (izleme alışkanlığı) · trait `konfor-alani` · seviye 1 · zorluk 1 · tip ikilem · ~8 sn · tartışma 4/5 · eğlence 4/5

**Soru:** Boş bir akşam, bir şey açacaksın. Hangisi daha çok çekiyor?

**Seçenekler:**
- A) Yüz kere izlediğim, repliklerini ezbere bildiğim filmim — o bir sarılma gibi
- B) Hiç izlemediğim bir şey — aynı filmi ikinci kez izlemek bana israf gibi geliyor

**Neden kaliteli:** "En sevdiğin film ne?" (liste sorusu, rehber 2.5) yerine izleme davranışını sorar; konfor/yenilik gerilimini film üzerinden görünür kılar. "Sarılma gibi" ve "israf gibi" ifadeleri iki tarafı da duygusal olarak eşitler.

**Sohbet önerisi:** Replikleri ezbere bildiğiniz o yapımı söyleyin — ve neden hiç eskimediğini savunun.

### 08 · `yeni-sarki-refleksi`

kategori `kultur` (müzik davranışı) · trait `paylasim-istahi` · seviye 1 · zorluk 1 · tip çoktan seçmeli · ~12 sn · tartışma 4/5 · eğlence 4/5

**Soru:** Çok sevdiğin yeni bir şarkı keşfettin. Büyük ihtimalle sonra ne olur?

**Seçenekler:**
- Tükenene kadar üst üste dinlerim, sonra bir süre küsüşürüz
- Anında birine gönderirim — güzel şey paylaşınca güzel
- Sessizce kendi listeme eklerim; o artık benim sırrım
- Sanatçının bütün arşivine dalarım, gece orada biter

**Neden kaliteli:** Zevk sorusu değil davranış sorusu; "ne dinlersin?" performans baskısını (rehber 2.1) tamamen atlar. Dört seçenek de içten ve tanıdık; farklı cevaplar "bana da gönderir misin peki?" kapısını açar.

**Sohbet önerisi:** Birbirinize "bunu keşfettiğimde kimseye söylemedim" dediğiniz bir şarkı gönderin.

## Nostalji & Çocukluk

### 09 · `yaz-tatili-karesi`

kategori `nostalji` (çocukluk yazları) · trait `nostalji-bagi` · seviye 1 · zorluk 1 · tip çoktan seçmeli · ~12 sn · tartışma 4/5 · eğlence 5/5 · kapanış adayı

**Soru:** Çocukluğundaki yaz tatillerini düşün. Aklına ilk gelen kare hangisine daha yakın?

**Seçenekler:**
- Memleket, akraba kalabalığı, kuzenler ordusu
- Mahalle: akşam karanlığına kadar sokak, "eve gel" seslenişleri
- Deniz, güneş kremi kokusu, ıslak havlu
- Serin ev hâli: çizgi filmler, kitaplar, uzun öğle uykuları

**Neden kaliteli:** Cevaplama anının kendisi keyifli (rehber 3.2 — hatırlama ödülü); seçenekler görüntü ve koku üzerinden yazıldı, etiket üzerinden değil. Neredeyse herkesin bir karesi var; cevap otomatik olarak anı anlattırır.

**Sohbet önerisi:** Gözünüzü kapatın: çocukluk yazlarından tek bir koku ya da ses seçin, birbirinize anlatın.

### 10 · `ilk-harclik`

kategori `nostalji` (ilk'ler) · trait `para-keyif-dengesi` · seviye 1 · zorluk 1 · tip ikilem · ~8 sn · tartışma 3/5 · eğlence 4/5

**Soru:** Çocukluğuna dön: eline ilk kez gerçekten "senin" olan bir para geçti. Sen hangi çocuktun?

**Seçenekler:**
- A) O para akşama yoktu — neye gittiğini sorma, hatırlamıyorum
- B) Kumbara müdürü — biriktirmenin kendisi ayrı bir oyundu

**Neden kaliteli:** Para trait'ini yetişkin finansı sormadan (S2-3 bölgesi) çocukluk sahnesine indirir: güvenli, tatlı, ama yine de kalıcı bir eğilimin ilk fotoğrafı. "Kumbara müdürü" biriktirmeyi de oyunlaştırır — iki cevap da sevimli.

**Sohbet önerisi:** İlk "kendi paranızla" aldığınız şeyi hatırlıyor musunuz? İkiniz de anlatın.

### 11 · `gecmisle-aran`

kategori `nostalji` (geçmişle ilişki) · trait `nostalji-bagi` · seviye 1 · zorluk 2 · tip slider · ~8 sn · tartışma 3/5 · eğlence 3/5

**Soru:** Geçmişle aran nasıl?

**Uçlar:** "Eski fotoğraflar, eski şarkılar — arada oraya taşınırım" ↔ "Güzeldi, bitti; ben hep sıradakine bakarım"

**Neden kaliteli:** Gerçek bir spektrum ve iki uç da romantize edilebilir: biri duygusal derinlik, öteki ileri bakış. Setin en "düşündüren" sorusu olarak zorluk 2; peak-end eğrisinde ortalarda durmalı.

**Sohbet önerisi:** Dönüp dönüp baktığınız bir fotoğraf ya da şarkı var mı? Neden o?

## Günlük Ritim

### 12 · `hediye-saat`

kategori `ritim` (sabah/gece) · trait `sabah-gece-ritmi` · seviye 1 · zorluk 1 · tip ikilem · ~8 sn · tartışma 4/5 · eğlence 4/5 · açılış adayı

**Soru:** Dünya sana günde bir saat hediye etti: herkes uyurken sen uyanıksın. Bu saati günün hangi ucuna eklersin?

**Seçenekler:**
- A) Sabaha — gün doğarken dünya sadece benimken
- B) Geceye — herkes susunca asıl ben başlarım

**Neden kaliteli:** Klişe "sabah insanı mısın?" sorusunu hediye-saat fantezisiyle yeniden yazar (rehber 2.7'nin bükme tekniği); iki uç da imrenilecek bir sahne olarak kurulur.

**Sohbet önerisi:** O hediye saatte tam olarak ne yapardınız? Sabahçı ve gececi birbirine kendi saatini anlatsın.

### 13 · `bos-pazar`

kategori `ritim` (hafta sonu) · trait `ev-disari-dengesi` · seviye 1 · zorluk 1 · tip çoktan seçmeli · ~12 sn · tartışma 4/5 · eğlence 4/5 · açılış adayı

**Soru:** Pazar sabahı uyandın, gün tamamen boş. İçinden ilk gelen ne?

**Seçenekler:**
- Kahvaltıyı ciddiye alıp günü ağırdan açmak
- Dışarı — boş gün, şehrin benim olduğu gün demek
- Bir plan uydurup birilerini toplamak; boş gün ziyan edilmez
- Boş gün kutsaldır: pijama, koltuk, "bir bölüm daha"

**Neden kaliteli:** Rehber 1.1'deki örnek sahnenin havuz hâli. Dört seçenek dört meşru pazar; "tembel pazar" bile "kutsal" diye çerçevelenerek eşit prestije çekildi (rehber 9.1).

**Sohbet önerisi:** En son "mükemmel geçti" dediğiniz boş gün nasıldı? Detaylarıyla anlatın.

### 14 · `hayat-temposu`

kategori `ritim` (tempo) · trait `tempo` · seviye 1 · zorluk 1 · tip slider · ~6 sn · tartışma 3/5 · eğlence 4/5

**Soru:** Genel yaşam tempon hangi uca yakın?

**Uçlar:** "Aceleye gelmem; dünya beklesin" ↔ "Bekleyemem; yürüyen merdivende de yürürüm"

**Neden kaliteli:** "Yürüyen merdivende de yürürüm" somut ve komik bir davranış imzası — soyut "hızlı yaşarım" yerine görüntü verir. İki uç da özgüvenli.

**Sohbet önerisi:** Hanginiz kimi beklerken sabırsızlanırdı? Birlikte yavaşlamanız ya da hızlanmanız gereken bir an hayal edin.

## Hayaller & Olasılıklar

### 15 · `bir-gunluk-hayat`

kategori `hayal` (hayat değişimi) · trait `macera-istahi` · seviye 1 · zorluk 2 · tip çoktan seçmeli · ~15 sn · tartışma 4/5 · eğlence 5/5

**Soru:** Bir günlüğüne bambaşka bir hayatı yaşayabilirsin; hafızan ve kimliğin sende kalıyor. Hangisini seçerdin?

**Seçenekler:**
- Dünya turnesindeki bir grubun sahneye çıktığı gece
- Kıyı kasabasında küçük bir sahaf-kafenin sıradan salı günü
- Uzay istasyonunda bir gün — evet, tuvaleti dahil
- Büyük bir mutfakta akşam servisinin tam ortası

**Neden kaliteli:** Düşük risk, yüksek hayal gücü (rehber 4 — hipotetik tip); seçenekler adrenalin/huzur/merak/tutku eksenlerine dağılır. "Tuvaleti dahil" mizahı fanteziye gerçeklik göz kırpması ekler.

**Sohbet önerisi:** Seçtiğiniz hayatın o gününde ilk yapacağınız şey ne olurdu?

### 16 · `mutevazi-super-guc`

kategori `hayal` (süper güç) · trait `macera-istahi` · seviye 1 · zorluk 1 · tip ikilem · ~10 sn · tartışma 5/5 · eğlence 5/5 · açılış/kapanış adayı

**Soru:** İki kusurlu süper güçten birini seçmek zorundasın. Hangisi?

**Seçenekler:**
- A) Uçabilirsin — ama yürüme hızında
- B) Işınlanabilirsin — ama sadece daha önce gittiğin bir yere

**Neden kaliteli:** Klişe "hangi süper güç?" sorusunun kusur eklenerek bükülmüş hâli: kusurlar seçimi gerçek bir tartıya çevirir ve cevaptan sonra savunma turu neredeyse garantidir. Setin en yüksek tartışma puanı buradan gelir.

**Sohbet önerisi:** Savunma turu: kendi gücünüzün neden açıkça daha iyi olduğuna birbirinizi ikna etmeye çalışın.

### 17 · `bir-yil-izin`

kategori `hayal` (zaman hediyesi) · trait `oncelik-puslasi` · seviye 1 · zorluk 2 · tip çoktan seçmeli · ~15 sn · tartışma 4/5 · eğlence 4/5

**Soru:** Sana bir yıl izin verildi, geçim derdi yok. Ertesi sabah ilk hamlen ne olurdu?

**Seçenekler:**
- Tek yön bilet; gerisini yolda çözerim
- Hep ertelediğim o şeyi öğrenmeye yazılırım
- Sevdiklerime uzun kahvaltılar borcum var; ödemeye başlarım
- Bir hafta dinlenirim, sonra dayanamayıp kendime bir proje açarım

**Neden kaliteli:** Önceliklerin (S2-4 bölgesi) hayal çerçevesinde güvenli ön izlemesi: kimse "hayat planını" savunmak zorunda kalmaz ama cevaplar yine de çok şey anlatır. Dördüncü seçenek "dinlenemeyenler" için dürüst ve komik bir ayna.

**Sohbet önerisi:** O "hep ertelediğim şey" ne? İkiniz de birer tane itiraf edin.

## Küçük İtiraflar

### 18 · `gizli-keyif`

kategori `itiraf` (suçlu zevkler) · trait `kucuk-keyifler` · seviye 1 · zorluk 1 · tip çoktan seçmeli · ~12 sn · tartışma 4/5 · eğlence 5/5

**Soru:** Herkesin kimseye pek anlatmadığı küçük bir keyfi vardır. Seninki hangi bölgeden?

**Seçenekler:**
- Yaşıma sorulmayacak diziler/filmler — ve hiç pişman değilim
- Utanç verici derecede yapışkan şarkılar; listede gizli klasördeler
- İnternetin tuhaf köşeleri — buna araştırma diyelim
- Aşırı spesifik bir yeme-içme tuhaflığı; sormayın, yaşıyorum

**Neden kaliteli:** Karşılıklı küçük itiraf, hızlı yakınlık üreten en güvenli mekanizma (rehber 3 ve 4); seçenekler kategori verir ama teşhiri kullanıcıya bırakır — isteyen sohbette açar. Mizah kişiye değil duruma güler.

**Sohbet önerisi:** Cesaret turu: gizli keyfinizden birer somut örnek verin. Gülmek serbest, yargı yasak.

### 19 · `mesaj-itirafi`

kategori `itiraf` (dijital alışkanlık) · trait `temas-ritmi` · seviye 1 · zorluk 1 · tip ikilem · ~8 sn · tartışma 4/5 · eğlence 4/5

**Soru:** Dürüstlük anı: mesajlaşmada sen hangisisin?

**Seçenekler:**
- A) "Sonra cevaplarım" deyip üç gün sonra utançla dönen benim
- B) Yazışma yarım kalamaz; okundu bilgim dürüsttür, cevabım anında

**Neden kaliteli:** Mesajlaşma *beklentisini* (S3 konusu) sormadan, herkesin arkadaşlıklarından bildiği alışkanlığı itiraf çerçevesinde sorar. A seçeneği kusuru komikleştirerek güvenli kılar; iki taraf da kendini gönül rahatlığıyla seçebilir.

**Sohbet önerisi:** Telefonunuzdaki en eski "cevaplanacaklar" mesajı ne kadar eski? Dürüstlük turu.

### 20 · `ev-konseri`

kategori `itiraf` (yalnız hâller) · trait `kucuk-keyifler` · seviye 1 · zorluk 1 · tip slider · ~6 sn · tartışma 3/5 · eğlence 5/5 · kapanış adayı

**Soru:** Evde yalnızsın ve müzik açtın. Sahne ne durumda?

**Uçlar:** "Fonda çalar, ben işime bakarım" ↔ "Ev sahneye döner; süpürge mikrofon olabilir"

**Neden kaliteli:** Herkesin bildiği ama kimsenin sorulmadığı bir yalnızlık hâli; yüksek uç utanç değil coşku olarak yazıldı. Gülümseten kapanış sorusu profiline tam oturur (peak-end).

**Sohbet önerisi:** Sizi en çok bu moda sokan şarkı hangisi? Birbirinize açın.

## Sosyal Dünya

### 21 · `tatil-plancisi`

kategori `sosyal` (grup rolü) · trait `grup-rolu` · seviye 1 · zorluk 1 · tip çoktan seçmeli · ~12 sn · tartışma 5/5 · eğlence 4/5

**Soru:** Arkadaş grubun bir tatil planlıyor. Sen büyük ihtimalle hangisisin?

**Seçenekler:**
- Tabloyu açan, uçuşları bulan, herkesi hizaya sokan organizatör
- "Ben her şeye varım" diyen, planı taşımayan tatlı yolcu
- Son dakika "geliyorum ama şöyle olsa?" diyen revizyoncu
- Plana katkısı sıfır ama orada herkesi güldüren moral sorumlusu

**Neden kaliteli:** Kendini dışarıdan görme tipi (rehber 4) grup sahnesiyle birleşir; dört rol de sevgiyle yazıldı, "revizyoncu" bile tanıdık bir dostluk figürü. İki kişinin rolleri yan yana gelince ("ikimiz de yolcuyuz, tatil kim yapacak?") espri kendiliğinden doğar.

**Sohbet önerisi:** Grup tatillerinden birer efsane anı: plan tutmadığında ne oldu?

### 22 · `gece-sonrasi`

kategori `sosyal` (sosyal enerji) · trait `enerji-kaynagi` · seviye 1 · zorluk 1 · tip ikilem · ~8 sn · tartışma 4/5 · eğlence 3/5

**Soru:** Kalabalık, güzel bir geceden çıktın. Kapı kapandığı an içindeki his hangisi?

**Seçenekler:**
- A) Şarj oldum — eve gelince de susamıyorum
- B) Harikaydı ama pilim bitti; şimdi sessizlik, güzel sessizlik

**Seçenekler notu:** İkisi de geceyi sevmiş durumda; fark gecenin *sonrasında*.

**Neden kaliteli:** İçe/dışa dönüklüğü etiketle değil, gece sonrası tek bir anla sorar. Kritik tasarım: iki seçenek de "gece güzeldi" der — böylece "sosyal olmayan" damgası imkânsızlaşır (rehber 9.1).

**Sohbet önerisi:** İkiniz için de mükemmel bir gece nasıl biter? Saatiyle, sahnesiyle anlatın.

## Ev Hâli

### 23 · `kaos-sistemi`

kategori `ev` (düzen) · trait `duzen-kaos` · seviye 1 · zorluk 1 · tip slider · ~6 sn · tartışma 4/5 · eğlence 4/5

**Soru:** Yaşam alanın hangi uca yakın?

**Uçlar:** "Her şeyin bir yeri var ve oradadır" ↔ "Kaos gibi görünür ama içinde bir sistemim var"

**Neden kaliteli:** Rehber 11'in birebir uygulaması: "düzenli ↔ dağınık" yargı eksenini "iki farklı sistem" eksenine çevirir. Yüksek uç özür değil, özgüvenli bir beyan.

**Sohbet önerisi:** Birbirinize "benim köşem" dediğiniz alanı tarif edin — kimsenin karışamayacağı bölge.

### 24 · `evden-cikmama-gunu`

kategori `ev` (ev günü) · trait `ev-disari-dengesi` · seviye 1 · zorluk 1 · tip çoktan seçmeli · ~12 sn · tartışma 3/5 · eğlence 4/5

**Soru:** Bugünü resmen "evden çıkmama günü" ilan ettin. Evin en canlı köşesinde ne oluyor?

**Seçenekler:**
- Mutfak mesaisi: bir şeyler pişiyor, ev güzel kokuyor
- Koltuk + battaniye + "son bir bölüm" yalanı
- Masaya yayılmış yarım projeler ve hobiler — bugün onların günü
- Balkon/pencere kenarı: ben evdeyim ama gözüm dışarıda

**Neden kaliteli:** "Evde ne yaparsın?" yerine evin *en canlı köşesini* sorar — mekân üzerinden alışkanlık anlattırır. "Son bir bölüm yalanı" öz-ironiyle herkesin bildiği hâli meşrulaştırır.

**Sohbet önerisi:** Evden çıkmama günlerinizi birleştirseniz o evde neler olurdu? Menüsüyle kurgulayın.

---

## Parti Doğrulaması

- Kategori dağılımı: lezzet 3, kesif 3, kultur 2, nostalji 3, ritim 3, hayal 3, itiraf 3, sosyal 2, ev 2 — hepsi ≤3. ✔
- Trait dağılımı: 18 farklı trait, hiçbiri 2'den fazla kullanılmadı. ✔
- Tip dağılımı: 8 ikilem, 10 çoktan seçmeli, 6 slider. ✔
- Açılış adayları (`fun ≥ 4`, zorluk 1): 04, 12, 13, 16. Kapanış adayları: 09, 16, 20. ✔
- Süre bütçesi: toplam ~236 sn saf cevap + okuma/geçiş payı ≈ kişi başı 6-7 dk. Hedef bandın içinde. ✔
- Yasak kelime taraması (`normal`, `hâlâ`, `bile`, `en azından` — soru/seçenek metinlerinde): temiz. ✔
- Her soru rehber Bölüm 15 checklist'inden geçirildi; elenenler için aşağıya bakınız.

## Üretimde Elenenler (kayıt için)

Kalite kapısında düşen taslaklardan örnekler — gelecekteki yazarlara kalibrasyon:

- "Kahvaltıda tatlı mı tuzlu mu?" — klişe, bükülemedi (rehber 2.7).
- "En son ne zaman spontane bir şey yaptın?" — açık uçlu + performans baskısı; yerine 04 yazıldı.
- "Telefonunda kaç okunmamış bildirim var?" — sayısal döküm, anket hissi (rehber 5); yerine 19 yazıldı.
- "Ev arkadaşınla nasıl geçinirdin?" — yaşam durumu varsayımı (rehber 1.7).
- "Partide ilk giden mi son kalan mısın?" — 22 ile aynı trait'i daha yargı-riskli çerçevede soruyordu; zayıf olan elendi.

## Sonraki Adım (onay sonrası)

Tasarım dokümanı Bölüm 12 sırasıyla: bu 24 soru `src/content/questions/level1.ts` olarak kodlanır, `questions:lint` doğrulayıcısı yazılır, seed migration üretilir ve eski 8 demo sorusu pasifleştirilir.
