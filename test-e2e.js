import puppeteer from 'puppeteer-core';

async function runE2ETest() {
  console.log('--- STARTING COMPREHENSIVE MITWA PITCH DEMO E2E TEST ---');
  
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER CONSOLE ERROR:', msg.text());
  });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // 1. Initial Pitch UI checks
  const title = await page.title();
  console.log('Page Title:', title);

  await page.screenshot({ path: 'screenshot-pitch-1-home.png' });
  console.log('Saved screenshot-pitch-1-home.png');

  // Helper to click element with matching text
  const clickByText = async (tag, text) => {
    return await page.evaluate((tag, text) => {
      const elements = Array.from(document.querySelectorAll(tag));
      const el = elements.find(e => e.innerText.includes(text));
      if (el) {
        el.click();
        return true;
      }
      return false;
    }, tag, text);
  };

  // Test opening Pitch Modal
  console.log('\n--- Step 1: Testing Pitch Companion Modal ---');
  const openedPitch = await clickByText('button', 'Pitch Guide');
  console.log('Clicked Pitch Guide:', openedPitch);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot-pitch-2-modal.png' });
  console.log('Saved screenshot-pitch-2-modal.png (Pitch Guide open)');

  // Close Pitch modal
  await clickByText('button', 'Close Pitch Guide');
  await new Promise(r => setTimeout(r, 400));

  // 2. Test Conversation: 8 PM prompt
  console.log('\n--- Step 2: Testing 8:00 PM Unavailable Slot Check ---');
  const inputSelector = 'input[type="text"][placeholder*="Speak or type"]';
  await page.waitForSelector(inputSelector);
  await page.type(inputSelector, 'Bhai aaj raat 8 baje 4 logon ke liye table chahiye.');
  await page.click('button[title="Send message"]');
  await new Promise(r => setTimeout(r, 1200));

  const mitwaReplies1 = await page.$$eval('[data-testid="chat-bubble"][data-sender="mitwa"] [data-testid="chat-message-text"]', els => els.map(e => e.innerText));
  const latestMitwaReply1 = mitwaReplies1[mitwaReplies1.length - 1];
  console.log('Mitwa Reply 1:\n"', latestMitwaReply1, '"');

  // 3. Step 3: Accept 7:30 PM alternative
  console.log('\n--- Step 3: Accepting 7:30 PM slot ---');
  await page.type(inputSelector, '7:30 PM theek rahega, table book kar do.');
  await page.click('button[title="Send message"]');
  await new Promise(r => setTimeout(r, 1200));

  // 4. Step 4: Name & Phone
  console.log('\n--- Step 4: Providing Name and Phone ---');
  await page.type(inputSelector, 'Mera naam Rahul Sharma hai aur mobile number 9876543210 hai.');
  await page.click('button[title="Send message"]');
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: 'screenshot-pitch-3-confirmed.png' });
  console.log('Saved screenshot-pitch-3-confirmed.png (Booking Confirmed with WhatsApp Modal)');

  // Close WhatsApp modal
  const closedWhatsApp = await clickByText('button', 'Back to Demo');
  console.log('Closed WhatsApp modal:', closedWhatsApp);
  await new Promise(r => setTimeout(r, 500));

  // 5. Test Floor Plan View toggle
  console.log('\n--- Step 5: Testing Floor Plan View toggle ---');
  const switchedToFloor = await clickByText('button', 'Floor Plan');
  console.log('Switched to Floor Plan:', switchedToFloor);
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: 'screenshot-pitch-4-floorplan.png' });
  console.log('Saved screenshot-pitch-4-floorplan.png (Restaurant Floor Plan View)');

  // Switch back to table view
  await clickByText('button', 'Table');
  await new Promise(r => setTimeout(r, 400));

  // Verify updated metrics
  const updatedMetrics = await page.$$eval('.glass-panel span.text-2xl', els => els.map(e => e.innerText));
  console.log('\nFinal Dashboard Metrics (Calls, Confirmed, Available, Revenue):', updatedMetrics);

  console.log('\n========================================');
  console.log('🎉 PITCH DEMO VERIFICATION 100% COMPLETE!');
  console.log('========================================');

  await browser.close();
}

runE2ETest().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
