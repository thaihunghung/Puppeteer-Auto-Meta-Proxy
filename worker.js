const PuppeteerAutoMetaMask = require('./puppeteer_auto_metamask/metamask_handler');
const XLogin = require('./auto_x/XLogin');
const { workerData, parentPort } = require('worker_threads');
const puppeteerAutoMetaMask = PuppeteerAutoMetaMask(workerData.extensionPath, workerData.proxy);

async function run() {
    const browser = await puppeteerAutoMetaMask.Browser();
    const address = workerData.testAddress;
    try {
        const page = await browser.newPage();
        const pageloginGoogle = await browser.newPage();
        await pageloginGoogle.goto('https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ifkv=AcMMx-d_0N_E6appC52qTza8azo-_W1j1CBGMgsT-r9NlPeiDThR0ohbyFe28LgF_Ij4xychwEBBaw&rip=1&sacu=1&service=mail&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S2013822857%3A1732653033507714&ddm=1');

        await pageloginGoogle.waitForSelector("#identifierId", { visible: true });
        await pageloginGoogle.type("#identifierId", workerData.email, { delay: 100 });
        
        await pageloginGoogle.waitForSelector("#identifierNext > div > button", { visible: true });
        await pageloginGoogle.click("#identifierNext > div > button");
        
        await pageloginGoogle.waitForSelector("#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input", { visible: true });
        await pageloginGoogle.type("#password > div.aCsJod.oJeWuf > div > div.Xb9hP > input", workerData.pass_email, { delay: 100 });
        

        await pageloginGoogle.waitForSelector("#passwordNext > div > button", { visible: true });
        await pageloginGoogle.click("#passwordNext > div > button");
        

        //chờ search Harbor

        await pageloginGoogle.waitForSelector("#gs_lc50 > input:nth-child(1)", { visible: true });
        await pageloginGoogle.type("#gs_lc50 > input:nth-child(1)", workerData.search, { delay: 100 });

        

        await pageloginGoogle.waitForSelector("#aso_search_form_anchor > button.gb_Ce", { visible: true });
        await pageloginGoogle.click("#aso_search_form_anchor > button.gb_Ce");
        
        await pageloginGoogle.waitForSelector("#\:18o", { visible: true });
        await pageloginGoogle.click("#\:18o");

        await pageloginGoogle.waitForSelector("#\:1so", { visible: true });
        await pageloginGoogle.click("#\:1so");
        
        await pageloginGoogle.waitForSelector("#\:1vt > div:nth-child(2) > center > div > table > tbody > tr > td > div > div > div > div > div > table:nth-child(2) > tbody > tr > td > div > div > div > div > a", { visible: true });
        await pageloginGoogle.click("#\:1vt > div:nth-child(2) > center > div > table > tbody > tr > td > div > div > div > div > div > table:nth-child(2) > tbody > tr > td > div > div > div > div > a");
        






        await page.goto('https://hub.talus.network/onboarding/login');
        await page.waitForSelector("body > div:nth-child(1) > div > div > div > div > div > div > form > input.btn-secondary.py-2.px-4.w-full", { visible: true });
        await page.type("body > div:nth-child(1) > div > div > div > div > div > div > form > input.btn-secondary.py-2.px-4.w-full", workerData.email, { delay: 100 });
        

        


        









        //await new Promise(resolve => setTimeout(resolve, 10000));
        //await puppeteerAutoMetaMask.interactWithMetaMask(browser, workerData.formattedMnemonic);
        // const page = await browser.newPage();
        // await page.goto('https://x.com/i/flow/login');
        // const X = workerData.dataX.split(' ');

        //await XLogin.loginWithBackupCore(page, X)
        // const page = await browser.newPage();
        // await page.goto('https://sugarrush-testnet.zkcandy.io/?_gl=1*louykl*_ga*MTAxNzM0NzgyOC4xNzMyNjMwNTI5*_ga_JLXZHJ0PDH*MTczMjYzMDUyOC4xLjEuMTczMjYzMDUzMi4wLjAuMA..');
        // const closeMeta = await browser.pages();
        // await new Promise(resolve => setTimeout(resolve, 5000));
        // for (const page of closeMeta) {
        //     const url = await page.url();
        //     if (url === 'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#') {
        //         await page.close();
        //     }
        // }

        // await new Promise(resolve => setTimeout(resolve, 1000));


        // const button1 = await page.waitForSelector('body > ngb-modal-window > div > div > button');
        // // If the button is found, click it
        // if (button1) {
        //     await button1.click();
        //     console.log("Button clicked!");
        // } else {
        //     console.log("Button not found.");
        // }
   
        // await new Promise(resolve => setTimeout(resolve, 3000));
        // await page.waitForSelector('body > w3m-modal');
        // await page.evaluate(() => {
        //     const shadowRoot1 = document.querySelector('body > w3m-modal').shadowRoot;
        //     const shadowRoot2 = shadowRoot1.querySelector('wui-flex > wui-card > w3m-router').shadowRoot;
        //     const shadowRoot3 = shadowRoot2.querySelector('div > w3m-connect-view').shadowRoot;
        //     const shadowRoot4 = shadowRoot3.querySelector('wui-flex > wui-list-wallet:nth-child(3)').shadowRoot;
        //     const buttonElement = shadowRoot4.querySelector('button');

        //     // Ensure the button exists and click it
        //     if (buttonElement) {
        //         buttonElement.click();
        //     } else {
        //         console.log("Button not found.");
        //     }
        // });
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // const allPages = await browser.pages();
        // for (const currentPage of allPages) {
        //     const url = await currentPage.url();
        //     if (url === 'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/notification.html') {
        //         console.log("Pop-up found:", url);
        //         // Perform actions on the pop-up
        //         await currentPage.bringToFront(); // Bring the pop-up to focus
        //         await currentPage.waitForSelector('#app-content > div > div > div > div.mm-box.multichain-page.mm-box--display-flex.mm-box--flex-direction-row.mm-box--justify-content-center.mm-box--width-full.mm-box--height-full.mm-box--background-color-background-alternative > div > div.mm-box.multichain-page-footer.mm-box--padding-4.mm-box--display-flex.mm-box--gap-4.mm-box--width-full > div > div.mm-box.mm-box--display-flex.mm-box--gap-4.mm-box--width-full > button.mm-box.mm-text.mm-button-base.mm-button-base--size-lg.mm-button-base--block.mm-button-primary.mm-text--body-md-medium.mm-box--padding-0.mm-box--padding-right-4.mm-box--padding-left-4.mm-box--display-inline-flex.mm-box--justify-content-center.mm-box--align-items-center.mm-box--color-primary-inverse.mm-box--background-color-primary-default.mm-box--rounded-pill');
        //         await currentPage.click('#app-content > div > div > div > div.mm-box.multichain-page.mm-box--display-flex.mm-box--flex-direction-row.mm-box--justify-content-center.mm-box--width-full.mm-box--height-full.mm-box--background-color-background-alternative > div > div.mm-box.multichain-page-footer.mm-box--padding-4.mm-box--display-flex.mm-box--gap-4.mm-box--width-full > div > div.mm-box.mm-box--display-flex.mm-box--gap-4.mm-box--width-full > button.mm-box.mm-text.mm-button-base.mm-button-base--size-lg.mm-button-base--block.mm-button-primary.mm-text--body-md-medium.mm-box--padding-0.mm-box--padding-right-4.mm-box--padding-left-4.mm-box--display-inline-flex.mm-box--justify-content-center.mm-box--align-items-center.mm-box--color-primary-inverse.mm-box--background-color-primary-default.mm-box--rounded-pill'); 
        //         console.log("Pop-up interaction complete.");
        //     }
        // }
        // await new Promise(resolve => setTimeout(resolve, 1000));
        // await page.evaluate(() => {
        //     // Access the shadow DOM step by step
        //     const shadowRoot1 = document.querySelector("body > w3m-modal").shadowRoot;
        //     const shadowRoot2 = shadowRoot1.querySelector("wui-flex > wui-card > w3m-router").shadowRoot;
        //     const shadowRoot3 = shadowRoot2.querySelector("div > w3m-unsupported-chain-view").shadowRoot;
        //     const shadowRoot4 = shadowRoot3.querySelector("wui-flex > wui-flex:nth-child(2) > wui-list-network").shadowRoot;
        
        //     // Find the button element
        //     const buttonElement = shadowRoot4.querySelector("button");
        
        //     // Click the button if it exists
        //     if (buttonElement) {
        //         buttonElement.click();
        //     } else {
        //         console.error("Button not found.");
        //     }
        // });

        // await new Promise(resolve => setTimeout(resolve, 2000));
        // const testapprove = await browser.pages();
        // for (const currentPage of testapprove) {
        //     const url = await currentPage.url();
        //     if (url === 'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/notification.html') {
        //         console.log("Pop-up found:", url);
        //         // Perform actions on the pop-up
        //         await currentPage.bringToFront(); // Bring the pop-up to focus
        //         await currentPage.waitForSelector('#app-content > div > div > div > div.mm-box.multichain-page.mm-box--display-flex.mm-box--flex-direction-row.mm-box--justify-content-center.mm-box--width-full.mm-box--height-full.mm-box--background-color-background-alternative > div > div.mm-box.multichain-page-footer.mm-box--padding-4.mm-box--display-flex.mm-box--gap-4.mm-box--width-full > div > div.mm-box.mm-box--display-flex.mm-box--gap-4.mm-box--width-full > button.mm-box.mm-text.mm-button-base.mm-button-base--size-lg.mm-button-base--block.mm-button-primary.mm-text--body-md-medium.mm-box--padding-0.mm-box--padding-right-4.mm-box--padding-left-4.mm-box--display-inline-flex.mm-box--justify-content-center.mm-box--align-items-center.mm-box--color-primary-inverse.mm-box--background-color-primary-default.mm-box--rounded-pill');
        //         await currentPage.click('#app-content > div > div > div > div.mm-box.multichain-page.mm-box--display-flex.mm-box--flex-direction-row.mm-box--justify-content-center.mm-box--width-full.mm-box--height-full.mm-box--background-color-background-alternative > div > div.mm-box.multichain-page-footer.mm-box--padding-4.mm-box--display-flex.mm-box--gap-4.mm-box--width-full > div > div.mm-box.mm-box--display-flex.mm-box--gap-4.mm-box--width-full > button.mm-box.mm-text.mm-button-base.mm-button-base--size-lg.mm-button-base--block.mm-button-primary.mm-text--body-md-medium.mm-box--padding-0.mm-box--padding-right-4.mm-box--padding-left-4.mm-box--display-inline-flex.mm-box--justify-content-center.mm-box--align-items-center.mm-box--color-primary-inverse.mm-box--background-color-primary-default.mm-box--rounded-pill'); 
        //         console.log("Pop-up interaction complete.");
        //     }
        // }


        // const testapprove1 = await browser.pages();
        // for (const currentPage of testapprove1) {
        //     const url = await currentPage.url();
        //     console.log(url);
        //     if (url === 'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/notification.html#confirmation') {
        //         console.log("Pop-up found:", url);
        //         // Perform actions on the pop-up
        //         await currentPage.bringToFront(); // Bring the pop-up to focus
        //         await currentPage.waitForSelector('#app-content > div > div > div > div.confirmation-footer > div > button.button.btn--rounded.btn-primary');
        //         await currentPage.click('#app-content > div > div > div > div.confirmation-footer > div > button.button.btn--rounded.btn-primary'); 
        //         console.log("Pop-up interaction complete.");
        //     }
        // }


        
     

        // const button2 = await page.waitForSelector('body > app-root > div > div.container.d-flex.justify-content-center.p-0 > div > div.cm-bottom > button.btn-mint', { visible: true, timeout: 6000 });
        // // If the button is found, click it
        // if (button2) {
        //     await button2.click();
        //     console.log("Button clicked!");
        // } else {
        //     console.log("Button not found.");
        // }
        // await new Promise(resolve => setTimeout(resolve, 30000));
        // const testapprove2 = await browser.pages();
        // for (const currentPage of testapprove2) {
        //     const url = await currentPage.url();
        //     console.log(url);
        //     // if (url === 'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/notification.html#confirmation') {
        //     //     console.log("Pop-up found:", url);
        //     //     // Perform actions on the pop-up
        //     //     await currentPage.bringToFront(); // Bring the pop-up to focus
        //     //     await currentPage.waitForSelector('#app-content > div > div > div > div.confirmation-footer > div > button.button.btn--rounded.btn-primary');
        //     //     await currentPage.click('#app-content > div > div > div > div.confirmation-footer > div > button.button.btn--rounded.btn-primary'); 
        //     //     console.log("Pop-up interaction complete.");
        //     // }
        // }




        // await new Promise(resolve => setTimeout(resolve, 30000));

        
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

