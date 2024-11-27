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
    const data_wallet = walletLoader.getWalletData(); 

    // Kiểm tra nếu không có địa chỉ trong file Excel
    // if (data_wallet.addresses.length === 0) {
    //     console.error('Không có địa chỉ nào trong file Excel.');
    //     return;
    // }
    
    // Kiểm tra nếu không có proxies trong file Excel
    // if (data_wallet.proxies.length === 0) {
    //     console.error('Không có proxies nào trong file Excel.');
    //     return;
    // }
    
    // Kiểm tra nếu số lượng proxies không khớp với số lượng addresses
    // if (data_wallet.proxies.length !== data_wallet.addresses.length) {
    //     console.error('Số lượng proxies không khớp với số lượng addresses.');
    //     return;
    // }

    if (maxThreads < data_wallet.Mnemonics.length) {
        console.log('Có nhiều địa chỉ hơn số worker, sẽ xử lý tuần tự.');
    }

    const workerPromises = [];

    // Thời gian tối đa để mỗi worker có thể chạy, tính bằng milliseconds (ví dụ 10 phút)
    const TIMEOUT = 10 * 60 * 1000; // 10 phút

    for (let i = 0; i < data_wallet.Mnemonics.length; i++) {
        const Mnemonic = data_wallet.Mnemonics[i];
        const proxy = data_wallet.proxies[i];
        
        // Kiểm tra proxy IP có hợp lệ không
        const proxieIP = await checkProxyIP(proxy); 
        if (!proxieIP) {
            console.error('Proxy không hoạt động:', proxy);
            continue; // Nếu proxy không hợp lệ, tiếp tục với proxy khác
        }

        // Khởi tạo worker để xử lý công việc
        const worker = new Worker(path.resolve(__dirname, 'worker.js'), {
            workerData: { 
                extensionPath,
                Mnemonic,   // Dữ liệu mnemonic của ví
                proxy,      // Proxy được sử dụng
            }
        });

        const workerPromise = new Promise((resolve, reject) => {
            worker.on('message', (message) => resolve(message));  // Nhận kết quả từ worker
            worker.on('error', reject);  // Xử lý lỗi từ worker
            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });

        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Worker timed out after ${TIMEOUT / 1000} seconds`)), TIMEOUT)
        );

        workerPromises.push(
            Promise.race([workerPromise, timeoutPromise])  // Đợi worker hoặc timeout
        );

        // Giới hạn số lượng worker chạy đồng thời
        if (workerPromises.length >= maxThreads) {
            // Đợi tất cả các worker hiện tại hoàn thành trước khi tạo worker mới
            await Promise.all(workerPromises);  // Chờ tất cả worker trong workerPromises hoàn thành
            workerPromises.length = 0;  // Reset lại workerPromises sau khi chờ xong
        }
    }

    try {
        // Đợi tất cả worker hoàn thành và lấy kết quả
        const results = await Promise.all(workerPromises);
        console.log('Kết quả từ tất cả worker:', results);
    } catch (error) {
        // Xử lý lỗi nếu có trong quá trình chạy worker
        console.error('Error in worker threads:', error);
    }
}



async function processMetaMask() {
    const puppeteerAutoMetaMask = await PuppeteerAutoMetaMask(workerData.extensionPath, workerData.proxy);
    const browser = await puppeteerAutoMetaMask.launchBrowser();
    try {
        await puppeteerAutoMetaMask.GetAddressByMnemonic(browser, workerData.Mnemonic);
        parentPort.postMessage({ status: 'Success' });
    } catch (error) {
        console.error('Lỗi khi tương tác với MetaMask:', error);
        parentPort.postMessage({ status: 'Failure' });
    } finally {
        await browser.close();
        console.log('Trình duyệt đã được đóng.');
    }
}

if (isMainThread) {
    console.log('Kết quả chính');
    startWorkers();  
} else {
    console.log('Kết quả phụ');
    processMetaMask();  
}
