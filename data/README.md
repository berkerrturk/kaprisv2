# Geçici ürün kaynak verileri

`goldium-catalog.json`, Goldium'un açık ürün akışından 26 Eylül 2026 tarihinde
alınan 1.263 ürünün normalize edilmiş katalog kaydıdır. Yüzük, bileklik,
bilezik, kolye, küpe, charm ve takı seti kategorilerini kapsar. Ürünlere ait
2.893 görsel, web kullanımı için 1.000 piksel genişlik isteğiyle
`public/products/goldium/` altında ürün bazlı klasörlere kaydedilmiştir. Kaynakta
yer almayan ayar ve gramaj alanları uydurulmaz; arayüzde bu ürünlere “Tüm
ayarlar” seçeneğiyle erişilebilir. Kaynaktaki `available` alanı hızlı teslimat
tercihinde stokta görünen ürünleri öne almak için kullanılır; siparişten önce
stok yeniden doğrulanır.

Katalog ve görseller `npm run sync:goldium` komutuyla yeniden eşitlenir. Araç
mevcut görselleri tekrar indirmez, eksikleri tamamlar ve katalog dosyasını güncel
kaynak verisiyle yeniden oluşturur. `goldium-catalog-client.json`, tarayıcıya
yalnızca ürün bulucunun ihtiyaç duyduğu alanları taşıyan küçültülmüş kopyadır.

`goldium-minimal-rings.csv`, Goldium'un [Minimal Yüzük koleksiyonunda](https://www.goldium.com.tr/collections/minimal-yuzuk) 16 Eylül 2026 tarihinde görünen 48 ürünün araştırma amaçlı anlık kaydıdır. İlk iki koleksiyon sayfasındaki ürün adları ve fiyatlar, ürün detaylarındaki kod, ayar, renk ve gramaj bilgileriyle eşleştirildi.

Bu dosyadaki bütün kayıtlar `ring` kategorisinde ve Goldium'un kendi koleksiyon sınıflandırmasına göre `minimal` stilindedir. Doğrulanan maden altın, ayar 14K, renk sarıdır. `priceMinor` kuruş cinsinden tam sayıdır; örneğin `602000` değeri 6.020 TL'dir. `sourcePath`, `https://www.goldium.com.tr` adresine eklenerek ürün sayfasına ulaşılır. Boş alan, kaynak sayfada ürün bazında doğrulanamayan bilgidir. `sizeReference`, kaynakta yazan ölçüdür; seçilebilir tüm varyantları veya stok bilgisini temsil etmez.

Goldium tedarikçi ilişkisi ve ürün görsellerinin ALVYA'da kullanım izni proje sahibi tarafından doğrulandı. İlk minimal yüzük örneklerinin görselleri `public/products/` altında, tam katalog görselleri ise `public/products/goldium/` altında tutulur; `goldium-minimal-ring-images.csv` ilk örneklerin kaynak ve yerel dosya eşlemesi içindir. Kaynak ürün adları yazım hataları dahil olduğu gibi korunmuştur. Kaydedilen fiyatlar anlık örnektir; canlı fiyat ve varyant bazlı stok bağlantısı kurulmadığından satın alma düğmesi kapalıdır.

Yerel prototipte bütün Goldium kategorileri ayar, stil ve bütçe adımlarından sonra ALVYA ürün kartlarında gösterilir. Tedarikçi bağlantısı müşteri arayüzünde yer almaz. Bu, satın alma vaadi değildir.
