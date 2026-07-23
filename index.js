const express = genre = require('express');
const https = require('https');
const app = express();

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

    // Stabil Invidious API instansiyaları
    const apis = [
        `https://vid.priv.au/api/v1/videos/${videoId}`,
        `https://invidious.privacyredirect.com/api/v1/videos/${videoId}`,
        `https://inv.nadeko.net/api/v1/videos/${videoId}`,
        `https://invidious.protagon.space/api/v1/videos/${videoId}`
    ];

    for (let api of apis) {
        try {
            const data = await fetchUrl(api);
            const json = JSON.parse(data);
            if (json.formatStreams && json.formatStreams.length > 0) {
                // Ən yaxşı mp4 formatını seçirik
                const stream = json.formatStreams.find(s => s.container === "mp4" && s.url);
                if (stream && stream.url) {
                    return res.json({ success: true, url: stream.url });
                }
            } else if (json.adaptiveFormats && json.adaptiveFormats.length > 0) {
                const stream = json.adaptiveFormats.find(s => s.type && s.type.includes("video/mp4") && s.url);
                if (stream && stream.url) {
                    return res.json({ success: true, url: stream.url });
                }
            }
        } catch (e) {
            continue;
        }
    }

    return res.status(404).json({ success: false, message: "Stream tapılmadı" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server işləyir`));
