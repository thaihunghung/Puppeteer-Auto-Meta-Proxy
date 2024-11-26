const xlsx = require('xlsx');

const WalletLoader = function (filePath) {
    return {
        loadFile: function () {
            try {
                const workbook = xlsx.readFile(filePath);
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                if (!sheet) {
                    console.error('Không tìm thấy sheet trong workbook Excel.');
                    return [];
                }
                return xlsx.utils.sheet_to_json(sheet);
            } catch (error) {
                console.error('Lỗi khi đọc file Excel:', error);
                return [];
            }
        },

        findMnemonicByAddress: function (address) {
            const data = this.loadFile();
            const match = data.find((row) => row.Address === address);
            return match ? match.Mnemonic : null;
        },

        getAddressesFromExcel: function () {
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            if (!sheet) {
                console.error('Không tìm thấy sheet trong workbook Excel.');
                return [];
            }
            const addressColumn = 'A'; 
            const addresses = [];

            let rowIndex = 2; 
            while (sheet[`${addressColumn}${rowIndex}`]) {
                addresses.push(sheet[`${addressColumn}${rowIndex}`].v); 
                rowIndex++;
            }

            return addresses;
        },

        getProxiesFromExcel: function () {
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            if (!sheet) {
                console.error('Không tìm thấy sheet trong workbook Excel.');
                return [];
            }
            const proxyColumn = 'B';  
            const proxies = [];

            let rowIndex = 2;  
            while (sheet[`${proxyColumn}${rowIndex}`]) {
                proxies.push(sheet[`${proxyColumn}${rowIndex}`].v);  
                rowIndex++;
            }

            return proxies;
        }
    };
};

module.exports = WalletLoader;
