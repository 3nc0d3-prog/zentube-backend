const express = require('express');
const https = require('https');
const app = express();

app.get('/get-stream', (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) {
        return res.status(400).json({ success: false, message: "videoId daxil edilməyib" });
    }

    // Hazırda aktiv və stabil işləyən Piped API ünvanı
    const targetUrl = `https://pipedapi.privacy.com.de/streams/${videoId}`;

    https.get(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    }, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.videoStreams && json.videoStreams.length > 0) {
                    const stream = json.videoStreams.find(s => !s.videoOnly && s.url);
                    if (stream && stream.url) {
                        return res.json({ success: true, url: stream.url });
                    }
                }
                return res.status(404).json({ success: false, message: "Stream tapılmadı" });
            } catch (e) {
                return res.status(500).json({ success: false, error: "Parse xətası" });
            }
        });
    }).on('error', (err) => {
        return res.status(500).json({ success: false, error: err.message });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server işləyir`));
