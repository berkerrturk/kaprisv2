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

## Modelleme ilkeleri

- Stok ve fiyat mağaza/variant seviyesinde tutulmalı.
- Kategoriye özel özellikler tanımlanabilmeli.
- Para değerleri kayan noktalı sayı olarak tutulmamalı.
- Ağırlık birimi açık olmalı.
- Ürün fotoğrafı, web 3D modeli ve üretim CAD'i ayrı medya türleri olmalı.
- Mağaza izolasyonu yetkilendirme katmanında zorunlu olmalı.
