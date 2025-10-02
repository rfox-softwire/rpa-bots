const fs = require('fs');
const path = require('path');

function generatePolicyNumber() {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `POL-${randomNum}`;
}

const claimDescriptions = [
    'Vehicle collision damage',
    'Property damage from storm',
    'Theft of personal belongings',
    'Water damage to property',
    'Fire damage claim',
    'Medical expenses coverage',
    'Travel insurance claim',
    'Electronic equipment damage',
    'Natural disaster damage',
    'Liability claim'
];

function getRandomDescription() {
    return claimDescriptions[Math.floor(Math.random() * claimDescriptions.length)];
}

function getRandomAmount(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

const claims = [];
for (let i = 0; i < 20; i++) {
    const randomDaysAgo = Math.floor(Math.random() * 730);
    const claimDate = new Date();
    claimDate.setDate(claimDate.getDate() - randomDaysAgo);

    claims.push({
        policyNumber: generatePolicyNumber(),
        claimDescription: getRandomDescription(),
        claimAmount: getRandomAmount(1000, 100000).toString(),
        claimDate: formatDate(claimDate)
    });
}

const filePath = path.join(__dirname, 'claimData.json');
fs.writeFileSync(filePath, JSON.stringify(claims, null, 4));

console.log('Successfully generated 20 random claims in claimData.json');
