const fs = require('fs');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Currency Helper
replaceInFile('src/lib/currency.js', [
    ["return `$${Number(num).toLocaleString('en-US')}`;", "return `USD ${Number(num).toLocaleString('en-US')}`;"]
]);

// 2. HomeClient
replaceInFile('src/app/HomeClient.js', [
    ["${Number(parsePrice(trip.price)).toLocaleString('en-US')}", "USD ${Number(parsePrice(trip.price)).toLocaleString('en-US')}"]
]);

// 3. TourDetailClient
replaceInFile('src/app/tours/[slug]/TourDetailClient.js', [
    ["${getUnitDynamicPrice().toLocaleString('en-US')}", "USD ${getUnitDynamicPrice().toLocaleString('en-US')}"],
    ["${getTotalPrice().toLocaleString('en-US')}", "USD ${getTotalPrice().toLocaleString('en-US')}"],
    ["Rp {getAllInclusivePriceForPax(desktopPax).toLocaleString('id-ID')}", "USD {getAllInclusivePriceForPax(desktopPax).toLocaleString('en-US')}"],
    ["getAllInclusivePriceForPax(desktopPax).toLocaleString('id-ID')", "getAllInclusivePriceForPax(desktopPax).toLocaleString('en-US')"],
    ["getUnitDynamicPrice().toLocaleString('id-ID')", "getUnitDynamicPrice().toLocaleString('en-US')"]
]);

// 4. BookingModal
replaceInFile('src/components/booking/BookingModal.js', [
    ["return `Rp ${price.toLocaleString('id-ID')}", "return `USD ${price.toLocaleString('en-US')}"]
]);

console.log("Done");
