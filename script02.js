// Global değişkenler
let map = null;
let currentEvent = null;
let allEvents = [];
let currentMode = 'pre'; // 'pre' veya 'during' secimi
let userSelectedTarget = null;
let userMarker = null;

// Event Listener'lar
document.getElementById('fetchEventsBtn').addEventListener('click', fetchNASAEvents);
document.getElementById('eventSelect').addEventListener('change', showEventOnMap);
document.getElementById('analyzeBtn').addEventListener('click', generatePlan);

// Sekme dinleyicileri
document.getElementById('tabPreBtn').addEventListener('click', () => setMode('pre'));
document.getElementById('tabDuringBtn').addEventListener('click', () => setMode('during'));

function setMode(mode) {
    currentMode = mode;
    const preBtn = document.getElementById('tabPreBtn');
    const duringBtn = document.getElementById('tabDuringBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');

    // Mod değiştiğinde haritayı ve listeyi sıfırla
    document.getElementById('eventsContainer').classList.add('hidden');
    document.getElementById('eventSelect').innerHTML = '';
    document.getElementById('mapBox').classList.add('hidden');
    document.getElementById('resultBox').classList.add('hidden');
    document.getElementById('fetchEventsBtn').disabled = false;
    document.getElementById('fetchEventsBtn').style.backgroundColor = 'var(--primary)';

    if (map !== null) { map.remove(); map = null; }
    allEvents = [];
    currentEvent = null;
    userSelectedTarget = null;
    userMarker = null;
    analyzeBtn.classList.add('hidden');
    document.querySelector('#mapBox p').innerHTML = 'Seçilen afetin uydu tespit koordinatları haritada işaretlenir.';

    if (mode === 'pre') {
        preBtn.style.backgroundColor = 'var(--primary)';
        preBtn.style.color = 'white';
        preBtn.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';

        duringBtn.style.backgroundColor = '#e2e8f0';
        duringBtn.style.color = '#475569';
        duringBtn.style.boxShadow = 'none';
        analyzeBtn.innerHTML = '🤖 Seçili Bölge İçin Hazırlık Planı Oluştur';

        document.getElementById('dataTitle').innerHTML = '2. Harita Üzerinden Hedef Seçimi (Serbest)';
        document.getElementById('dataDesc').innerHTML = 'Hazırlık planı çıkartılacak ormanı, mahalleyi veya coğrafyayı incelemek için <strong>haritadaki istediğiniz bir noktaya TIKLAYIN.</strong> (NASA verisine gerek yok)';
        document.getElementById('fetchEventsBtn').classList.add('hidden');

        document.getElementById('mapBox').classList.remove('hidden');
        document.querySelector('#mapBox p').innerHTML = '<span style="color:#ef4444; font-weight:bold;">👇 Aşağıdaki haritada kendi seçtiğiniz bir noktaya tıklayıp işaret koyun.</span>';
        initClickableMap();

    } else {
        duringBtn.style.backgroundColor = '#ef4444';
        duringBtn.style.color = 'white';
        duringBtn.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';

        preBtn.style.backgroundColor = '#e2e8f0';
        preBtn.style.color = '#475569';
        preBtn.style.boxShadow = 'none';
        analyzeBtn.innerHTML = '🚨 Seçili Geçmiş Afet İçin Müdahale Analizi Yap';

        document.getElementById('dataTitle').innerHTML = '2. Türkiye Geçmiş Afet Verileri';
        document.getElementById('dataDesc').innerHTML = 'Türkiye\'deki belgelenmiş büyük afetler. Haritada bir olaya tıklayarak seçin.';
        document.getElementById('fetchEventsBtn').innerHTML = '🇹🇷 Türkiye Geçmiş Afetlerini Haritada Göster';
        document.getElementById('fetchEventsBtn').style.backgroundColor = '#ef4444';
        document.getElementById('fetchEventsBtn').classList.remove('hidden');

        document.getElementById('mapBox').classList.remove('hidden');
        document.getElementById('mapDesc').innerHTML = 'Aşağıdaki haritada beliren <b>renkli dairelere</b> tıklayarak analiz etmek istediğiniz afeti seçin.';

        if (map !== null) { map.remove(); }
        map = L.map('map').setView([38.9637, 35.2433], 6);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Uydu Görüntüleri: &copy; Esri'
        }).addTo(map);
    }
}

function initClickableMap() {
    map = L.map('map').setView([38.9637, 35.2433], 6);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Uydu Görüntüleri: &copy; Esri'
    }).addTo(map);

    map.on('click', function (e) {
        if (currentMode !== 'pre') return;
        userSelectedTarget = { lat: e.latlng.lat, lng: e.latlng.lng };
        if (userMarker) { map.removeLayer(userMarker); }
        userMarker = L.marker([userSelectedTarget.lat, userSelectedTarget.lng]).addTo(map)
            .bindPopup("<div style='text-align:center;'><b>📍 Hedef Koordinat Kaydedildi</b><hr style='margin:5px 0'>Raporu oluşturmak için aşağıdaki butona tıklayın.</div>")
            .openPopup();
        document.getElementById('analyzeBtn').classList.remove('hidden');
        document.getElementById('analyzeBtn').disabled = false;
    });
}

// =================================================================
// TURKIYE_DISASTER_EVENTS - İyi belgelenmiş olaylar
// =================================================================
const TURKIYE_DISASTER_EVENTS = [
    {
        id: 'tr-eq-1999-marmara',
        title: '1999 Marmara Depremi',
        description: '17 Ağustos 1999 — Kocaeli/Gölcük merkezli 7.6 Mw deprem. 17.000+ kayıp, 120.000+ bina hasar.',
        magnitude: '7.6 Mw',
        categories: [{ title: 'Earthquake' }],
        geometry: [{ type: 'Point', coordinates: [29.970, 40.748], date: '1999-08-17T03:01:36Z' }]
    },
    {
        id: 'tr-eq-2023-kahramanmaras',
        title: '2023 Kahramanmaraş Depremi',
        description: '6 Şubat 2023 — 7.8 ve 7.7 büyüklüğünde iki deprem. 11 il etkilendi, 50.000+ kayıp.',
        magnitude: '7.8 Mw',
        categories: [{ title: 'Earthquake' }],
        geometry: [{ type: 'Point', coordinates: [37.031, 37.288], date: '2023-02-06T01:17:34Z' }]
    },
    {
        id: 'tr-eq-2011-van',
        title: '2011 Van Depremi',
        description: '23 Ekim 2011 — Van merkezli 7.1 Mw deprem. 600+ kayıp, 4.000+ bina çöktü.',
        magnitude: '7.1 Mw',
        categories: [{ title: 'Earthquake' }],
        geometry: [{ type: 'Point', coordinates: [43.511, 38.691], date: '2011-10-23T10:41:23Z' }]
    },
    {
        id: 'tr-eq-2020-izmir',
        title: '2020 İzmir Depremi',
        description: '30 Ekim 2020 — Ege Denizi\'nde 6.9 Mw deprem. İzmir\'de 114 kayıp.',
        magnitude: '6.9 Mw',
        categories: [{ title: 'Earthquake' }],
        geometry: [{ type: 'Point', coordinates: [26.800, 37.897], date: '2020-10-30T11:51:27Z' }]
    },
    {
        id: 'tr-fire-2021-mugla',
        title: '2021 Muğla Orman Yangınları',
        description: 'Temmuz-Ağustos 2021 — Bodrum, Marmaris, Milas bölgesinde yıkıcı yangınlar. 150.000+ hektar yandı.',
        magnitude: null,
        categories: [{ title: 'Wildfires' }],
        geometry: [{ type: 'Point', coordinates: [27.429, 37.039], date: '2021-07-28T00:00:00Z' }]
    },
    {
        id: 'tr-fire-2021-manavgat',
        title: '2021 Manavgat Orman Yangını',
        description: 'Temmuz 2021 — Antalya-Manavgat\'ta başlayan büyük yangın. 8 kişi hayatını kaybetti.',
        magnitude: null,
        categories: [{ title: 'Wildfires' }],
        geometry: [{ type: 'Point', coordinates: [31.440, 36.786], date: '2021-07-28T00:00:00Z' }]
    },
    {
        id: 'tr-flood-2021-kastamonu',
        title: '2021 Kastamonu-Bartın Sel Felaketi',
        description: 'Ağustos 2021 — Karadeniz bölgesinde şiddetli yağışların neden olduğu sel. 82+ kişi hayatını kaybetti.',
        magnitude: null,
        categories: [{ title: 'Floods' }],
        geometry: [{ type: 'Point', coordinates: [33.773, 41.375], date: '2021-08-11T00:00:00Z' }]
    },
    {
        id: 'tr-flood-2021-sinop',
        title: '2021 Sinop Sel Felaketi',
        description: 'Ağustos 2021 — Sinop\'ta şiddetli yağışların neden olduğu sel. 11 kişi hayatını kaybetti.',
        magnitude: null,
        categories: [{ title: 'Floods' }],
        geometry: [{ type: 'Point', coordinates: [35.153, 42.023], date: '2021-08-11T00:00:00Z' }]
    },
    {
        id: 'tr-flood-2024-istanbul',
        title: '2024 İstanbul Sel Felaketi',
        description: 'Eylül 2024 — İstanbul\'da şiddetli yağışlar. Alt geçitler su altında kaldı, araçlar sürüklendi.',
        magnitude: null,
        categories: [{ title: 'Floods' }],
        geometry: [{ type: 'Point', coordinates: [28.978, 41.015], date: '2024-09-04T00:00:00Z' }]
    },
    {
        id: 'tr-eq-2003-bingol',
        title: '2003 Bingöl Depremi',
        description: '1 Mayıs 2003 — 6.4 Mw deprem. Yatılı okul çöktü, 176 öğrenci hayatını kaybetti.',
        magnitude: '6.4 Mw',
        categories: [{ title: 'Earthquake' }],
        geometry: [{ type: 'Point', coordinates: [40.490, 38.928], date: '2003-05-01T00:27:03Z' }]
    },
    {
        id: 'tr-fire-2021-canakkale',
        title: '2021 Çanakkale Orman Yangını',
        description: 'Temmuz 2021 — Çanakkale\'de çok geniş orman yangını. Lapseki ve çevre köyler tahliye edildi.',
        magnitude: null,
        categories: [{ title: 'Wildfires' }],
        geometry: [{ type: 'Point', coordinates: [26.752, 40.145], date: '2021-07-24T00:00:00Z' }]
    },
    {
        id: 'tr-eq-1999-duzce',
        title: '1999 Düzce Depremi',
        description: '12 Kasım 1999 — Marmara depreminin ardından 7.2 Mw ikinci büyük deprem. 894 kayıp.',
        magnitude: '7.2 Mw',
        categories: [{ title: 'Earthquake' }],
        geometry: [{ type: 'Point', coordinates: [31.130, 40.735], date: '1999-11-12T16:57:22Z' }]
    },
    {
        id: 'tr-eq-2023-hatay',
        title: '2023 Hatay Artçı Depremi',
        description: '20 Şubat 2023 — Hatay\'da 6.4 Mw artçı deprem. Enkazaltındaki binalar tamamen çöktü.',
        magnitude: '6.4 Mw',
        categories: [{ title: 'Earthquake' }],
        geometry: [{ type: 'Point', coordinates: [36.220, 36.202], date: '2023-02-20T17:04:28Z' }]
    },
    {
        id: 'tr-fire-2022-tunceli',
        title: '2022 Tunceli Orman Yangınları',
        description: 'Ağustos 2022 — Tunceli ilinde çok geniş orman yangınları. Binlerce hektar alan kül oldu.',
        magnitude: null,
        categories: [{ title: 'Wildfires' }],
        geometry: [{ type: 'Point', coordinates: [39.548, 39.108], date: '2022-08-10T00:00:00Z' }]
    },
    {
        id: 'tr-flood-2023-canakkale',
        title: '2023 Çanakkale Sel Felaketi',
        description: 'Ocak 2023 — Çanakkale\'de şiddetli yağış ve dolu. Araçlar sürüklendi, alt geçitler battı.',
        magnitude: null,
        categories: [{ title: 'Floods' }],
        geometry: [{ type: 'Point', coordinates: [26.404, 40.146], date: '2023-01-24T00:00:00Z' }]
    }
];

// 1. Afet Verisi Yükleme
async function fetchNASAEvents() {
    const btn = document.getElementById('fetchEventsBtn');
    btn.innerHTML = "📡 Türkiye Afet Arşivi Taranıyor...";
    btn.disabled = true;

    try {
        if (currentMode === 'during') {
            // --- MOD 2: Hardcoded Türkiye afet listesini yükle ---
            allEvents = TURKIYE_DISASTER_EVENTS;
            document.getElementById('eventsContainer').classList.add('hidden');

            // Mevcut CircleMarker'ları temizle
            map.eachLayer((layer) => {
                if (layer instanceof L.CircleMarker) map.removeLayer(layer);
            });

            allEvents.forEach((item) => {
                const geometry = item.geometry[item.geometry.length - 1];
                const lat = geometry.coordinates[1];
                const lng = geometry.coordinates[0];
                const cat = item.categories[0].title;

                const catIcon  = cat === 'Earthquake' ? 'Deprem' : cat === 'Wildfires' ? 'Yang.' : cat === 'Floods' ? 'Sel' : 'Afet';
                const catColor = cat === 'Earthquake' ? '#f97316' : cat === 'Wildfires' ? '#ef4444' : cat === 'Floods' ? '#3b82f6' : '#ef4444';

                const marker = L.circleMarker([lat, lng], {
                    radius: 15, fillColor: catColor, color: '#fff', weight: 2.5, opacity: 1, fillOpacity: 0.85
                }).addTo(map);

                const dateStr = new Date(geometry.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
                const wikiLink = 'https://tr.wikipedia.org/w/index.php?search=' + encodeURIComponent(item.title);

                marker.bindPopup(
                    '<div style="min-width:230px;font-family:sans-serif;border-radius:8px;overflow:hidden;">'
                    + '<div style="background:' + catColor + ';color:white;padding:9px 12px;">'
                    + '<strong style="font-size:13px;">[' + catIcon + '] ' + item.title + '</strong>'
                    + '</div>'
                    + '<div style="padding:10px;">'
                    + '<div style="font-size:11px;color:#64748b;margin-bottom:6px;">'
                    + dateStr + (item.magnitude ? ' &nbsp;|&nbsp; ' + item.magnitude : '')
                    + '</div>'
                    + '<div style="font-size:12px;color:#1e293b;line-height:1.5;margin-bottom:10px;border-left:3px solid ' + catColor + ';padding-left:8px;">'
                    + item.description
                    + '</div>'
                    + '<div style="display:flex;gap:6px;margin-bottom:8px;">'
                    + '<a href="' + wikiLink + '" target="_blank" style="flex:1;text-align:center;padding:5px 3px;border-radius:5px;background:#f1f5f9;color:#059669;text-decoration:none;font-size:11px;font-weight:bold;">Wikipedia</a>'
                    + '</div>'
                    + '<button onclick="selectEventFromMarker(\'' + item.id + '\')" style="width:100%;padding:9px;border-radius:6px;border:none;background:' + catColor + ';color:white;font-weight:bold;cursor:pointer;font-size:13px;">AI Analizi Yap</button>'
                    + '</div></div>'
                );
            });

            btn.innerHTML = allEvents.length + ' Türkiye Afeti Haritada — Tıklayarak seçin';
            btn.style.backgroundColor = '#10b981';

        } else {
            // --- MOD 1: NASA API (DOKUNULMASIN) ---
            const response = await fetch('https://eonet.gsfc.nasa.gov/api/v3/events?status=closed&limit=50');
            const data = await response.json();
            allEvents = data.events;

            const select = document.getElementById('eventSelect');
            select.innerHTML = '<option value="">▼ Lütfen NASA listesinden bir afet seçin</option>';
            allEvents.forEach((item) => {
                const option = document.createElement('option');
                option.value = item.id;
                option.text = '[' + item.categories[0].title + '] ' + item.title;
                select.appendChild(option);
            });
            document.getElementById('eventsContainer').classList.remove('hidden');
            btn.innerHTML = 'Veriler Başarıyla Çekildi ✅';
            btn.style.backgroundColor = '#10b981';
        }
    } catch (error) {
        console.error('Hata:', error);
        btn.innerHTML = 'Yükleme başarısız!';
        if (currentMode !== 'during') alert('NASA EONET verileri alınırken bir hata oluştu.');
    } finally {
        btn.disabled = false;
    }
}

// Harita marker'ından olay seçme
window.selectEventFromMarker = function (id) {
    const event = allEvents.find(e => e.id === id);
    if (!event) return;

    currentEvent = event;
    const geometry = event.geometry[event.geometry.length - 1];
    const coords = geometry.coordinates;
    let lat, lng;
    if (geometry.type === 'Point') { lng = coords[0]; lat = coords[1]; }
    else { lng = coords[0][0][0]; lat = coords[0][0][1]; }

    map.setView([lat, lng], 10);
    document.getElementById('analyzeBtn').classList.remove('hidden');
    document.getElementById('analyzeBtn').disabled = false;
    map.closePopup();

    document.getElementById('analyzeBtn').innerHTML = '🚨 AI Analizi Yap: ' + event.title;
};

// Dropdown seçiminden olay gösterme (Mod 1 için)
function showEventOnMap() {
    const eventId = document.getElementById('eventSelect').value;
    if (!eventId) return;

    currentEvent = allEvents.find(e => e.id === eventId);
    if (!currentEvent || !currentEvent.geometry || currentEvent.geometry.length === 0) return;

    const geometry = currentEvent.geometry[currentEvent.geometry.length - 1];
    const coords = geometry.coordinates;
    let lat, lng;

    if (geometry.type === 'Point') {
        lng = coords[0];
        lat = coords[1];
    } else {
        lng = coords[0][0][0];
        lat = coords[0][0][1];
    }

    document.getElementById('mapBox').classList.remove('hidden');
    document.getElementById('analyzeBtn').classList.remove('hidden');

    if (map !== null) { map.remove(); }

    map = L.map('map').setView([lat, lng], 12);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Uydu Görüntüleri: &copy; Esri'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${currentEvent.title}</b><br>Kategori: ${currentEvent.categories[0].title}<br>Enlem: ${lat.toFixed(4)}<br>Boylam: ${lng.toFixed(4)}`)
        .openPopup();
}

// ============================================================
// generatePlan — Gemini AI Analizi
// ============================================================
async function generatePlan() {
    const apiKey = document.getElementById('apiKey').value.trim();
    if (!apiKey) {
        alert("ÖNEMLİ: Kendi yapay zekanızı kullanmak için lütfen ücretsiz bir Gemini API Anahtarı girin.");
        document.getElementById('apiKey').focus();
        return;
    }

    let lat = null, lng = null;
    let eventName = "Kullanıcının Haritada İşaretlediği Özel Koordinat";
    let eventCategory = "İşaretli Coğrafi Alan";
    let eventDate = new Date().toLocaleDateString('tr-TR');

    if (currentMode === 'pre') {
        if (!userSelectedTarget) {
            alert("Lütfen önce haritaya tıklayarak analiz etmek istediğiniz bir noktayı seçin.");
            return;
        }
        lat = userSelectedTarget.lat;
        lng = userSelectedTarget.lng;
    } else {
        if (!currentEvent) {
            alert("Lütfen önce haritadan bir afet noktasına tıklayarak seçin.");
            return;
        }
        const geometry = currentEvent.geometry[currentEvent.geometry.length - 1];
        const coords = geometry.coordinates;
        if (geometry.type !== 'Point') {
            lng = coords[0][0][0]; lat = coords[0][0][1];
        } else {
            lng = coords[0]; lat = coords[1];
        }
        eventName = currentEvent.title;
        eventCategory = currentEvent.categories[0].title;
        eventDate = geometry.date;
    }

    // Arayüzü güncelle
    document.getElementById('resultBox').classList.remove('hidden');
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('aiResult').innerHTML = "";
    document.getElementById('analyzeBtn').disabled = true;

    // Prompt seçilen moda göre
    let prompt;

    if (currentMode === 'pre') {
        prompt = `Sen uzman bir afet risk analisti ve şehir plancısısın.
        Aşağıda kullanıcının haritada BİZZAT işaretlediği bir bölgenin koordinatları ve o koordinatlara ait yaklaşık 10x10 km'lik alanın güncel statik uydu görüntüsü var.
        Görevin: Bu bölgede olası bir afet (yangın, sel vb.) YAŞANMADAN ÖNCE alınması gereken önlemleri belirten bir "Afet Öncesi Risk ve Hazırlık Planı" oluşturmak.
        Ekli uydu görüntüsüne bizzat bakıp coğrafyayı (orman, yerleşim, nehir vb.) analiz et ve jenerik tahminler YAPMA. Görseldeki gerçek tepeye, dereye, yola göre konuş!
        
        Olay Merkezi (Özel Seçim): ${eventName}
        Koordinatlar: Enlem ${lat}, Boylam ${lng}

        Lütfen planı şu başlıklarla oluştur (Görseli anlattığını hissettir):
        ## 1. Coğrafi Risk Analizi (Uydu görüntüsünden tespit edilen zayıf noktalar)
        ## 2. Afet Öncesi Altyapı ve Hazırlık Planı (Orman hattı, bina mesafesi vb.)
        ## 3. Olası Toplanma ve Konsolidasyon Alanları (Boşluklara bakarak neresi güvenli?)

        Ekstra ve Çok Önemli Kural:
        Yanıtının EN SONUNA, analizine dayanarak haritada işaretlenmesi için 3 adet "Önlem Alınması Gereken Öncelikli Risk Noktası" eklemelisin.
        Bu noktanın yerini EN DOĞRU şekilde belirlemek için sana sunduğum resmin üzerinde A1'den E5'e kadar (Sütunlar A-E, Satırlar 1-5) uzanan bir GÖRSEL IZGARA (GRID) bulunmaktadır.
        Bunu MUTLAKA aşağıdaki gibi SADECE bir JSON dizisi formatında yazmalısın. "gridCell" alanına, o riskin HANGİ HÜCRE İÇERİSİNDE OLDUĞUNU (Örn: "D3", "A2", "C5") yaz:
        
        [
          { "gridCell": "D3", "title": "Bina/Ağaç Sınırı Tehlikesi", "reason": "Buradaki orman sınırı evlere çok yakın, önceden tıraşlanmalı ve tampon bölge açılmalı." },
          { "gridCell": "B1", "title": "Köprü / Dar Yol Riski", "reason": "Batıdaki bu yol olası sel veya yangında kapanma riski taşıyor, alternatif rota şart." }
        ]
        
        Lütfen çok profesyonel ve net ol. Sadece Türkçe yanıt ver.`;
    } else {
        prompt = `Sen uzman bir afet sonrası olay analisti, arama-kurtarma koordinatörü ve kriz yönetimi danışmanısın.
        Sana geçmişte yaşanmış bir Türkiye afetinin koordinatına ait yüksek çözünürlüklü uydu görüntüsü sunuluyor.
        Görüntünün üzerinde A1'den E5'e uzanan bir 5×5 GRID bulunmaktadır.

        Görevin: Uydu görüntüsüne bakarak bu bölgenin topoğrafyasını, yapılaşmasını, yol/dere ağını analiz et.
        Görüntüdeki gerçek yapılara, yollara, dere yataklarına ve araziye doğrudan atıfta bulun — "Grid C3'teki dere yatağı...", "B2 hücresindeki yoğun yapılaşma..." gibi grid bazlı konuş.

        Geçmiş Afet Verisi:
        Olay Adı: ${eventName}
        Kategori: ${eventCategory}
        Tarih: ${eventDate}
        Koordinatlar: Enlem ${lat}, Boylam ${lng}

        Lütfen analizi şu başlıklarla ve HER BAŞLIĞI EN AZ 5-7 CÜMLE/MADDE İLE DETAYLI oluştur:

        ## 1. Hasar Tespiti ve Boyutu
        Bu başlık altında şu konuları AYRINTILI ele al:
        - Afetin tahmini etki alanı (km² veya hektar cinsinden alan büyüklüğü, kaç mahalle/köyün etkilendiği)
        - Uydu görüntüsündeki coğrafya: yapı tipi, yol ağı, su yüzeyi, arazi örtüsü — hangi grid hücrelerinde ne görünüyor?
        - Bu afet türüne özgü beklenen bina yıkımı/sular altı/yanmış alan boyutu ve yoğunluğu
        - Altyapı hasarı: köprüler, yollar, elektrik-haberleşme hatları, kanalizasyon sistemleri
        - Can kaybı, yaralı, tahliye edilen kişi sayısı ve ekonomik kayıp büyüklüğü (tarihsel veriye dayalı tahmin)
        - Sektörel hasar: tarım alanları, sanayi tesisleri, konut stoku, okul-hastane gibi kritik yapılar
        - İkincil tehlikeler: selden sonra çöken zeminler, yangından sonra toprak kayması riski, artçı depremler vb.

        ## 2. Kritik Müdahale Noktaları
        Bu başlık altında şu konuları AYRINTILI ele al:
        - Anında müdahale gerektiren ilk 3 coğrafi alan: uydu görüntüsündeki hangi grid hücrelerinde, hangi fiziksel özelliklere bakarak bu kararı verdin?
        - İtfaiye/arama-kurtarma ekiplerinin hangi güzergahtan ilerlemiş olması gerekirdi ve niçin (tıkanan yollar, alternatif koridorlar)
        - Sağlık lojistiği: ambulans noktaları, helikopter iniş alanları, sahra hastanesi kurulabilecek düz-geniş sahalar
        - Tahliye akışı: en savunmasız nüfus (yaşlı evleri, okullar, bodrum katlar) nerede ve hangi çıkış yolunu kullanmalıydı?
        - Koordinasyon eksiklikleri: bu afet türünde belgelenmiş gecikme veya iletişim hataları nasıl giderilebilirdi?
        - Ağır ekipman ihtiyacı: kranlar, buldozerler, botlar — haritadaki hangi noktaya konuşlandırılmalıydı?
        - Yabancı yardım/sivil katılım entegrasyonu: gönüllü koordinasyonu ve AFAD/Kızılay gibi kurumların saha hakimiyeti

        ## 3. Gelecek İçin Stratejik Dersler
        Bu afetin yaşandığı bölge için geleceğe yönelik 5+ somut önlem öner (yapısal, kurumsal ve teknolojik boyutlarda).

        Ekstra ve Çok Önemli Kural:
        Yanıtının EN SONUNA, analizine dayanarak haritada işaretlenmesi için 3 adet "Kritik Ders/Risk Noktası" eklemelisin.
        Bu noktanın yerini EN DOĞRU şekilde belirlemek için sana sunduğum resmin üzerinde A1'den E5'e kadar (Sütunlar A-E, Satırlar 1-5) uzanan bir GÖRSEL IZGARA (GRID) bulunmaktadır.
        Bunu MUTLAKA aşağıdaki gibi SADECE bir JSON dizisi formatında yazmalısın. "gridCell" alanına, o riskin HANGİ HÜCRE İÇERİSİNDE OLDUĞUNU (Örn: "D3", "A2", "C5") yaz:

        [
          { "gridCell": "D3", "title": "En Yüksek Hasar Bölgesi", "reason": "Bu grid hücresindeki yapı stoğu en ağır etkilenmiş; acil arama-kurtarma önceliği burası olmalıydı." },
          { "gridCell": "B1", "title": "Kritik Müdahale Koridoru", "reason": "Bu hücredeki yol kavşağı tüm lojistik zincirinin anahtarı; tıkanması felç eder, alternatif güzergah şart." },
          { "gridCell": "A4", "title": "İkincil Tehlike Alanı", "reason": "Afet sonrası çökme/taşkın/artçı sarsıntı gibi ikincil tehlikeler bu hücrede yoğunlaşıyor." }
        ]

        Lütfen analitik, kanıta dayalı, kapsamlı ve öğretici tonda ol. Sadece Türkçe yanıt ver.`;
    }

    try {
        // Her iki mod için aynı ArcGIS yakın çekim + 0.015 offset
        const offset = 0.015;
        const bbox = `${lng - offset},${lat - offset},${lng + offset},${lat + offset}`;
        const staticImgUrl = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${bbox}&bboxSR=4326&imageSR=4326&size=600,600&format=png&f=image`;

        document.getElementById('loading').innerHTML = '<span style="font-size: 24px;">📸</span><br>Koordinatın uydu fotoğrafı indiriliyor...';

        let base64Image = null;
        try {
            const imgResponse = await fetch(staticImgUrl);
            const blob = await imgResponse.blob();

            const img = new Image();
            img.crossOrigin = "Anonymous";
            const imgLoadPromise = new Promise((resolve) => {
                img.onload = resolve;
                img.src = URL.createObjectURL(blob);
            });
            await imgLoadPromise;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            // 5×5 Izgara çiz — Mod 1 ile birebir aynı stil
            const cols = 5;
            const rows = 5;
            const cellW = canvas.width / cols;
            const cellH = canvas.height / rows;
            const columns = ['A', 'B', 'C', 'D', 'E'];

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 36px Arial';

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * cellW;
                    const y = j * cellH;

                    ctx.strokeRect(x, y, cellW, cellH);

                    const label = columns[i] + (j + 1);
                    const textX = x + cellW / 2;
                    const textY = y + cellH / 2;

                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    const metrics = ctx.measureText(label);
                    ctx.fillRect(textX - metrics.width / 2 - 10, textY - 20, metrics.width + 20, 40);

                    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
                    ctx.fillText(label, textX, textY);
                }
            }

            const finalImageSrc = canvas.toDataURL("image/jpeg", 0.9);
            base64Image = finalImageSrc.split(',')[1];

            document.getElementById('aiResult').innerHTML = `
                <div style="text-align:center; margin-bottom: 20px;">
                    <span style="font-size: 13px; color: #64748b;">Analiz Edilen Izgaralı Uydu Görüntüsü (A1–E5 Grid):</span><br>
                    <img src="${finalImageSrc}" alt="Uydu Görüntüsü" style="width:100%; max-width:500px; border-radius:8px; display:inline-block; border: 2px solid #e2e8f0; margin-top: 5px;">
                </div>`;
        } catch (imgErr) {
            console.error("Uydu görseli işlemi başarısız:", imgErr);
        }

        document.getElementById('loading').innerHTML = '<span style="font-size: 24px;">🧠</span><br>Yapay zeka uydu fotoğrafını kendi gözleriyle analiz ediyor...';

        // Gemini modelini bul
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const modelsData = await modelsRes.json();

        if (modelsData.error) {
            throw new Error("API Kontrol Hatası: " + modelsData.error.message);
        }

        let targetModel = "models/gemini-2.0-flash";
        const validModels = modelsData.models || [];
        const flashModel = validModels.find(m => m.name.includes('flash') && m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'));
        if (flashModel) { targetModel = flashModel.name; }

        const aiParts = [{ text: prompt }];
        if (base64Image) {
            aiParts.push({ inlineData: { mimeType: "image/jpeg", data: base64Image } });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: aiParts }] })
        });

        const data = await response.json();

        if (data.error) { throw new Error(data.error.message); }

        let aiText = data.candidates[0].content.parts[0].text;

        // JSON risk noktalarını çıkar ve haritaya çiz
        try {
            const jsonRegex = /\[\s*\{[\s\S]*?\}\s*\]/;
            const jsonMatch = aiText.match(jsonRegex);

            if (jsonMatch && jsonMatch[0]) {
                const riskPoints = JSON.parse(jsonMatch[0]);
                aiText = aiText.replace(jsonRegex, "").replace(/```json/g, "").replace(/```/g, "");

                document.getElementById('aiResult').innerHTML += marked.parse(aiText);
                document.getElementById('aiResult').innerHTML += `<h3 style="margin-top:30px; border-bottom:2px solid #ef4444; padding-bottom:10px; color:#ef4444;">🗺️ Kritik Nokta Görsel Analizi</h3>`;

                riskPoints.forEach((point, index) => {
                    let markerLat = parseFloat(lat);
                    let markerLng = parseFloat(lng);

                    if (point.gridCell) {
                        try {
                            const colChar = point.gridCell.charAt(0).toUpperCase();
                            const rowNum = parseInt(point.gridCell.substring(1));
                            const colIndices = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };

                            if (colIndices[colChar] !== undefined && !isNaN(rowNum) && rowNum >= 1 && rowNum <= 5) {
                                const cIdx = colIndices[colChar];
                                const rIdx = rowNum - 1;

                                // Mod 1 ile birebir aynı 0.015 offset
                                const offsetVal = 0.015;
                                const minLng = parseFloat(lng) - offsetVal;
                                const maxLng = parseFloat(lng) + offsetVal;
                                const minLat = parseFloat(lat) - offsetVal;
                                const maxLat = parseFloat(lat) + offsetVal;

                                const dLng = (maxLng - minLng) / 5;
                                const dLat = (maxLat - minLat) / 5;

                                markerLng = minLng + (cIdx * dLng) + (dLng / 2);
                                markerLat = maxLat - (rIdx * dLat) - (dLat / 2);
                            }
                        } catch (err) {
                            console.error("Grid hesaplama hatası:", err);
                        }
                    } else if (point.latOffset !== undefined && point.lngOffset !== undefined) {
                        markerLat = parseFloat(lat) + parseFloat(point.latOffset);
                        markerLng = parseFloat(lng) + parseFloat(point.lngOffset);
                    }

                    // Yakın çekim uydu fotoğrafı (Mod 1 ile aynı mantık)
                    const pOffset = 0.003;
                    const pBbox = `${markerLng - pOffset},${markerLat - pOffset},${markerLng + pOffset},${markerLat + pOffset}`;
                    const pointImgUrl = `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${pBbox}&bboxSR=4326&imageSR=4326&size=300,300&format=png&f=image`;

                    // Haritaya kırmızı çember ekle
                    const riskCircle = L.circleMarker([markerLat, markerLng], {
                        color: '#ef4444',
                        weight: 3,
                        fillColor: '#ef4444',
                        fillOpacity: 0.5,
                        radius: 35
                    }).addTo(map);

                    riskCircle.bindPopup(`
                        <div style="text-align:center; min-width: 200px;">
                            <strong style="color:#ef4444; font-size:14px;">🚨 ${point.title}</strong>
                            <hr style="margin:5px 0; border:0; border-top:1px solid #e2e8f0;">
                            <a href="${pointImgUrl.replace('size=300,300', 'size=1000,1000')}" target="_blank" style="display:block;" title="Büyük Halini Aç">
                                <img src="${pointImgUrl}" style="width:100%; height:120px; object-fit:cover; border-radius:4px; margin-bottom:10px; border: 1px solid #ccc;">
                            </a>
                            <p style="margin:0; font-size:13px; color:#000000; font-weight:500;">${point.reason}</p>
                        </div>
                    `);

                    if (index === 0) riskCircle.openPopup();

                    document.getElementById('aiResult').innerHTML += `
                        <div style="margin-top:15px; padding:15px; border-left:5px solid #ef4444; background:#fef2f2; border-radius:6px; display:flex; gap:20px; align-items:flex-start;">
                            <a href="${pointImgUrl.replace('size=300,300', 'size=1000,1000')}" target="_blank" style="display:block; flex-shrink:0;" title="Tam Boyut İncele">
                                <img src="${pointImgUrl}" alt="Risk Alanı" style="width:120px; height:120px; object-fit:cover; border-radius:8px; border:2px solid #fca5a5; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            </a>
                            <div>
                                <h4 style="margin:0 0 8px 0; color:#b91c1c; font-size:16px;">📍 ${point.title}</h4>
                                <p style="margin:0; font-size:14px; color:#000000; font-weight:500; line-height: 1.6;">${point.reason}</p>
                            </div>
                        </div>
                    `;
                });
            } else {
                document.getElementById('aiResult').innerHTML += marked.parse(aiText);
            }
        } catch (jsonErr) {
            console.error("Risk noktaları JSON ayrıştırma hatası:", jsonErr);
            if (aiText) document.getElementById('aiResult').innerHTML += marked.parse(aiText);
        }

    } catch (error) {
        console.error("AI Error:", error);
        document.getElementById('aiResult').innerHTML = `
            <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 4px; color: #7f1d1d;">
                <strong>Hata Oluştu!</strong><br>
                Yapay zeka planı oluştururken bir sorun yaşandı. Lütfen API anahtarınızın doğru olduğundan emin olun.<br><br>
                <em>Teknik Detay: ${error.message}</em>
            </div>`;
    } finally {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('analyzeBtn').disabled = false;
    }
}
