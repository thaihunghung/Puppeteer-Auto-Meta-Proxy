const PuppeteerAutoMetaMask = require('./puppeteer_auto_metamask/metamask_handler');
const { workerData, parentPort } = require('worker_threads');
const puppeteerAutoMetaMask = PuppeteerAutoMetaMask(workerData.extensionPath, workerData.proxie);

async function run() {
    const browser = await puppeteerAutoMetaMask.launchBrowser();
    const address = workerData.testAddress; 
    try {
        await new Promise(resolve => setTimeout(resolve, 10000));  
        await puppeteerAutoMetaMask.interactWithMetaMask(browser, workerData.formattedMnemonic);
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
