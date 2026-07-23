const express = require('express');
const https = require('https');
const app = express();

// Yardımçı funksiya: URL-ə sorğu göndərmək üçün
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(data);
                } else {
                    reject(new Error(`Status: ${res.statusCode}`));
                }
            });
        }).on('error', err => reject(err));
    });
}

app.get('/get-stream', async (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) {
        return res.status(400).json({ success: false, message: "videoId daxil edilməyib" });
    }

    // Ən stabil işləyən ictimai Piped API serverlərinin siyahısı
    const apis = [
        `https://pipedapi.kavin.rocks/streams/${videoId}`,
        `https://api.piped.privacydev.net/streams/${videoId}`,
        `https://pipedapi.adminforge.de/streams/${videoId}`,
        `https://pipedapi.mha.fi/streams/${videoId}`
    ];

    for (let api of apis) {
        try {
            const data = await fetchUrl(api);
            const json = JSON.parse(data);
            if (json.videoStreams && json.videoStreams.length > 0) {
                const stream = json.videoStreams.find(s => !s.videoOnly && s.url);
                if (stream && stream.url) {
                    return res.json({ success: true, url: stream.url });
                }
            }
        } catch (e) {
            // Bu server işləmədi, növbəti serverə keçirik
            continue;
        }
    }

    return res.status(404).json({ success: false, message: "Stream tapılmadı" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server işləyir`));
