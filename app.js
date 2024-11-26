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
    if (data_wallet.addresses.length === 0) {
        console.error('Không có địa chỉ nào trong file Excel.');
        return;
    }
    if (data_wallet.proxies.length === 0) {
        console.error('Không có proxies nào trong file Excel.');
        return;
    }
    if (data_wallet.proxies.length !== data_wallet.addresses.length) {
        console.error('Số lượng proxies không khớp với số lượng addresses.');
        return;
    }

    if (maxThreads < data_wallet.addresses.length) {
        console.log('Có nhiều địa chỉ hơn số worker, sẽ xử lý tuần tự.');
    }

    const workerPromises = [];

    for (let i = 0; i < data_wallet.addresses.length; i++) {
        const testAddress = data_wallet.addresses[i];
        const proxy = data_wallet.proxies[i];
        const dataX = data_wallet.x[i];
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
                proxy,
                dataX
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
        const page = await browser.newPage();
        await page.goto('https://x.com/i/flow/login'); 
        const X = workerData.dataX.split(' ');

        await page.waitForSelector("#layers > div:nth-child(2) > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv.r-1awozwy > div.css-175oi2r.r-1wbh5a2.r-htvplk.r-1udh08x.r-1867qdf.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1 > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox.r-kemksi.r-1wbh5a2 > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div > div > div > div.css-175oi2r.r-1mmae3n.r-1e084wi.r-13qz1uu > label > div > div.css-175oi2r.r-18u37iz.r-16y2uox.r-1wbh5a2.r-1wzrnnt.r-1udh08x.r-xd6kpl.r-is05cd.r-ttdzmv > div > input", { visible: true });
        await page.type("#layers > div:nth-child(2) > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv.r-1awozwy > div.css-175oi2r.r-1wbh5a2.r-htvplk.r-1udh08x.r-1867qdf.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1 > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox.r-kemksi.r-1wbh5a2 > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div > div > div > div.css-175oi2r.r-1mmae3n.r-1e084wi.r-13qz1uu > label > div > div.css-175oi2r.r-18u37iz.r-16y2uox.r-1wbh5a2.r-1wzrnnt.r-1udh08x.r-xd6kpl.r-is05cd.r-ttdzmv > div > input", X[0], { delay: 100 });
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        await page.waitForSelector("#layers > div:nth-child(2) > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv.r-1awozwy > div.css-175oi2r.r-1wbh5a2.r-htvplk.r-1udh08x.r-1867qdf.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1 > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox.r-kemksi.r-1wbh5a2 > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div > div > div > button:nth-child(6)", { visible: true});
        await page.click("#layers > div:nth-child(2) > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv.r-1awozwy > div.css-175oi2r.r-1wbh5a2.r-htvplk.r-1udh08x.r-1867qdf.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1 > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox.r-kemksi.r-1wbh5a2 > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div > div > div > button:nth-child(6)");
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        await page.waitForSelector("#layers > div:nth-child(2) > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv.r-1awozwy > div.css-175oi2r.r-1wbh5a2.r-htvplk.r-1udh08x.r-1867qdf.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1 > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox.r-kemksi.r-1wbh5a2 > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-1dqxon3 > div > div > div.css-175oi2r.r-1e084wi.r-13qz1uu > div > label > div > div.css-175oi2r.r-18u37iz.r-16y2uox.r-1wbh5a2.r-1wzrnnt.r-1udh08x.r-xd6kpl.r-is05cd.r-ttdzmv > div.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-135wba7.r-16dba41.r-1awozwy.r-6koalj.r-1inkyih.r-13qz1uu > input", { visible: true });
        await page.type("#layers > div:nth-child(2) > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv.r-1awozwy > div.css-175oi2r.r-1wbh5a2.r-htvplk.r-1udh08x.r-1867qdf.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1 > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox.r-kemksi.r-1wbh5a2 > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-1dqxon3 > div > div > div.css-175oi2r.r-1e084wi.r-13qz1uu > div > label > div > div.css-175oi2r.r-18u37iz.r-16y2uox.r-1wbh5a2.r-1wzrnnt.r-1udh08x.r-xd6kpl.r-is05cd.r-ttdzmv > div.css-146c3p1.r-bcqeeo.r-1ttztb7.r-qvutc0.r-37j5jr.r-135wba7.r-16dba41.r-1awozwy.r-6koalj.r-1inkyih.r-13qz1uu > input", X[1], { delay: 100 });
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        await page.waitForSelector("#layers > div:nth-child(2) > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv.r-1awozwy > div.css-175oi2r.r-1wbh5a2.r-htvplk.r-1udh08x.r-1867qdf.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1 > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox.r-kemksi.r-1wbh5a2 > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div.css-175oi2r.r-1f0wa7y > div > div.css-175oi2r > div > div > button", { visible: true});
        await page.click("#layers > div:nth-child(2) > div > div > div > div > div > div.css-175oi2r.r-1ny4l3l.r-18u37iz.r-1pi2tsx.r-1777fci.r-1xcajam.r-ipm5af.r-g6jmlv.r-1awozwy > div.css-175oi2r.r-1wbh5a2.r-htvplk.r-1udh08x.r-1867qdf.r-kwpbio.r-rsyp9y.r-1pjcn9w.r-1279nm1 > div > div > div.css-175oi2r.r-1ny4l3l.r-6koalj.r-16y2uox.r-kemksi.r-1wbh5a2 > div.css-175oi2r.r-16y2uox.r-1wbh5a2.r-f8sm7e.r-13qz1uu.r-1ye8kvj > div.css-175oi2r.r-1f0wa7y > div > div.css-175oi2r > div > div > button");
        parentPort.postMessage({ status: 'Success', address });
    } catch (error) {
        console.error('Lỗi khi tương tác với MetaMask:', error);
        parentPort.postMessage('Failure');
    }
}

if (isMainThread) {
    startWorkers();  
} else {
    processMetaMask();  
}
