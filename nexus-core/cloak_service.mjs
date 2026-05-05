import { launch } from 'cloakbrowser';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let browser;

async function initBrowser() {
    console.log("[CLOAK] Initializing Stealth Chromium...");
    try {
        browser = await launch({
            headless: true,
            humanize: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log("[CLOAK] Stealth Vector Operational.");
    } catch (e) {
        console.error("[CLOAK] Failed to launch browser:", e);
    }
}

app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    let context;
    try {
        console.log(`[CLOAK] Executing stealth extraction for: ${url}`);
        context = await browser.newContext();
        const page = await context.newPage();
        
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        
        const content = await page.evaluate(() => {
            return document.body.innerText;
        });

        res.json({ content: content.substring(0, 10000) });
    } catch (error) {
        console.error(`[CLOAK] Extraction failed: ${error.message}`);
        res.status(500).json({ error: error.message });
    } finally {
        if (context) await context.close();
    }
});

app.listen(PORT, async () => {
    console.log(`[CLOAK] Stealth Service listening on port ${PORT}`);
    await initBrowser();
});
