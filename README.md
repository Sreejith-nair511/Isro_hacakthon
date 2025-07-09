<h1>Flood Detection Web App
</h1>
An advanced flood detection and visualization application built using **Next.js**, **TypeScript**, and **Tailwind CSS**. 
This app provides tools to analyze, overlay, and visualize flood-prone areas using custom map layers.

---

## 🚀 Features

- 🗺️ Map-based flood visualization
- 📦 API endpoints for flood detection
- 🇮🇳 India-specific flood mapping
- 🧠 Image overlay & analysis
- 🎨 Beautiful UI with Tailwind CSS
- ⚡ Fast and scalable with App Router and TypeScript

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm
- **APIs:** Integrated via `app/api/*` routes
- **Config:** PostCSS, Tailwind, tsconfig

---

## 📁 Folder Structure

flood-detection-app/
│
├── app/ # Next.js App directory
│ ├── api/ # API routes for flood data processing
│ ├── globals.css # Global CSS
│ ├── layout.tsx # Root layout
│ └── page.tsx # Home page
│
├── components/ # Reusable UI & visualization components
│
├── public/ # Static assets (if any)
│
├── package.json # Project dependencies
├── tailwind.config.ts # Tailwind config
├── tsconfig.json # TypeScript config
├── next.config.mjs # Next.js config
└── pnpm-lock.yaml # pnpm lock file



## 🧪 Local Development

### 1. Clone the repository


cd flood-detection-app

2. Install dependencies

pnpm install
3. Run the development server

pnpm dev
Then open http://localhost:3000 in your browser.

🧠 Key Components
map-visualization.tsx – Interactive flood map renderer

image-overlay.tsx – Overlay maps with flood images

flood-visualization.tsx – Main data visualization UI

api/detect-flood/ – Backend route for flood detection logic

📦 API Routes
POST /api/detect-flood – Analyze image for flood risk

POST /api/generate-flood-overlay – Generate overlay data

GET /api/download-flood-map – Download flood map

POST /api/detect-flood-india – Detect floods specific to India

📄 License
MIT

👨‍💻 Authors
Sreejith

Naresh

Rohan

Shreya

Bhuvan

