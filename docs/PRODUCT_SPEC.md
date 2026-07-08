# Sohbetlik Product Spec

## Amac

Sohbetlik, iki insanin birbirini daha dogal ve eglenceli sekilde tanimasina yardim eden mobile-first bir PWA deneyimidir.

Uygulama bir kisilik testi, uyumluluk testi veya karar motoru degildir. Dogru cevap aramaz, insanlari puanlamaz ve "uygun / uygun degil" sonucu uretmez.

Temel fikir:

> Dogru cevaplar degil, guzel sohbetler.

## Ilk Kullanim Akisi

1. Bir kisi oda olusturur.
2. Davet linki veya QR kod karsi tarafa gonderilir.
3. Iki kisi ayni soru setini bagimsiz cevaplar.
4. Ikisi de tamamlayinca sonuc ekrani birlikte gorulur.
5. Ekran ortak yonleri, farkli bakis acilarini ve konusmaya deger basliklari sunar.

## Tasarim Ilkeleri

- Dogru veya yanlis cevap yoktur.
- Yuzde, puan, skor ve uyumluluk derecesi yoktur.
- Dil yargilayici degil, davetkar ve sakin olur.
- Sonuc ekrani karar verdirmek icin degil, sohbet baslatmak icin vardir.
- Ilk bulusmada agir sorulara dusmemek icin seviye sistemi kullanilir.

## Soru Seviyeleri

- Seviye 1: Hafif, eglenceli, ilk tanisma.
- Seviye 2: Karakter ve gunluk ritim.
- Seviye 3: Iletisim, para, iliski aliskanliklari.
- Seviye 4: Gelecek planlari ve ciddi konular.

## Soru Tipleri

- Iki secenekten biri.
- Coktan secmeli.
- 1-5 slider.
- Siralama, ikinci fazda.
- Acik uclu sorular, minimum seviyede.

## AI Kullanimi

AI sadece iki kisi cevaplari tamamladiktan sonra calisir.

AI sunlari yapabilir:

- Benzerlikleri nazikce aciklamak.
- Farkli bakis acilarini yargilamadan yorumlamak.
- "Bu konu hakkinda konusabilirsiniz" turu devam sorulari uretmek.
- Bir sonraki bulusma icin sohbet onerileri cikarmak.

AI sunlari yapmaz:

- Uyumluluk puani uretmez.
- Kirmizi bayrak etiketi koymaz.
- Kimseyi daha iyi/daha kotu diye siniflandirmaz.
- Iliski tavsiyesi veya kesin karar dili kullanmaz.

## Ilk MVP Kapsami

- PWA uyumlu frontend.
- Oda olusturma.
- Davet linki ve QR alanı.
- 20-30 soruluk oturum hedefi.
- Iki kisilik cevap akisi.
- Bekleme ve tamamlanma durumlari.
- Sonuc ekraninda ortak yonler, farkliliklar ve konusma onerileri.
- Groq ile server-side basit sonuc ozeti.

## Tasarim Referansi

Ilk mobil akış konsepti: [initial-mobile-flow-concept.png](design/initial-mobile-flow-concept.png)
