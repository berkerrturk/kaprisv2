# Ürün Bulucu Soru Akışı

Ana sayfada kategori kartlarının altında serbest metinle tasarım fikri hazırlama
alanı bulunur. Örnek metinler girişe yardımcı olur; hazırlanan tarif yalnızca
sayfada önizlenir. Bu alan henüz sunucuya talep göndermez veya CAD üretmez.
Alan arka planında kâğıda yüzük çizen kadın fotoğrafı kullanılır; çok hafif
görsel hareket, hareket azaltma tercihinde durur.
Tarif metni gerçek bir bulut silüetinin içine yazılır; ayrı düşünce noktaları
gösterilmez. Düşünen kadın görseli bulutun sol alt köşesinde küçük ve
dekoratif olarak kalır.

## Onaylanan sıra

Kategori seçiminden sonra yüzükte sorular şu sırayla gösterilir:

1. Yüzük kategorisi
2. Altın ayarı
3. Stil
4. Bütçe aralığı

Diğer MVP kategorilerinde yüzük kategorisi adımı gösterilmez; akış altın ayarıyla başlar.

Kullanıcı önceki adıma dönebilir. Kategori, ayar ve stil kartına basınca sonraki
ekran otomatik açılır; adım sayacı ve Devam et düğmesi gösterilmez.

## İlk arayüz yaklaşımı

Altın ayarı müşteriye seçim kartları halinde sunulur:

- 8 ayar
- 14 ayar
- 18 ayar
- 22 ayar

Yüzük seçilince ayardan önce Goldium'un güncel menüsündeki Minimal, Tasarım, Taşlı,
Mineli, Baget, Kalp, Yıldız ve Harf Yüzük seçenekleri yatay kaydırılabilir kart destesi
olarak açılır. Kartlar soldan sağa dağıtılmış görünür; seçim bir sonraki adıma otomatik geçer.
17 Eylül 2026 tarihinde Goldium'un kategori verisinden alınan 187 yüzük ürünü
bu sekiz kategoriye yerleştirilmiştir. Bu kayıtlar canlı stok değildir; ürün
detayında fiyat ve stok siparişten önce doğrulanır. Her müşteri girişinde her
kategori kartı, o kategorinin farklı bir ürün fotoğrafını seçer. Kartın üzerine
gelindiğinde veya klavye odağındayken fotoğraf kartta ve sayfanın tamamında daha
belirgin görünür; kategori adı belirgin biçimde silikleşir.

Kategori ve altın ayarı kartları aynı sayfa alanında sırayla gösterilir; yüzük dışındaki
kategori seçimi altın ayarı kartlarını doğrudan açar. Geri düğmesi kategori seçimine döner. Kartlarda
temsili çizim kullanılmaz. Fotoğrafı henüz eklenmeyen kategoriler ve ayarlar
metin kartı olarak gösterilir.

Yüzük kategori kartında proje sahibinin sağladığı fotoğraf, 14 ayar seçim kartında
ise doğrulanmış 14 ayar katalog fotoğrafı kullanılır. Bu iki kartta temsili çizim
kullanılmaz. Kart boşta iken
fotoğraf gizlidir ve yazı diğer kartlar gibi ortadadır. Üzerine gelindiğinde veya
klavye odağı alındığında fotoğraf kırpılmadan kartın ortasında belirir, yazı silikleşir.
Tıklanma sıralaması henüz
ölçülmediğinden 14 ayar kartının fotoğrafı sayfa girişinde yüzüğün net görüldüğü katalog fotoğrafları
arasından rastgele seçilir; önceki
girişteki ürün bir sonraki seçimden çıkarılır. Tek sayfa görünümünde fotoğraf
değişmez. Tıklanma verisi hazır olduğunda bu geçici seçim, kategori ve ayar
bazında en çok tıklanan uygun ürünle değiştirilir.

Bileklik, bilezik, kolye ve küpe kategori kartlarında da proje sahibinin sağladığı
fotoğraflar aynı hover ve klavye odağı davranışıyla kullanılır. Bu ürünlerin ayarı
doğrulanmadığından fotoğraflar henüz ayar kartlarında veya ürün kataloğunda
kullanılmaz.

Bir kategori kartının üzerine gelindiğinde veya klavyeyle odaklandığında aynı
fotoğraf sayfanın tamamında büyük ve silik arka plan olarak da görünür. Karttan
ayrılınca arka plan kaybolur; bir kategori seçildikten sonraki adımlarda gösterilmez.

Stil adımı seçim kartlarıyla gösterilir. İlk arayüz denemesinde Minimal, Klasik,
Modern ve İddialı geçici seçeneklerdir; katalog taksonomisi olarak onaylanmış
değillerdir. Bir stil kartı seçildiğinde Devam et düğmesine gerek kalmadan bütçe
adımı açılır. Kesin stil seçenekleri ürün verisi hazırlanırken kararlaştırılacaktır.
Bütün stil kartları seçilen kategoriye uygun, birbirinden farklı temsili takı
çizimleri gösterir. Çizimler arka planda düşük kontrastlıdır; ürün fotoğrafı ya da
gerçek stok gösterimi değildir.
Bütçe üç duraklı bir çubukla seçilir: 5.000–10.000 TL, 10.000–20.000 TL ve
20.000 TL üzeri. Sınırlar hesaplamada sırasıyla [5.000, 10.000), [10.000,
20.000) ve [20.000, sınırsız) olarak yorumlanır. Çubuk klavye ve dokunmatik
etkileşimi destekler; hareket eden para simgesi sağa gittikçe büyür. Durak
etiketlerine basarak da seçim yapılabilir. İlk durak varsayılan seçimdir.
Her fiyat etiketinin tam üstünde, çubuğun üzerinde yuvarlak bir nokta bulunur.
Para simgesi sürüklendiğinde bu üç noktadan birine hizalanır.

Soru akışı tamamlandığında seçilen ölçütler özetlenir. Özetin başında `En başa dön`
düğmesi bulunur; bu düğme kategori
seçimine döner. `Tercihlerin hazır` başlığı gösterilmez.
Yüzük, 14 ayar ve Minimal
seçiminde Goldium tedarikçisinden 16 Eylül 2026 tarihinde kaydedilen minimal yüzükler
Kapris kataloğunda bütçe aralığına göre gösterilir. Karttan Kapris içindeki ürün
detayına geçilir; müşteriye tedarikçi sitesine yönlendirme yapılmaz. Diğer
kombinasyonlarda doğrulanmış ürün olmadığı açıkça belirtilir. Fiyat ve stok
henüz canlı bağlanmadığından Kapris üzerinde satın alma açık değildir. Bütçe sınırları
veri modelindeki en küçük para birimine dönüştürülür; son aralığın üst sınırı
yoktur.
