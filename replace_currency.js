const fs = require('fs');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
}

// 1. BookingModal.js
replaceInFile('src/components/booking/BookingModal.js', [
    ["const formatIDR = (num) => `IDR ${Number(num).toLocaleString('id-ID')}`;", "import { parsePrice, formatUSD } from '@/lib/currency';"],
    ["formatIDR(total)", "formatUSD(total)"],
    ["formatIDR(basePrice", "formatUSD(basePrice"],
    ["const getMultiplierPrice = (rawPrice) => {", "const getMultiplierPrice = (rawPrice) => parsePrice(rawPrice); /*"],
    ["return Math.floor(p > 1000 ? p : p * 1000);", "*/"]
]);

// 2. MapComponent.js
replaceInFile('src/components/map/MapComponent.js', [
    ["const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);", "import { parsePrice, formatUSD } from '@/lib/currency';"],
    ["formatIDR(", "formatUSD(parsePrice("],
    ["Rp {car.pricePerKm}/km", "${parsePrice(car.pricePerKm)}/km"]
]);

// 3. bookings/page.js
replaceInFile('src/app/bookings/page.js', [
    ["const formatIDR = (num) => {\n  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);\n};", "import { parsePrice, formatUSD } from '@/lib/currency';"],
    ["formatIDR(numericAmount)", "formatUSD(parsePrice(numericAmount))"]
]);

// 4. HomeClient.js
replaceInFile('src/app/HomeClient.js', [
    ["IDR {Number(trip.price > 1000 ? trip.price : trip.price * 1000).toLocaleString('id-ID')}", "${Number(parsePrice(trip.price)).toLocaleString('en-US')}"]
]);

// 5. TourDetailClient.js
replaceInFile('src/app/tours/[slug]/TourDetailClient.js', [
    ["IDR {getUnitDynamicPrice().toLocaleString('id-ID')}", "${getUnitDynamicPrice().toLocaleString('en-US')}"],
    ["IDR {getTotalPrice().toLocaleString('id-ID')}", "${getTotalPrice().toLocaleString('en-US')}"]
]);

// 6. seo.js
replaceInFile('src/lib/seo.js', [
    ["'priceCurrency': 'IDR',", "'priceCurrency': 'USD',"]
]);

console.log("Replacements complete");
