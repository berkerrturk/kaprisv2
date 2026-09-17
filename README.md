# Kapris V2 — Kuyumculuk Marketplace

Kapris V2; müşterilerin kategori, bütçe, altın ayarı, renk, taş ve stil tercihleri üzerinden farklı kuyumcuların mevcut stoklarındaki uygun ürünleri keşfedip satın almasını sağlayan dijital kuyumculuk pazaryeridir.

> Durum: Planlama ve MVP hazırlığı  
> İlk platform: Mobil uyumlu web sitesi  
> Başlangıç pazarı: Türkiye  
> Sonraki platformlar: iOS ve Android

## Ürün ilkesi

**Önce mevcut stoklardan en uygun ürünü bul ve satın al. Seçenekler yeterli değilse isteğini tarif et; ilerleyen aşamada sıfırdan tasarıma geç.**

## Çözülen problem

Müşteriler çok sayıdaki takı arasında doğru ürünü bulmakta, teknik özellikleri karşılaştırmakta ve farklı kuyumcuların stoklarına tek noktadan erişmekte zorlanıyor. Kapris V2 müşterinin ihtiyacını anlaşılır sorularla daraltır ve uygun ürünleri sıralar.

## Temel müşteri yolculuğu

1. Müşteri yüzük, bileklik, bilezik, kolye veya küpe kategorilerinden birini seçer.
2. Önce altın ayarı, sonra stil ve en son bütçe aralığı sorularını yanıtlar.
3. Sistem kendi mağazamız ve partner mağazalardaki uygun stok ürünlerini sunar.
4. Müşteri ürünü inceler, filtreleri değiştirir, alternatiflere bakar ve uygun ürünü siteden satın alır.
5. Seçenekler tatmin etmezse istediği ürünü tarif ederek özel tasarım talebi bırakır.
6. İlerleyen sürümlerde hazır ürünleri kişiselleştirir, AR ile dener veya metin girdisiyle sıfırdan tasarım başlatır.

## MVP kapsamı

- Responsive web sitesi
- Kategori bazlı yönlendirmeli ürün bulucu
- Bütçe, ayar, renk, taş ve stil filtreleri
- Çoklu mağaza ürün kataloğu
- Mağaza bazlı fiyat ve stok
- Ürün listeleme ve detay sayfası
- Sepet, ödeme ve sipariş akışı
- Yakın alternatifler
- Favoriler
- Özel tasarım talep formu
- Yönetici için mağaza, ürün, stok ve talep yönetimi
- Temel analitik olayları

## MVP dışında

İlk sürümde text-to-CAD, üretim CAD'i, AR, tüm ürünlerde 3D görüntüleme, mobil uygulama, otomatik gramaj/maliyet hesabı ve gelişmiş görüntülü görüşme altyapısı zorunlu değildir. Bunlar MVP doğrulandıktan sonra ele alınır.

## Yol haritası

1. **Stok odaklı web MVP:** Çoklu mağaza kataloğu, yönlendirmeli keşif ve satın alma
2. **Ürün kişiselleştirme:** Uygun ürünlerde seçenek bazlı değişiklik ve güncel fiyat/teslimat gösterimi
3. **Görüntülü danışman:** Kendi mağazamızın stok ürünlerinde canlı görüşme/randevu
4. **3D görüntüleme:** Ürünü döndürme ve yakınlaştırma
5. **Text-to-CAD:** Müşteri tarifinden yapılandırılmış brief, tasarım, revizyon ve uzman kontrolü
6. **AR deneme:** Mevcut ürünlerin kategoriye uygun kamera deneyimiyle denenmesi
7. **Mobil uygulama:** Ortak API kullanan iOS ve Android uygulamaları

## Kullanıcı türleri

- Ziyaretçi
- Kayıtlı müşteri
- Mağaza kullanıcısı
- Müşteri danışmanı
- Platform yöneticisi

## Temel ürün verileri

Ürün; mağaza, kategori, stok kodu, fiyat, para birimi, altın ayarı, altın rengi, gramaj veya gramaj aralığı, taş bilgileri, ölçüler, stil, fotoğraflar, stok, teslimat, sertifika ve yayın durumu gibi standart alanlarla tanımlanır. Kategoriye özel alanlar ayrıca desteklenir.

## Teknik yaklaşım

Teknoloji yığını henüz kesinleşmemiştir. Mimari:

- API tabanlı,
- mobil uygulamaya hazır,
- çoklu mağaza destekli,
- rol bazlı yetkilendirmeli,
- SEO uyumlu,
- güvenli ve ölçeklenebilir

olmalıdır. Teknik seçimler gerekçeleriyle [teknik mimari dokümanında](docs/07-technical-architecture.md) kaydedilecektir.

## Referanslar

- **CustomMade:** Kişiye özel tasarım, uzman iletişimi, teklif ve revizyon akışı
- **Blue Nile:** Adım adım ürün oluşturma, taş/metal/model seçimi ve fiyat deneyimi

Referanslar kopyalanmayacak; başarılı deneyim prensipleri Kapris V2'ye uyarlanacaktır.

## Başarı ölçütleri

- Ürün bulucuyu tamamlama oranı
- Sonuçtan ürün detayına geçiş
- Favoriye ekleme
- İletişim veya teklif talebi
- Özel tasarım talebi
- Aradığını bulamayan kullanıcı oranı
- Satışa veya mağaza ziyaretine dönüşüm
- Sepetten ödemeye ve tamamlanan siparişe dönüşüm
- Uygun ürünü bulma süresi

## Proje dokümanları

- [Ürün vizyonu](docs/01-product-vision.md)
- [MVP kapsamı](docs/02-mvp-scope.md)
- [Kullanıcı yolculukları](docs/03-user-journeys.md)
- [Özellik yol haritası](docs/04-feature-roadmap.md)
- [Marketplace operasyonları](docs/05-marketplace-operations.md)
- [Ürün veri modeli](docs/06-product-data-model.md)
- [Teknik mimari](docs/07-technical-architecture.md)
- [AI, CAD, 3D ve AR stratejisi](docs/08-ai-cad-3d-ar-strategy.md)
- [Açık sorular](docs/09-open-questions.md)
- [Ürün bulucu soru akışı](docs/11-discovery-flow.md)
- [İlk sprint](tasks/first-sprint.md)
- [Backlog](tasks/backlog.md)

## Geliştirmeye başlama

Codex veya geliştirici önce `AGENTS.md`, ardından bu README ve ilgili görev dokümanını okumalıdır. MVP kapsamını değiştiren kararlar koddan önce dokümana işlenmelidir.

## Lisans

Proje şu anda özeldir. Açık kaynak lisansı belirlenmemiştir.
