const path = require('path');
const WalletLoader = require('./wallet/wallet_handler');
const PuppeteerAutoMetaMask = require('./puppeteer_auto_metamask/metamask_handler');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { maxThreads } = require('./config'); // Load config

const excelFilePath = path.resolve(__dirname, 'wallet_data.xlsx');
const walletLoader = WalletLoader(excelFilePath);
const extensionPath = path.resolve(__dirname, 'nkbihfbeogaeaoehlefnkodbefgpgknn/12.6.2_0');

async function startWorkers() {
    const addresses = walletLoader.getAddressesFromExcel(); 
    const proxies = walletLoader.getProxiesFromExcel(); 
    if (addresses.length === 0) {
        console.error('Không có địa chỉ nào trong file Excel.');
        return;
    }
    if (proxies.length === 0) {
        console.error('Không có proxies nào trong file Excel.');
        return;
    }
    if (proxies.length !== addresses.length) {
        console.error('số lượng t');
        return;
    }

    if (maxThreads < addresses.length) {
        console.log('Có nhiều địa chỉ hơn số worker, sẽ xử lý tuần tự.');
    }
    const workerPromises = [];

    for (let i = 0; i < addresses.length; i++) {
        const testAddress = addresses[i];
        const proxie = proxies[i];
        const mnemonic = walletLoader.findMnemonicByAddress(testAddress);

        if (!mnemonic) {
            console.error('Không tìm thấy Mnemonic cho Address:', testAddress);
            continue;  
        }

        const formattedMnemonic = mnemonic.split(' ');

        const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
            workerData: { 
                formattedMnemonic, 
                extensionPath,
                testAddress,
                proxie
            }
        });

        workerPromises.push(
            new Promise((resolve, reject) => {
                worker.on('message', (message) => resolve(message));
                worker.on('error', reject);
                worker.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            })
        );

        if (workerPromises.length >= maxThreads) {
            await Promise.race(workerPromises); 
        }
    }

    try {
        const results = await Promise.all(workerPromises);
        console.log('Kết quả từ tất cả worker:', results);
    } catch (error) {
        console.error('Error in worker threads:', error);
    }
}

async function processMetaMask() {
    const puppeteerAutoMetaMask = await PuppeteerAutoMetaMask(workerData.extensionPath, workerData.proxie);
    const browser = await puppeteerAutoMetaMask.launchBrowser();
    try {
        await new Promise(resolve => setTimeout(resolve, 10000));
        await puppeteerAutoMetaMask.interactWithMetaMask(browser, workerData.formattedMnemonic);
        parentPort.postMessage('Success'); 
    } catch (error) {
        console.error('Lỗi khi tương tác với MetaMask:', error);
        parentPort.postMessage('Failure');
    }
}

// Kiểm tra nếu đây là Main thread
if (isMainThread) {
    startWorkers();  // Gọi startWorkers khi ở main thread
} else {
    processMetaMask();  // Gọi processMetaMask khi ở worker thread
}
