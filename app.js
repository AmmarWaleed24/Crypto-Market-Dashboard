const tableBody = document.getElementById('cryptoTableBody');
const searchInput = document.getElementById('cryptoSearch');
const topGainerPara = document.getElementById('topGainer');

let coinData = []; // هنشيل فيه الداتا اللي هتيجي عشان نفلتر منها

// دالة جلب البيانات لايف
async function fetchMarketData() {
    try {
        // الـ API ده بيجيب أعلى 20 عملة رقمية في السوق حالياً
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false');
        coinData = await response.json();
        
        displayData(coinData);
        updateTopGainer(coinData);
    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">API rate limit hit. Wait a minute and refresh!</td></tr>`;
    }
}

// دالة عرض البيانات في الجدول
function displayData(data) {
    tableBody.innerHTML = ''; // تصفية الجدول أولاً
    
    data.forEach(coin => {
        // تحديد هل النسبة صعود ولا هبوط عشان اللون
        const changeClass = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
        const changeSign = coin.price_change_percentage_24h >= 0 ? '+' : '';

        const row = `
            <tr>
                <td>${coin.market_cap_rank}</td>
                <td style="font-weight: bold; color: #fff;">${coin.name} (${coin.symbol.toUpperCase()})</td>
                <td>$${coin.current_price.toLocaleString()}</td>
                <td class="${changeClass}">${changeSign}${coin.price_change_percentage_24h.toFixed(2)}%</td>
                <td>$${coin.market_cap.toLocaleString()}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// دالة البحث والفلترة الذكية
searchInput.addEventListener('input', (e) => {
    const word = e.target.value.toLowerCase();
    
    // فلترة العملات اللي اسمها أو رمزها بيحتوي على الحرف المكتوب
    const filteredCoins = coinData.filter(coin => 
        coin.name.toLowerCase().includes(word) || 
        coin.symbol.toLowerCase().includes(word)
    );
    
    displayData(filteredCoins);
});

// دالة حساب أعلى عملة كسبانة النهاردة
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

// تشغيل السيستم أول ما الصفحة تفتح
fetchMarketData();

// تحديث تلقائي للداتا كل 60 ثانية من غير ما المستخدم يعمل ريفريش
setInterval(fetchMarketData, 60000);
