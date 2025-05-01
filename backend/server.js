require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const Redis = require('redis');

const app = express();
app.use(express.json());

// Redis client setup
const redisClient = Redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Connect to Redis
(async () => {
    await redisClient.connect();
    console.log('Redis client connected');
})().catch(err => console.log('Redis Client Error', err));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// URL Schema with passcode
const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true,
    },
    passcode: {
        type: String,
        required: false,
        minlength: 5,
        maxlength: 5
    },
    clicks: {
        type: Number,
        required: true,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const Url = mongoose.model('Url', urlSchema);

// Create short URL with optional passcode
app.post('/api/shorten', async (req, res) => {
    const { url, passcode } = req.body;
    
    if (passcode && (passcode.length !== 5 || !/^\d+$/.test(passcode))) {
        return res.status(400).json({ error: 'Passcode must be exactly 5 digits' });
    }

    try {
        // Check Redis cache first
        const cacheKey = `${url}:${passcode || 'nopass'}`;
        const cachedUrl = await redisClient.get(cacheKey);
        
        if (cachedUrl) {
            return res.json(JSON.parse(cachedUrl));
        }

        // Check if URL already exists in MongoDB
        let urlDoc = await Url.findOne({ originalUrl: url, passcode: passcode });
        
        if (urlDoc) {
            // Cache the result
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(urlDoc));
            return res.json(urlDoc);
        }

        const shortUrl = shortid.generate();
        
        urlDoc = new Url({
            originalUrl: url,
            shortUrl: shortUrl,
            passcode: passcode || null
        });

        await urlDoc.save();
        // Cache the new URL
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(urlDoc));
        res.json(urlDoc);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Serve the verification form
app.get('/:shortUrl', async (req, res) => {
    try {
        // Check Redis cache first
        const cacheKey = `shortUrl:${req.params.shortUrl}`;
        const cachedUrl = await redisClient.get(cacheKey);
        
        let urlDoc;
        if (cachedUrl) {
            urlDoc = JSON.parse(cachedUrl);
        } else {
            urlDoc = await Url.findOne({ shortUrl: req.params.shortUrl });
            if (urlDoc) {
                // Cache the result for 1 hour
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(urlDoc));
            }
        }

        if (!urlDoc) {
            return res.status(404).json({ error: 'URL not found' });
        }

        // If no passcode is required, redirect directly
        if (!urlDoc.passcode) {
            // Update clicks in MongoDB
            await Url.findByIdAndUpdate(urlDoc._id, { $inc: { clicks: 1 } });
            // Update cache
            urlDoc.clicks++;
            await redisClient.setEx(cacheKey, 3600, JSON.stringify(urlDoc));
            return res.redirect(urlDoc.originalUrl);
        }

        // Serve HTML form for passcode input
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Enter Passcode</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background-color: #f5f5f5;
                    }
                    .container {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    input {
                        padding: 8px;
                        margin: 10px 0;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    button {
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                    }
                    button:hover {
                        background: #0056b3;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Protected URL</h2>
                    <form action="/${urlDoc.shortUrl}/verify" method="POST">
                        <input type="text" name="passcode" placeholder="Enter 5-digit passcode" pattern="[0-9]{5}" required>
                        <br>
                        <button type="submit">Submit</button>
                    </form>
                </div>
            </body>
            </html>
        `;
        res.send(html);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify passcode and redirect
app.post('/:shortUrl/verify', express.urlencoded({ extended: true }), async (req, res) => {
    try {
        const { passcode } = req.body;
        const cacheKey = `shortUrl:${req.params.shortUrl}`;
        const cachedUrl = await redisClient.get(cacheKey);
        
        let urlDoc;
        if (cachedUrl) {
            urlDoc = JSON.parse(cachedUrl);
        } else {
            urlDoc = await Url.findOne({ shortUrl: req.params.shortUrl });
            if (urlDoc) {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(urlDoc));
            }
        }

        if (!urlDoc) {
            return res.status(404).json({ error: 'URL not found' });
        }

        if (urlDoc.passcode !== passcode) {
            return res.status(403).send('Invalid passcode. <a href="javascript:history.back()">Go back</a>');
        }

        // Update clicks in MongoDB
        await Url.findByIdAndUpdate(urlDoc._id, { $inc: { clicks: 1 } });
        // Update cache
        urlDoc.clicks++;
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(urlDoc));
        res.redirect(urlDoc.originalUrl);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await redisClient.quit();
    process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});