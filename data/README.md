# Geçici ürün kaynak verileri

`goldium-minimal-rings.csv`, Goldium'un [Minimal Yüzük koleksiyonunda](https://www.goldium.com.tr/collections/minimal-yuzuk) 16 Eylül 2026 tarihinde görünen 48 ürünün araştırma amaçlı anlık kaydıdır. İlk iki koleksiyon sayfasındaki ürün adları ve fiyatlar, ürün detaylarındaki kod, ayar, renk ve gramaj bilgileriyle eşleştirildi.

Bu dosyadaki bütün kayıtlar `ring` kategorisinde ve Goldium'un kendi koleksiyon sınıflandırmasına göre `minimal` stilindedir. Doğrulanan maden altın, ayar 14K, renk sarıdır. `priceMinor` kuruş cinsinden tam sayıdır; örneğin `602000` değeri 6.020 TL'dir. `sourcePath`, `https://www.goldium.com.tr` adresine eklenerek ürün sayfasına ulaşılır. Boş alan, kaynak sayfada ürün bazında doğrulanamayan bilgidir. `sizeReference`, kaynakta yazan ölçüdür; seçilebilir tüm varyantları veya stok bilgisini temsil etmez.

Goldium tedarikçi ilişkisi ve ürün görsellerinin Kapris'te kullanım izni proje sahibi tarafından doğrulandı. 48 ürünün görseli `public/products/` altında yerel WebP veya JPEG dosyası olarak tutulur; `goldium-minimal-ring-images.csv` kaynak ve yerel dosya eşlemesi içindir. Kaynak ürün adları yazım hataları dahil olduğu gibi korunmuştur. Kaydedilen fiyatlar anlık örnektir; canlı fiyat ve varyant bazlı stok bağlantısı kurulmadığından satın alma düğmesi kapalıdır.

Yerel prototipte yüzük → 14 ayar → Minimal seçiminden sonra bütçeye uyan kayıtlar Kapris ürün kartı ve ürün detayında gösterilir. Tedarikçi bağlantısı müşteri arayüzünde yer almaz. Bu, satın alma vaadi değildir. İlk bütçe aralığına 42, ikinciye 2 ürün girer; 4 ürün 5.000 TL altında kalır ve 20.000 TL üzeri aralıkta kayıt yoktur.
