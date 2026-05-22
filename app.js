const tableBody = document.getElementById('cryptoTableBody');
const searchInput = document.getElementById('cryptoSearch');
const topGainerPara = document.getElementById('topGainer');

let coinData = []; 

// السيرفر البديل السريع والمستقر (CryptoCompare) عشان نخلص من ليميت السيرفر القديم
const API_URL = 'https://min-api.cryptocompare.com/data/top/mktcapfull?limit=20&tsym=USD';

async function fetchMarketData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        // هنا بنعيد ترتيب البيانات اللي جاية من السيرفر الجديد لتناسب شكل الجدول بتاعنا
        coinData = result.Data.map((item, index) => ({
            market_cap_rank: index + 1,
            name: item.CoinInfo.FullName,
            symbol: item.CoinInfo.Name,
            current_price: item.RAW?.USD?.PRICE || 0,
            price_change_percentage_24h: item.RAW?.USD?.CHANGEPCT24HOUR || 0,
            market_cap: item.RAW?.USD?.MKTCAP || 0
        }));
        
        displayData(coinData);
        updateTopGainer(coinData);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" style="color:#ff3e6c; text-align:center;">Network error. Please try again later.</td></tr>`;
    }
}

function displayData(data) {
    tableBody.innerHTML = ''; 
    
    // لو المستخدم كتب اسم عملة مش موجودة في الـ 20 عملة
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="color:#64748b; text-align:center;">No coins found matching your search.</td></tr>`;
        return;
    }
    
    data.forEach(coin => {
        const changeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
        const changeSign = coin.price_change_percentage_24h >= 0 ? '+' : '';

        const row = `
            <tr>
                <td>${coin.market_cap_rank}</td>
                <td style="font-weight: bold; color: #fff;">${coin.name} (${coin.symbol.toUpperCase()})</td>
                <td>$${coin.current_price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="${changeClass}">${changeSign}${coin.price_change_percentage_24h.toFixed(2)}%</td>
                <td>$${coin.market_cap.toLocaleString()}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// دالة البحث الذكية والمعدلة (بتعمل لوور كيس ومسافات عشان السيرش يظبط دايماً)
searchInput.addEventListener('input', (e) => {
    const word = e.target.value.toLowerCase().trim();
    
    const filteredCoins = coinData.filter(coin => 
        coin.name.toLowerCase().includes(word) || 
        coin.symbol.toLowerCase().includes(word)
    );
    
    displayData(filteredCoins);
});

// دالة حساب أعلى عملة كسبانة في الـ 24 ساعة الأخيرة
function updateTopGainer(data) {
    if(data.length === 0) return;
    let topCoin = data[0];
    data.forEach(coin => {
        if(coin.price_change_percentage_24h > topCoin.price_change_percentage_24h) {
            topCoin = coin;
        }
    });
    topGainerPara.innerHTML = `<span class="positive">${topCoin.name} (+${topCoin.price_change_percentage_24h.toFixed(2)}%)</span>`;
}

// تشغيل السيستم فوراً أول ما الصفحة تفتح
fetchMarketData();

// تحديث تلقائي في الخلفية كل 60 ثانية بدون ما يحتاج ريفريش من المستخدم
setInterval(fetchMarketData, 60000);
