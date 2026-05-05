const axios = require('axios');

/**
 * Z374-S34RCH: Web Intelligence Utility v3.6
 * Ultra-Fast: Parallel racing with a strict 4-second cutoff for fast tiers.
 */
class WebSearch {
    constructor() {
        this.ddgLite = 'https://lite.duckduckgo.com/lite/';
        this.jinaBase = 'https://r.jina.ai/';
        this.searxFallbacks = [
            'https://searx.be/search',
            'https://baresearch.org/search',
        ];
    }

    async fetchDDGLite(query) {
        try {
            const res = await axios.post(
                this.ddgLite,
                `q=${encodeURIComponent(query)}&kl=wt-wt`,
                {
                    timeout: 3500,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0',
                        'Accept': 'text/html',
                    }
                }
            );

            const html = res.data;
            const results = [];
            const linkRe = /<a[^>]+class="result-link"[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
            const snippetRe = /<td[^>]+class="result-snippet"[^>]*>([\s\S]*?)<\/td>/g;

            const links = [];
            let m;
            while ((m = linkRe.exec(html)) !== null) links.push({ url: m[1], title: m[2].trim() });
            const snippets = [];
            while ((m = snippetRe.exec(html)) !== null) snippets.push(m[1].replace(/<[^>]+>/g, '').trim());

            for (let i = 0; i < Math.min(links.length, 3); i++) {
                results.push({ title: links[i].title, url: links[i].url, snippet: snippets[i] || '' });
            }
            if (results.length === 0) throw new Error('No results');
            return results;
        } catch (e) { throw e; }
    }

    async fetchViaJina(query) {
        try {
            const searchUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
            const res = await axios.get(`${this.jinaBase}${searchUrl}`, {
                timeout: 5000,
                headers: { 'Accept': 'text/plain', 'X-Return-Format': 'text' }
            });
            const text = res.data || '';
            if (text.length < 50) throw new Error('Short content');
            return [{ title: `Web Results for: ${query}`, url: searchUrl, snippet: text.substring(0, 1000) }];
        } catch (e) { throw e; }
    }

    async search(query) {
        // Skip if query is too short or just code-like
        if (query.length < 5 || /[{};]/.test(query)) return [];

        console.log(`[Z374-S34RCH] 🔍 Fast Search: "${query}"`);
        
        try {
            // Race DDG and Jina for the fastest possible result
            const results = await Promise.any([
                this.fetchDDGLite(query),
                this.fetchViaJina(query)
            ]);
            return results;
        } catch (e) {
            // Very quick attempt at ONE searx instance if both fast tiers fail
            try {
                const res = await axios.get(this.searxFallbacks[0], {
                    params: { q: query, format: 'json' },
                    timeout: 3000
                });
                return (res.data?.results || []).slice(0, 3).map(r => ({
                    title: r.title, snippet: r.content || '', url: r.url
                }));
            } catch (err) { return []; }
        }
    }

    formatResults(results) {
        if (!results || results.length === 0) return '';
        return results.map((r, i) => `[WEB_${i+1}] ${r.title}: ${r.snippet.substring(0, 300)}`).join('\n');
    }
}

module.exports = new WebSearch();
