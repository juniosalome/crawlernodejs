const puppeteer = require('puppeteer-core');

const url = "https://www.mercadolivre.com.br/";
            
const searchFor = "macbook";
const launchOptions = { headless: true, // faz o navegador ficar oculto
    executablePath: '/usr/bin/google-chrome-stable', // define o caminho do navegador
     };
let c = 0;
const MAX_PAGE = 10;
const list = [];

(async () => {

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    console.log("Iniciado");

    await page.goto(url);
    console.log("URL acessada");
    await page.waitForSelector('#cb1-edit');

    await page.type('#cb1-edit',searchFor);

    await Promise.all([
        page.waitForNavigation(),
        await page.click('.nav-search-btn')    
    ]);

    const links = await page.$$eval('.ui-search-result__image > a', el => el.map(link => link.href));
    
    console.log('Iremos acessar apenas ', MAX_PAGE, ' links');
    for(const link of links){
        if(c == MAX_PAGE) continue;
        console.log('Página', c + 1);

        await page.goto(link);
        await page.waitForSelector('.ui-pdp-title');
        
        const title = await page.$eval('.ui-pdp-title', element => element.innerText);
        const price = await page.$eval('.andes-money-amount__fraction', element => element.innerText);
        const seller = await page.evaluate(() =>{
            const el = document.querySelector('.ui-pdp-seller__link-trigger'); 
            if(!el) return null;
            return el.innerText; 
        });
        const obj = {};
        obj.title = title;
        obj.price = price;
        (seller ? obj.seller = seller : '');
        obj.link = link;

        list.push(obj);
        c++;
    }

    console.log(list);

    await page.waitForTimeout(3000);
    await browser.close();

})();
