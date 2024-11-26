const path = require('path');
const axios = require('axios');
const WalletLoader = require('./wallet/wallet_handler');
const PuppeteerAutoMetaMask = require('./puppeteer_auto_metamask/metamask_handler');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { maxThreads } = require('./config'); // Load config
const { HttpsProxyAgent } = require('https-proxy-agent');
const excelFilePath = path.resolve(__dirname, 'wallet_data.xlsx');
const walletLoader = WalletLoader(excelFilePath);
const extensionPath = path.resolve(__dirname, 'nkbihfbeogaeaoehlefnkodbefgpgknn/12.6.2_0');
async function checkProxyIP(proxy) {
    try {
        const proxyAgent = new HttpsProxyAgent(proxy);
        const response = await axios.get('https://api.ipify.org?format=json', {
            httpsAgent: proxyAgent
        });
        if (response.status === 200) {
            console.log('Proxy hợp lệ, IP:', response.data.ip);
            return true;  // Trả về true nếu proxy hợp lệ
        } else {
            throw new Error(`Không thể kiểm tra IP của proxy. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error khi kiểm tra IP của proxy: ${error.message}`);
        return false;  // Trả về false nếu có lỗi xảy ra
    }
}

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
        console.error('Số lượng proxies không khớp với số lượng addresses.');
        return;
    }

    if (maxThreads < addresses.length) {
        console.log('Có nhiều địa chỉ hơn số worker, sẽ xử lý tuần tự.');
    }

    const workerPromises = [];

    for (let i = 0; i < addresses.length; i++) {
        const testAddress = addresses[i];
        const proxy = proxies[i];
        const proxieIP = await checkProxyIP(proxy); 
        if (!proxieIP) {
            console.error('Proxy không hoạt động:', proxy);
            continue;
        }

        const mnemonic = walletLoader.findMnemonicByAddress(testAddress);
        if (!mnemonic) {
            console.error('Không tìm thấy Mnemonic cho Address:', testAddress);
            continue;
        }

        const formattedMnemonic = mnemonic.split(' ');

        // Khởi tạo worker
        const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
            workerData: { 
                formattedMnemonic, 
                extensionPath,
                testAddress,
                proxy
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

        // Giới hạn số worker chạy đồng thời
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
    const puppeteerAutoMetaMask = await PuppeteerAutoMetaMask(workerData.extensionPath, workerData.proxy);
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
