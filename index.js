const express = require('express');
const https = require('https');
const app = express();

app.get('/get-stream', (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) {
        return res.status(400).json({ success: false, message: "videoId daxil edilməyib" });
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    https.get(embedUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    }, (apiRes) => {
        let data = '';
        apiRes.on('data', (chunk) => { data += chunk; });
        apiRes.on('end', () => {
            try {
                const match = data.match(/ytInitialPlayerResponse\s*=\s*({.+?});/);
                if (match && match[1]) {
                    const json = JSON.parse(match[1]);
                    const streamingData = json.streamingData;
                    
                    if (streamingData) {
                        let formats = streamingData.formats || [];
                        if (streamingData.adaptiveFormats) {
                            formats = formats.concat(streamingData.adaptiveFormats);
                        }
                        
                        // İşlək mp4 formatını seçirik
                        const best = formats.find(f => f.url && f.mimeType && f.mimeType.includes('video/mp4'));
                        if (best && best.url) {
                            return res.json({ success: true, url: best.url });
                        }
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
