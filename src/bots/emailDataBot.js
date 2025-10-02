const { chromium } = require('playwright');

async function processEmail(emailPage) {
    const emailBody = await emailPage.locator('#message-body');
    await emailBody.waitFor({ state: 'visible' });
    
    const emailText = await emailBody.textContent();
    
    const claimInfo = {};
    
    const policyMatch = emailText.match(/Policy Number:\s*(POL-\d{6})/i);
    
    if (!policyMatch) {
        throw new Error('No valid policy number found. Expected format: POL-xxxxxx where x is a digit');
    }
    
    const policyNumber = policyMatch[1].trim();
    if (!/^POL-\d{6}$/i.test(policyNumber)) {
        throw new Error(`Invalid policy number format: ${policyNumber}. Expected format: POL-xxxxxx where x is a digit`);
    }
    
    claimInfo.policyNumber = policyNumber;
    
    const amountMatch = emailText.match(/Claim Amount:\s*£?([0-9,]+(?:\.[0-9]{2})?)/i);
    const dateMatch = emailText.match(/Claim Date:\s*(\d{2}\/\d{2}\/\d{4})/i);
    const descMatch = emailText.match(/Description:\s*([^\n]+?)(?=(?:\n|Claim Amount:|$))/is);
    if (amountMatch) claimInfo.claimAmount = amountMatch[1].replace(/,/g, '');
    if (dateMatch) {
        const [day, month, year] = dateMatch[1].split('/');
        claimInfo.claimDate = `${day}/${month}/${year}`;
    }
    if (descMatch) claimInfo.claimDescription = descMatch[1].trim();

    return claimInfo;
}

async function submitClaim(claim, context) {
    try {
        const claimManagementPage = await context.newPage();

        await claimManagementPage.goto('http://localhost:3003');
        
        await claimManagementPage.click('#newClaimBtn');

        await claimManagementPage.waitForSelector('#newClaimModal:not(.hidden)');
        
        await claimManagementPage.fill('#policyNumber', claim.policyNumber);
        await claimManagementPage.fill('#description', claim.claimDescription || 'Claim from email');
        await claimManagementPage.fill('#claimAmount', claim.claimAmount);
        
        const [day, month, year] = claim.claimDate.split('/');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        await claimManagementPage.fill('#claimDate', formattedDate);

        await claimManagementPage.click('button[type="submit"]')
        claimManagementPage.close()

        return true;
    } catch (error) {
        console.error('Error submitting claim:', error);
        await claimManagementPage.screenshot({ path: `photos/emailDataBot/claim-error-${Date.now()}.png` });
        return false;
    }
}

async function emailDataBot() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const emailPage = await context.newPage();
    
    try {
        await emailPage.goto('http://localhost:3001');
        
        const messageElements = await emailPage.locator('.message-item').all();
        
        for (const message of messageElements) {
            try {
                await message.click();
                
                const claim = await processEmail(emailPage);

                await submitClaim(claim, context);
                
            } catch (error) {
                console.error('Error processing message:', error);
                await emailPage.screenshot({ path: `photos/emailDataBot/error-${Date.now()}.png` });
            } finally {
                await emailPage.click('button#back-to-list');
            }
        }        
    } catch (error) {
        console.error('Error in emailDataBot:', error);
        throw error
    } finally {
        await browser.close();
    }
}

emailDataBot();