# Ürün Veri Modeli

## Temel varlıklar

- User
- Store
- StoreMember
- Category
- AttributeDefinition
- Product
- ProductVariant
- Inventory
- Price
- Media
- Favorite
- DiscoverySession
- DiscoveryAnswer
- CustomDesignRequest

## Temel Product alanları

Ad, açıklama, kategori, mağaza, stok kodu, ayar, altın rengi, gramaj/aralık, taşlar, ölçüler, stil, kullanım amacı, sertifika, teslim süresi ve yayın durumu.

## MVP kategorileri

- Yüzük (`ring`)
- Bileklik (`bracelet`)
- Bilezik (`bangle`)
- Kolye (`necklace`)
- Küpe (`earring`)

Bileklik ve bilezik ayrı kategorilerdir. Kategori kodları veri alanlarında sabit,
kullanıcıya gösterilen Türkçe adlar ise sunum katmanında tutulur.

## Ürün bulucu cevap sırası

`DiscoveryAnswer` kayıtları aşağıdaki adım sırasını korur:

1. Yüzük seçildiğinde yüzük kategorisi (`ringCollection`)
2. Altın ayarı (`goldKarat`)
3. Stil (`style`)
4. Bütçe aralığı (`minBudgetMinor`, `maxBudgetMinor`)

Bütçe değerleri para biriminin en küçük biriminde tam sayı olarak saklanmalıdır.
`maxBudgetMinor`, 20.000 TL üzeri gibi açık üst sınırda `null` olur. Aralıklar
alt sınır dahil, üst sınır hariç biçiminde yorumlanır.
MVP'de `goldKarat` değeri `8`, `14`, `18` veya `22` olabilir.

## Modelleme ilkeleri

- Stok ve fiyat mağaza/variant seviyesinde tutulmalı.
- Kategoriye özel özellikler tanımlanabilmeli.
- Para değerleri kayan noktalı sayı olarak tutulmamalı.
- Ağırlık birimi açık olmalı.
- Ürün fotoğrafı, web 3D modeli ve üretim CAD'i ayrı medya türleri olmalı.
- Mağaza izolasyonu yetkilendirme katmanında zorunlu olmalı.
