# Codex çalışma talimatları

## Okuma sırası

Her görevden önce:
1. `README.md`
2. İlgili `docs/` dosyası
3. `tasks/first-sprint.md` veya görevle ilgili backlog maddesi

## Ürün hedefi

Kapris V2'nin ilk amacı, müşterinin kendi mağazamız ve partner kuyumcuların mevcut stoklarından uygun ürünü yönlendirmeli sorularla bulmasıdır.

## Kapsam kuralları

- Öncelik web MVP'dir.
- Text-to-CAD, AR, üretim CAD'i ve mobil uygulamayı açık talep olmadan uygulama.
- Gelecek özellikler için altyapıyı gereksiz karmaşıklaştırma.
- Kritik ürün kararlarını varsayma; `docs/09-open-questions.md` içine ekle.
- Web için 3D model ile üretim CAD dosyasını aynı varlık gibi ele alma.
- AI CAD çıktısını insan onayı olmadan üretilebilir kabul etme.

## Kod kuralları

- Kullanıcı arayüzü metinleri Türkçe; kod, değişken ve veri alanları İngilizce olsun.
- Küçük, test edilebilir değişiklikler yap.
- Mevcut davranışı değiştiren işlerde test ekle veya güncelle.
- Kimlik bilgisi, anahtar veya gizli veri commit etme.
- Mağazalar arası veri izolasyonunu koru.
- Erişilebilirlik, responsive tasarım ve SEO'yu göz önünde bulundur.
- Teknoloji seçimi yapılmadan framework varsayma.

## Tamamlama ölçütü

Bir görev ancak ilgili kod, test/denetim, hata durumları ve gerekli dokümantasyon tamamlandığında bitmiş sayılır. Sonuçta değişen dosyaları, doğrulamaları ve kalan riskleri kısa biçimde bildir.
