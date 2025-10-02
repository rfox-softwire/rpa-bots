const { chromium } = require('playwright');
const claimData = require('./claimData.json');

async function dataEntry(claim) {
    try {
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('http://localhost:3000');

        try {
            await page.fill('#policyNumber', claim.policyNumber);
            await page.fill('#description', claim.claimDescription);
            await page.fill('#claimAmount', claim.claimAmount);
            
            const [day, month, year] = claim.claimDate.split('/');
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            await page.fill('#claimDate', formattedDate);
            
            await page.click('button[type="submit"]');
            
            await page.waitForLoadState('networkidle');
            
        } catch (error) {
            console.error('Error filling the form:', error);
            await page.screenshot({ path: 'photos/dataEntry/form-error.png' });
            console.log('Error screenshot saved as form-error.png');
            throw error;
        } finally {
            await browser.close();
        }
    } catch (error) {
        console.error('Error in dataEntry:', error);
    }
}

claimData.forEach(dataEntry);