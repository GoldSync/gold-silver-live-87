import axios from 'axios';
import * as cheerio from 'cheerio';

async function analyze() {
    try {
        const url = 'https://www.livepriceofgold.com/usa-gold-price.html';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        console.log("Searching for scripts and AJAX calls...");

        // 1. Log all src of script tags
        $('script').each((i, el) => {
            const src = $(el).attr('src');
            if (src) {
                console.log(`Script Src: ${src}`);
            } else {
                // Inline script - check for keywords
                const content = $(el).html();
                if (content.includes('ajax') || content.includes('json') || content.includes('update') || content.includes('fetch')) {
                    console.log('--- Inline Script Match ---');
                    console.log(content.substring(0, 500)); // Log first 500 chars
                    console.log('---------------------------');
                }
            }
        });

    } catch (err) {
        console.error(err);
    }
}

analyze();
