const { chromium } = require('playwright');

async function approveClaims() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('Navigating to claims page...');
        await page.goto('http://localhost:3003/');
        
        await page.waitForSelector('table.min-w-full tbody tr');
        
        const claimRows = await page.$$('table.min-w-full tbody tr[data-claim-id]');
        console.log(`Found ${claimRows.length} claims to process`);
        
        for (const row of claimRows) {
            const status = await row.$eval('.status-badge', el => el.textContent.trim());
            
            if (status.toLowerCase() === 'pending') {
                const claimId = await row.getAttribute('data-claim-id');
                const policyNumber = await row.$eval('td:nth-child(1)', el => el.textContent.trim());
                const claimAmount = parseFloat(await row.$eval('td:nth-child(3)', 
                    el => el.textContent.trim().replace(/[^0-9.-]+/g, '')));
                
                console.log(`\nProcessing claim ${claimId} for policy ${policyNumber} (Amount: £${claimAmount})`);
                
                const policyPage = await context.newPage();
                await policyPage.goto('http://localhost:3002/');
                
                await policyPage.fill('input[type="text"]', policyNumber);
                await policyPage.click('button:has-text("Search")');
                
                await policyPage.waitForSelector('#remainingLimit');
                const remainingLimitText = await policyPage.$eval('#remainingLimit', 
                    el => el.textContent.trim());
                const remainingLimit = parseFloat(remainingLimitText.replace(/[^0-9.-]+/g, ''));

                await policyPage.close();

                await row.click('a.view-claim');
                await page.waitForTimeout(500);
                
                if (remainingLimit >= claimAmount) {
                    await page.click('button#acceptClaimBtn');
                } else {
                    await page.click('button#rejectClaimBtn');
                }
                await page.waitForTimeout(1000);
                console.log(`Claim ${claimId} processed`)
            }
        }
        
        console.log('\nAll claims processed!');
        
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Close the browser
        await browser.close();
    }
}

// Run the function
approveClaims().catch(console.error);