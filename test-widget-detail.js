const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });

    // Log console messages
    page.on('console', msg => console.log('CONSOLE:', msg.text()));
    page.on('error', err => console.log('PAGE ERROR:', err));

    // Track errors
    let errors = [];
    page.on('pageerror', err => {
      errors.push(err.message);
      console.log('PAGE ERROR LOGGED:', err.message);
    });

    // Navigate to widgets page
    console.log('Navigating to http://localhost:3000/widgets...');
    await page.goto('http://localhost:3000/widgets', { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('✓ Widgets page loaded');

    // Wait longer for widgets to render (wait for skeleton to be replaced)
    console.log('Waiting for actual widget content to load...');
    await new Promise(r => setTimeout(r, 3000));

    // Wait for the actual widget cards (not skeletons)
    const loaded = await page.evaluate(() => {
      const cards = document.querySelectorAll('a[href*="/widgets/widget-"]');
      return cards.length > 0;
    });

    if (!loaded) {
      console.log('Widgets still not loaded. Checking for links again...');
    }

    // Take screenshot of widgets list
    const listScreenshot = '/tmp/widgets-list.png';
    await page.screenshot({ path: listScreenshot });
    console.log('✓ Screenshot of widgets list saved:', listScreenshot);

    // Get all links on the page
    const allLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href*="/widgets/"]');
      return Array.from(links).map((link, idx) => ({
        index: idx,
        href: link.href,
        text: link.innerText.substring(0, 50).replace(/\n/g, ' ')
      }));
    });

    console.log('\nAll widget links found:');
    allLinks.forEach(link => console.log(`  ${link.index}: ${link.href} (${link.text})`));

    // Find the first actual widget (not the "Create Widget" button)
    const firstWidgetLink = allLinks.find(l => l.href.includes('/widgets/widget-'));

    if (!firstWidgetLink) {
      console.log('\nNo actual widget links found. Only create button exists.');
      console.log('Page HTML saved to /tmp/widgets-page.html');
    } else {
      console.log(`\nClicking on first widget: ${firstWidgetLink.href}`);

      // Navigate to the first widget detail page
      await page.goto(firstWidgetLink.href, { waitUntil: 'networkidle2', timeout: 30000 });
      console.log('✓ Widget detail page loaded');

      // Wait for content to fully render
      await new Promise(r => setTimeout(r, 2000));

      // Check page URL
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);

      // Take screenshot of detail page
      const detailScreenshot = '/tmp/widget-detail.png';
      await page.screenshot({ path: detailScreenshot });
      console.log('✓ Screenshot of widget detail page saved:', detailScreenshot);

      // Check for visible components
      const components = await page.evaluate(() => {
        const result = {
          pageTitle: document.querySelector('h1')?.innerText || 'N/A',
          headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText),
          forms: Array.from(document.querySelectorAll('form')).length,
          inputs: Array.from(document.querySelectorAll('input')).length,
          buttons: Array.from(document.querySelectorAll('button')).length,
          textContent: document.body.innerText.substring(0, 800)
        };
        return result;
      });

      console.log('\nWidget Detail Page Components:');
      console.log('- Page Title:', components.pageTitle);
      console.log('- All Headings:', components.headings);
      console.log('- Forms found:', components.forms);
      console.log('- Input fields:', components.inputs);
      console.log('- Buttons:', components.buttons);
      console.log('\n- Visible text (first 800 chars):\n', components.textContent);

      // Check for errors
      console.log('\nPage errors detected:', errors.length > 0 ? errors : 'None');
    }

    await browser.close();

  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
    await browser.close();
    process.exit(1);
  }
})();
