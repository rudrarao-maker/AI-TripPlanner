const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

const ROUTES = [
  '/',
  '/about',
  '/explore',
  '/flight-search',
  '/hotel-search',
  '/trip-planner',
  '/restaurants',
  '/things-to-do',
  '/travel-guides',
  '/travel-journal',
  '/legal'
];

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'mobile', width: 375, height: 812 }
];

async function captureScreenshots() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR);
  }

  console.log('Starting screenshot capture...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  let counter = 1;

  for (const route of ROUTES) {
    const url = `${TARGET_URL}${route}`;
    console.log(`Navigating to ${url}...`);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      for (const viewport of VIEWPORTS) {
        await page.setViewport({ width: viewport.width, height: viewport.height });
        
        // Wait for animations/3D objects to settle
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Take top screenshot
        const topFilename = path.join(SCREENSHOT_DIR, `${counter.toString().padStart(2, '0')}_${route.replace(/\//g, '_') || 'home'}_${viewport.name}_top.png`);
        await page.screenshot({ path: topFilename });
        console.log(`Saved: ${topFilename}`);
        counter++;

        // Scroll down slightly and take another screenshot if on desktop
        if (viewport.name === 'desktop') {
          await page.evaluate(() => window.scrollBy(0, 800));
          await new Promise(resolve => setTimeout(resolve, 1000));
          const midFilename = path.join(SCREENSHOT_DIR, `${counter.toString().padStart(2, '0')}_${route.replace(/\//g, '_') || 'home'}_${viewport.name}_mid.png`);
          await page.screenshot({ path: midFilename });
          console.log(`Saved: ${midFilename}`);
          counter++;
        }
      }
    } catch (err) {
      console.error(`Failed to capture ${route}:`, err.message);
    }
  }

  await browser.close();
  console.log(`Finished! Captured ${counter - 1} screenshots in ${SCREENSHOT_DIR}`);
}

captureScreenshots().catch(console.error);
