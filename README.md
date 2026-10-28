# Graphic Designer Portfolio & Studio Management System

A modern, editorial Graphic Designer Portfolio and Admin Dashboard built with HTML5, CSS3, JavaScript/TypeScript, Bootstrap 5, AOS (Animate On Scroll), and Google Firebase (Cloud Firestore, Firebase Authentication, and Firebase Storage).

---

## Visual Design & Architecture
- **Theme**: Premium dark aesthetic (`#0B0B0D` primary background, `#121216` secondary background, `#1A1A20` surface background, `#C6FF4D` electric lime accent).
- **CSS Framework**: Strictly Bootstrap v5 (grid, responsive containers, utilities, modals, forms).
- **Typography**: Google Fonts — **Playfair Display** (editorial serif headlines) and **Poppins** (modern sans-serif body and UI).
- **Motion**: AOS library for subtle scroll-triggered entrances and transitions.
- **Icons**: Bootstrap Icons.
- **Database**: Cloud Firestore with strict document schemas, relational safety, and empty-data suppression.
- **Authentication**: Firebase Authentication with Google Sign-In and Email/Password.
- **Storage**: Firebase Storage for project cover images, thumbnails, and gallery artifacts.

---

## Features

### 1. Public Portfolio
- **Dynamic Navbar**: Automatically reflects only active sections with published content.
- **Hero Section**: Editorial headline contrast, availability status badge, and optional visual artwork.
- **Curated Selected Works**: Categorized project gallery (Branding, Packaging, Editorial, Typography, Digital).
  - Featured asymmetrical compositions and responsive media grids.
  - Dedicated interactive Project Detail modal with creative brief, outcomes, metadata, and full gallery images.
- **About & Philosophy**: Designer biography, years of practice, core toolkits, accolades, and downloadable CV link.
- **Specialized Services**: Typographic rows with starting rates and one-click inquiry routing.
- **Creative Process**: 4-phase methodology timeline (Discovery, Strategy, Design, Delivery).
- **Client Endorsements**: Minimalist testimonial quotes with client roles and avatars.
- **Interactive Contact**: Validated project brief inquiry form directly connected to Firestore `inquiries`.

### 2. Admin Studio Dashboard (`/admin` or via discrete footer link)
- **Role-Based Authentication**: Protected admin portal restricted to authorized administrators.
- **Studio Overview**: Real-time counters for published projects, drafts, client inquiries, services, and categories.
- **1-Click Starter Seed**: "Seed Starter Portfolio Data" button to instantly populate showcase records into Firestore.
- **Project CRUD**:
  - Add, edit, delete, publish, draft, and feature projects.
  - Slug generator, tags, services delivered.
  - File upload to Firebase Storage or URL inputs.
  - Multi-image gallery builder with alt text captions.
- **Category Management**: Create, edit, and safely delete categories with project reference counts.
- **Service Management**: Add/edit disciplines, pricing tiers, and descriptions.
- **Testimonial Management**: Add/edit client quotes, avatars, and order.
- **Inquiry Management**: Review client briefs, change status (*New*, *In Progress*, *Completed*, *Archived*), and record private internal admin notes.
- **Site Settings & Section Toggles**: Configure designer branding, hero copy, bio, contact details, social links, and toggle homepage sections on/off.

---

## Strict Empty-Data Rules
- Sections without published, valid records are completely hidden.
- The navigation bar only displays links to sections that exist and are visible.
- If no portfolio projects exist yet, the portfolio grid is omitted without leaving empty gaps.

---

## Security
- Firestore rules enforce default-deny for all unauthorized access.
- Inquiries can be submitted by the public with validation, but only administrators can view, edit, or delete them.
- File uploads are validated and restricted to authorized admins.


---

## Deploying to GitHub Pages

### Why the `net::ERR_ABORTED 404 (Not Found)` error occurs
GitHub Pages is a static host. If you publish directly from the `main` branch root, browsers receive the raw development `index.html` file which references `<script type="module" src="/src/main.tsx"></script>`. Browsers cannot run raw TypeScript/TSX files directly. You must deploy the compiled production output in the `dist` folder.

### Method 1: Automated GitHub Actions (Recommended)
This repository includes `.github/workflows/deploy.yml` which automatically builds and publishes your site whenever you push code.

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Configure GitHub Pages deployment"
   git push origin main
   ```
2. Go to your repository on GitHub.
3. Click **Settings** > **Pages** (in the left sidebar).
4. Under **Build and deployment > Source**, select **GitHub Actions** from the dropdown menu (instead of "Deploy from a branch").
5. GitHub will now automatically run the workflow to compile Vite and deploy `dist/` directly to `https://iamguri30.github.io/`!

### Method 2: Manual deploy with `gh-pages`
If you prefer deploying via the `gh-pages` branch:
1. Run:
   ```bash
   npm run deploy
   ```
   (This builds the project with `npm run build` and pushes the `dist/` folder to a `gh-pages` branch on GitHub).
2. Go to repository **Settings** > **Pages**.
3. Under **Build and deployment > Source**, choose **Deploy from a branch**.
4. Select the **gh-pages** branch and `/ (root)` folder, then click **Save**.

---

## Cloudinary Image Upload Setup

Project images (thumbnails, cover images, and gallery artifacts) are uploaded through Cloudinary, and the resulting secure CDN URLs are stored directly in the Firestore database.

### Configuring Cloudinary Environment Variables

Add your Cloudinary credentials to your `.env` file or environment variables:

```bash
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

*(Alternatively, you can provide the single `CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"` string)*.

1. When you select an image file in the project editor, it uploads to Cloudinary via the server-side `/api/upload` endpoint.
2. Cloudinary returns a secure URL (e.g. `https://res.cloudinary.com/...`).
3. The project editor automatically sets the returned Cloudinary URL in the project form.
4. When you save the project, the Cloudinary URL is persisted directly into Firestore (`projects` collection: `thumbnailUrl`, `coverImageUrl`, and `galleryImages[].url`).
