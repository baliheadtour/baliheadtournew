const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Update Admin Dashboard Home
replaceInFile('src/app/admin/page.js', [
    ["const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);", 
     "const formatUSD = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(num);"],
    ["formatIDR", "formatUSD"],
    ['"Rp 0"', '"$0"']
]);

// 2. Update Customers Page
replaceInFile('src/app/admin/customers/page.js', [
    ['"Rp 0"', '"$0"']
]);

// 3. Update EditListingModal
replaceInFile('src/components/admin/EditListingModal.js', [
    ['>Rp<', '>$<']
]);

// 4. Update Listings Page
let listingsPath = 'src/app/admin/listings/page.js';
if (fs.existsSync(listingsPath)) {
    let content = fs.readFileSync(listingsPath, 'utf8');
    
    // Replace the IDR format in the table
    content = content.replace(
        "{cleanDisplayPrice > 1000 ? `IDR ${cleanDisplayPrice.toLocaleString('id-ID')}` : `IDR ${(cleanDisplayPrice * 15000).toLocaleString('id-ID')}`}",
        "{cleanDisplayPrice > 1000 ? `$${Math.round(cleanDisplayPrice / 15000)}` : `$${cleanDisplayPrice}`}"
    );

    // Replace the inner Rp format for scooter prices
    content = content.replace(
        "return cdp > 1000 ? `Rp ${cdp.toLocaleString('id-ID')}` : `Rp ${(cdp * 15000).toLocaleString('id-ID')}`;",
        "return cdp > 1000 ? `$${Math.round(cdp / 15000)}` : `$${cdp}`;"
    );

    fs.writeFileSync(listingsPath, content, 'utf8');
}

console.log("Done");
