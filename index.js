const express = require('express');
const https = require('https');
const app = express();

app.get('/get-stream', (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) {
        return res.status(400).json({ success: false, message: "videoId daxil edilməyib" });
    }

    // Stabil Piped API instansiyalarından istifadə edirik
    const pipedApiUrl = `https://pipedapi.kavin.rocks/streams/${videoId}`;

    https.get(pipedApiUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
    }, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => { data += chunk; });
        apiRes.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.videoStreams && json.videoStreams.length > 0) {
                    // Səs və video olan birbaşa mp4 formatını seçirik
                    const stream = json.videoStreams.find(s => !s.videoOnly && s.url);
                    if (stream && stream.url) {
                        return res.json({ success: true, url: stream.url });
                    }
                }
                return res.status(404).json({ success: false, message: "No playable formats found" });
            } catch (e) {
                return res.status(500).json({ success: false, error: "JSON parse xətası" });
            }
        });
    }).on('error', (err) => {
        return res.status(500).json({ success: false, error: err.message });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server işləyir`));
