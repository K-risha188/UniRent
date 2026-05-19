import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('pageerror', error => {
        console.error('PAGE ERROR EXCEPTION:', error.message);
    });

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.error('CONSOLE ERROR:', msg.text());
        }
    });

    console.log('Navigating to Community Requests...');
    await page.goto('http://localhost:5173/community-requests', { waitUntil: 'networkidle0' });

    console.log('Navigation complete. Closing browser.');
    await browser.close();
})();
