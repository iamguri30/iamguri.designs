import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for base64 image uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Cloudinary Configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const cloudinaryUrl = process.env.CLOUDINARY_URL;

if (cloudinaryUrl) {
  cloudinary.config({ cloudinary_url: cloudinaryUrl });
} else if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

// Check Cloudinary status endpoint
app.get('/api/cloudinary-status', (req, res) => {
  const isConfigured = Boolean(cloudinaryUrl || (cloudName && apiKey && apiSecret));
  res.json({
    configured: isConfigured,
    cloudName: cloudName || (cloudinaryUrl ? 'Configured via CLOUDINARY_URL' : null),
  });
});

// Image Upload API route using Cloudinary
app.post('/api/upload', async (req, res) => {
  try {
    const { image, folder = 'portfolio' } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    const isConfigured = Boolean(cloudinaryUrl || (cloudName && apiKey && apiSecret));
    if (!isConfigured) {
      return res.status(400).json({
        error: 'Cloudinary credentials are not configured in environment variables. Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment or .env file.',
        configured: false,
      });
    }

    // Upload base64 image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: 'auto',
    });

    return res.json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes,
      provider: 'cloudinary',
    });
  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to upload image to Cloudinary.',
      details: error,
    });
  }
});

// Initialize server with Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Vite Dev Server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
