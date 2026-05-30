import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function captureLogo() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 50px;
          background: transparent;
          display: inline-block;
        }
        .logo {
          display: inline-block;
          border: 3px solid black;
          background: #EAB308;
          padding: 16px 28px;
          box-shadow: 5px 5px 0 0 #000;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 48px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: -0.5px;
        }
      </style>
    </head>
    <body>
      <div class="logo">Mundialín</div>
    </body>
    </html>
  `);

  const logo = await page.$('.logo');
  const box = await logo.boundingBox();

  await page.screenshot({
    path: join(__dirname, '..', 'project-logo.png'),
    clip: {
      x: box.x - 10,
      y: box.y - 10,
      width: box.width + 20,
      height: box.height + 30
    },
    omitBackground: true
  });

  await browser.close();
  console.log('Logo saved to project-logo.png');
}

captureLogo();
