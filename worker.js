const PuppeteerAutoMetaMask = require('./puppeteer_auto_metamask/metamask_handler');
const XLogin  = require('./auto_x/XLogin');
const { workerData, parentPort } = require('worker_threads');
const puppeteerAutoMetaMask = PuppeteerAutoMetaMask(workerData.extensionPath, workerData.proxy);

async function run() {
    const browser = await puppeteerAutoMetaMask.launchBrowser();
    const page = await browser.newPage();
    await page.goto('https://x.com/i/flow/login');
    const X = workerData.dataX.split(' ');
    const address = workerData.testAddress;
    try {
        await new Promise(resolve => setTimeout(resolve, 10000));
        await puppeteerAutoMetaMask.interactWithMetaMask(browser, workerData.formattedMnemonic);
        //await XLogin.loginWithBackupCore(page, X)



        parentPort.postMessage({ status: 'Success', address });
    } catch (error) {
        console.error('Lỗi khi tương tác với MetaMask:', error);
        parentPort.postMessage({ status: 'Failure', address });
    } finally {
        // await browser.close();
        console.log('Trình duyệt đã được đóng.');
    }
}

run();

