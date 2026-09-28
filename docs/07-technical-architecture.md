# Teknik Mimari

## Durum

Frontend başlangıç teknolojileri seçildi. Diğer teknoloji kararları ilerleyen
görevlerde bu dosyaya eklenecektir.

## Frontend kararı

- **Vue 3:** Bileşen tabanlı, küçük başlayıp büyümeye uygun kullanıcı arayüzü.
- **TypeScript:** Arayüz ve veri modellerinde erken hata yakalama.
- **Vite:** Hızlı yerel geliştirme ve basit üretim derlemesi.

Bu seçim, ilk web MVP iskeletini düşük karmaşıklıkla çalıştırmak için yapılmıştır.

## Yapay zeka danışmanı prototipi

- Sohbet arayüzü yalnızca uygulamanın `/api/chat` sunucu uç noktasına bağlanır.
- OpenAI API anahtarı sunucu ortam değişkeninde tutulur ve tarayıcıya gönderilmez.
- Çok turlu kısa sohbetler Responses API'ye son mesajlarla birlikte, `store: false`
  kullanılarak iletilir.
- Model `OPENAI_CHAT_MODEL` ile değiştirilebilir; prototip varsayılanı
  `gpt-5-mini` modelidir.
- Üretim için aynı uç nokta `functions/api/chat.js` Cloudflare Pages Function
  olarak hazırlanmıştır. `OPENAI_API_KEY` yalnızca Cloudflare secret olarak
  saklanmalıdır.
- Canlı kullanımdan önce hız sınırlama, kötüye kullanım koruması ve
  gözlemlenebilirlik eklenmelidir.

## Medya dağıtımı

- Ürün görselleri yerel geliştirmede `public/products` altından sunulur.
- Ürün görsel yolları `VITE_MEDIA_BASE_URL` değişkeniyle merkezi olarak CDN veya
  nesne depolama adresine yönlendirilebilir.
- Üretimde katalog dosyaları aynı göreli yolları korur. Böylece uygulama kodu ve
  katalog kayıtları yeniden yazılmadan medya sağlayıcısı değiştirilebilir.
- Test ortamında görseller Cloudflare Pages statik ağı üzerinden sunulur. Trafik
  ve katalog büyüdüğünde nesne depolama, özel medya alan adı, önbellek süresi ve
  görsel dönüşüm politikası ayrıca seçilmelidir.

## Test yayını

- Herkese açık test adresi: `https://alvya-staging.pages.dev/`
- Cloudflare Pages projesi: `alvya-staging`
- Yayın dalı: `codex/cloudflare-staging`
- Pages, doğrulanmış `dist` paketini doğrudan yayınlar; Cloudflare üzerinde ek
  derleme komutu çalıştırılmaz.
- Otomatik dağıtım açıktır. Yayın dalına gönderilen yeni commitler aynı test
  adresine aktarılır.
- Mevcut yayın Pages ücretsiz sınırları içinde tutulur. Ücretli depolama veya
  başka bir ücretli Cloudflare özelliği etkinleştirilmemiştir.
- Yapay zeka uç noktası yayındadır ancak `OPENAI_API_KEY` eklenene kadar arayüz
  katalog aramasına yönlendiren güvenli yedek mesajı gösterir.

## Test sipariş akışı

- Web prototipinde ürün listeleme, ürün detayı, yerel sepet ve teslimat formu
  uçtan uca çalışır.
- Test ekranı kart bilgisi istemez, ödeme almaz ve sunucuda gerçek sipariş
  oluşturmaz.
- Canlı sipariş için ödeme sağlayıcısı, stok ayırma, fiyat doğrulama, sipariş
  kaydı ve bildirim servisleri backend üzerinde tamamlanmalıdır.

## Gereksinimler

- SEO uyumlu responsive web
- API tabanlı backend
- İlişkisel ve çoklu mağazaya uygun veri modeli
- Rol bazlı erişim
- Güvenli dosya yükleme
- Arama ve çok boyutlu filtreleme
- Mobil istemcilere hazır API
- Analitik ve hata izleme
- Test ve otomatik dağıtım

## Seçilecek bileşenler

Frontend, backend, veri tabanı, kimlik doğrulama, medya depolama, arama, hosting, e-posta/bildirim, görüntülü görüşme, 3D görüntüleyici ve mobil teknoloji.

## Karar yöntemi

Her seçim için ihtiyaç, alternatifler, maliyet, ekip yetkinliği, ölçeklenme ve çıkış kolaylığı yazılmalıdır. MVP için en basit güvenli çözüm tercih edilir.
