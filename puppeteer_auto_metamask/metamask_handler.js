const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const path = require('path');

const PuppeteerAutoMetaMask = function (extensionPath, proxy) {
    return {
        launchBrowser: async function () {       
            const oldProxyUrl = proxy;
            const newProxyUrl = await proxyChain.anonymizeProxy(oldProxyUrl);
            return puppeteer.launch({
                headless: false,                
                args: [
                    `--proxy-server=${newProxyUrl}`,
                    `--disable-extensions-except=${extensionPath}`,
                    `--load-extension=${extensionPath}`,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-extensions',
                    '--disable-popup-blocking',
                    '--no-first-run', 
                ],
            });
        },

        inputMnemonic: async function (page, formattedMnemonic) {
            if (formattedMnemonic.length !== 12) {
                throw new Error("Invalid mnemonic: Expected 12 words.");
            }

            for (let i = 0; i < formattedMnemonic.length; i++) {
                const selector = `#import-srp__srp-word-${i}`;
                await page.waitForSelector(selector, { visible: true, timeout: 60000 });
                await page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    if (element) element.scrollIntoView();
                }, selector);
                await page.type(selector, formattedMnemonic[i]);
                // console.log(`Word ${i + 1} of 12 typed successfully.`);
            }
        },
               
        inputPasswordMetaMask: async function (page, password) {
            await page.waitForSelector("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.mm-box--margin-top-3.mm-box--justify-content-center > form > div:nth-child(1) > label > input", { visible: true });
            await page.type("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.mm-box--margin-top-3.mm-box--justify-content-center > form > div:nth-child(1) > label > input", password, { delay: 100 });
            await page.waitForSelector("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.mm-box--margin-top-3.mm-box--justify-content-center > form > div:nth-child(2) > label > input", { visible: true });
            await page.type("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.mm-box--margin-top-3.mm-box--justify-content-center > form > div:nth-child(2) > label > input", password, { delay: 100 });
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.waitForSelector("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.mm-box--margin-top-3.mm-box--justify-content-center > form > div.mm-box.mm-box--margin-top-4.mm-box--margin-bottom-4.mm-box--justify-content-space-between.mm-box--align-items-center > label > span.mm-checkbox__input-wrapper > input", { visible: true });
            await page.click("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.mm-box--margin-top-3.mm-box--justify-content-center > form > div.mm-box.mm-box--margin-top-4.mm-box--margin-bottom-4.mm-box--justify-content-space-between.mm-box--align-items-center > label > span.mm-checkbox__input-wrapper > input");
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.waitForSelector("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.mm-box--margin-top-3.mm-box--justify-content-center > form > button", { visible: true });
            await page.click("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.mm-box--margin-top-3.mm-box--justify-content-center > form > button");
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.waitForSelector("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.creation-successful__actions.mm-box--margin-top-6.mm-box--display-flex.mm-box--flex-direction-column.mm-box--justify-content-center.mm-box--align-items-center > button", { visible: true });
            await page.click("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.creation-successful__actions.mm-box--margin-top-6.mm-box--display-flex.mm-box--flex-direction-column.mm-box--justify-content-center.mm-box--align-items-center > button");
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.waitForSelector("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.onboarding-pin-extension__buttons > button", { visible: true });
            await page.click("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.onboarding-pin-extension__buttons > button");
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.waitForSelector("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.onboarding-pin-extension__buttons > button", { visible: true });
            await page.click("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.onboarding-pin-extension__buttons > button");
        },
        
        interactWithMetaMask: async function (browser, formattedMnemonic) {
            const pages = await browser.pages();
            const newPage = await browser.newPage();
            await newPage.goto('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html#onboarding/welcome');

            for (const page of pages) {
                const url = await page.url();
                if (url === 'about:blank') {
                    await page.close();
                }
                if (url === url.includes('chrome-extension://')) {
                    await page.close();
                }
            }

            // MetaMask onboarding
            await newPage.waitForSelector("#onboarding__terms-checkbox", { visible: true, timeout: 60000 });
            await newPage.click("#onboarding__terms-checkbox");
            await new Promise(resolve => setTimeout(resolve, 1000));

            await newPage.click(
                '#app-content > div > div.mm-box.main-container-wrapper > div > div > div > ul > li:nth-child(3) > button'
            );
            await new Promise(resolve => setTimeout(resolve, 1000));

            await newPage.click(
                '#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.mm-box.onboarding-metametrics__buttons.mm-box--display-flex.mm-box--gap-4.mm-box--flex-direction-row.mm-box--width-full > button.mm-box.mm-text.mm-button-base.mm-button-base--size-lg.mm-button-primary.mm-text--body-md-medium.mm-box--padding-0.mm-box--padding-right-4.mm-box--padding-left-4.mm-box--display-inline-flex.mm-box--justify-content-center.mm-box--align-items-center.mm-box--color-primary-inverse.mm-box--background-color-primary-default.mm-box--rounded-pill'
            );
            await this.inputMnemonic(newPage, formattedMnemonic);
            await newPage.waitForSelector("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.import-srp__actions > div > button", { visible: true });
            await newPage.click("#app-content > div > div.mm-box.main-container-wrapper > div > div > div > div.import-srp__actions > div > button");
            await new Promise(resolve => setTimeout(resolve, 1000));
            const password = 'hunghung'
            await this.inputPasswordMetaMask(newPage,password)
        },
    };
};

module.exports = PuppeteerAutoMetaMask;
