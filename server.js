const express = require('express');
const cors = require('cors');
// const serverless = require('serverless-http');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const tmp = require('tmp');

const app = express();
// const router = express.Router();
const port = 3001;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.json({ message: 'Hello World!' });
})
app.post('/check-audio', upload.single('video'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
  
    const buffer = req.file.buffer;
  
    // Create a unique temporary file
    const tempFile = tmp.fileSync({ postfix: '.mp4' });
    fs.writeFileSync(tempFile.name, buffer);
  
    // Log the absolute path to the temporary file
    console.log('Temporary file path:', tempFile.name);
  
    // Use fluent-ffmpeg to check for audio
    ffmpeg.ffprobe(tempFile.name, (err, metadata) => {
        // Remove the temporary file
        tempFile.removeCallback();
      
        if (err) {
          console.error('FFmpeg error:', err);
          return res.status(500).json({ error: 'Error analyzing video file' });
        }
      
        // console.log('Metadata:', metadata); // Log the metadata
      
        const hasAudio = metadata.streams.some((stream) => stream.codec_type === 'audio');
        
        res.json({ hasAudio, metadata });
      });
  });
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// app.use('/.netlify/functions/api', router);
// module.exports.handler = serverless(app);
