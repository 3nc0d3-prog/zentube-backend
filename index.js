const express = require('express');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.get('/get-stream', async (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) {
        return res.status(400).json({ success: false, message: "videoId daxil edilməyib" });
    }

    try {
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const info = await ytdl.getInfo(videoUrl, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        });

        // Səs və video birgə olan ən yüksək keyfiyyətli linki seçirik
        const format = ytdl.chooseFormat(info.formats, { filter: 'audioandvideo', quality: 'highestvideo' });

        if (format && format.url) {
            return res.json({ success: true, url: format.url });
        } else {
            return res.status(404).json({ success: false, message: "Stream URL tapılmadı" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda işləyir`));
