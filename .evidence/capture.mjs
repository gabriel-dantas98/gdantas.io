import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://127.0.0.1:4173';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const VIDEO_DIR = path.join(__dirname, 'video');

// Key pages that were modified in this PR
const pages = [
  { name: 'home-pt', path: '/' },
  { name: 'home-en', path: '/en' },
  { name: 'doctrine-pt', path: '/doctrine' },
  { name: 'doctrine-en', path: '/en/doctrine' },
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

async function captureVideo() {
  console.log('Starting video capture...');

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();

  try {
    // Navigate through key pages with scrolling
    const walkthrough = [
      { name: 'Home (PT)', path: '/' },
      { name: 'Home (EN)', path: '/en' },
      { name: 'Doctrine (PT)', path: '/doctrine' },
      { name: 'Doctrine (EN)', path: '/en/doctrine' },
    ];

    for (const item of walkthrough) {
      console.log(`Video: visiting ${item.name}...`);
      const url = `${BASE_URL}${item.path}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(800);

      // Scroll down to show content
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(600);
      await page.evaluate(() => window.scrollBy(0, 400));
      await page.waitForTimeout(600);

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);
    }

    console.log('✓ Video recording complete');
  } catch (error) {
    console.error('✗ Error during video capture:', error.message);
  }

  // Closing context writes the video file
  await context.close();
  await browser.close();

  // Wait and check for video file
  await new Promise(resolve => setTimeout(resolve, 2000));

  const videoFiles = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.webm'));
  if (videoFiles.length > 0) {
    const oldPath = path.join(VIDEO_DIR, videoFiles[0]);
    const stats = fs.statSync(oldPath);
    if (stats.size > 0) {
      const newPath = path.join(VIDEO_DIR, 'walkthrough.webm');
      fs.renameSync(oldPath, newPath);
      console.log(`✓ Saved video: ${newPath} (${stats.size} bytes)`);
    } else {
      console.warn('⚠ Video file was created but is empty');
    }
  }
}

async function captureScreenshots() {
  console.log('Starting screenshot capture...');
  const browser = await chromium.launch();

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();

    for (const pageInfo of pages) {
      try {
        const url = `${BASE_URL}${pageInfo.path}`;
        console.log(`Capturing ${pageInfo.name}-${viewport.name}...`);

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        // Wait for animations to settle (GSAP)
        await page.waitForTimeout(1500);

        const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageInfo.name}-${viewport.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`✓ Saved: ${screenshotPath}`);
      } catch (error) {
        console.error(`✗ Error capturing ${pageInfo.name}-${viewport.name}:`, error.message);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('Screenshots complete!');
}

async function main() {
  try {
    await captureScreenshots();
    await captureVideo();
    console.log('\n✓ All evidence captured successfully!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
