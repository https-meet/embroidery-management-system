const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function capture() {
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching Playwright Chromium browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const BASE_URL = 'https://embroidery-management-system-fronte.vercel.app';

  // 1. Login Page
  console.log('1. Capturing Login Page...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(screenshotsDir, '01_login_page.png') });

  // Perform Login
  console.log('Logging in as admin@ebms.local...');
  await page.fill('input[type="email"]', 'admin@ebms.local');
  await page.fill('input[type="password"]', 'Admin@2026!');
  await page.click('button[type="submit"]');

  await page.waitForTimeout(4000);

  // 2. Operational Dashboard
  console.log('2. Capturing Operational Dashboard...');
  await page.screenshot({ path: path.join(screenshotsDir, '02_operational_dashboard.png') });

  // 3. Customers List
  console.log('3. Capturing Customers List...');
  await page.goto(`${BASE_URL}/customers`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '03_customers_list.png') });

  // Try clicking first customer
  const customerLink = page.locator('table tbody tr a').first();
  if (await customerLink.count() > 0) {
    console.log('3b. Capturing Customer 360 Workspace...');
    await customerLink.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '03b_customer_360_workspace.png') });
  }

  // 4. Job Orders List
  console.log('4. Capturing Job Orders List...');
  await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '04_job_orders_list.png') });

  const jobLink = page.locator('table tbody tr a').first();
  if (await jobLink.count() > 0) {
    console.log('4b. Capturing Job Workspace...');
    await jobLink.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '04b_job_order_workspace.png') });
  }

  // 5. Invoices List
  console.log('5. Capturing Invoices List...');
  await page.goto(`${BASE_URL}/invoices`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '05_invoices_list.png') });

  const invoiceLink = page.locator('table tbody tr a').first();
  if (await invoiceLink.count() > 0) {
    console.log('5b. Capturing Printable Tax Invoice...');
    await invoiceLink.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(screenshotsDir, '05b_printable_tax_invoice.png') });
  }

  // 6. Payments List
  console.log('6. Capturing Payments List...');
  await page.goto(`${BASE_URL}/payments`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '06_payments_list.png') });

  // 7. Settings & System Health
  console.log('7. Capturing Settings & System Health...');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '07_settings_system_health.png') });

  // 8. Reports & Backup Hub
  console.log('8. Capturing Reports & Backup Hub...');
  await page.goto(`${BASE_URL}/reports`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '08_reports_backup_hub.png') });

  console.log('SUCCESS: All real application screenshots captured!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Playwright capture failed:', err);
  process.exit(1);
});
