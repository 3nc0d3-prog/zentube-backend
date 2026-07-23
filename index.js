const express = require('express');
const ytdl = require('@distube/ytdl-core');
const app = express();

app.get('/get-stream', async (req, res) => {
    const videoId = req.query.videoId;
    if (!videoId) {
        return res.status(400).json({ success: false, message: "videoId daxil edilməyib" });
    }

    try {
        const videoURL = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Videonun mövcudluğunu və məlumatlarını yoxlayırıq
        const info = await ytdl.getInfo(videoURL);
        
        // Yalnız video və səsi olan (mp4) ən yaxşı formatı seçirik
        const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audiovideo' });
        
        if (format && format.url) {
            return res.json({ success: true, url: format.url });
        } else {
            return res.status(404).json({ success: false, message: "Uyğun format tapılmadı" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server işləyir`));
