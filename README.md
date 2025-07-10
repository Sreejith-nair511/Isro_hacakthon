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

thesis and reference https://research.google/blog/a-flood-forecasting-ai-model-trained-and-evaluated-globally/
![image](https://github.com/user-attachments/assets/f4cf59e1-39bd-4705-94a0-b400ab7a160e)
![image](https://github.com/user-attachments/assets/c53184f5-a868-4a48-b827-7504bad751c2)
![image](https://github.com/user-attachments/assets/144e58d7-2c45-4689-af77-3052b8624cde)



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
<br>
│ ├── api/ # API routes for flood data processing
<br>
│ ├── globals.css # Global CSS
<br>
│ ├── layout.tsx # Root layout
<br>
│ └── page.tsx # Home page
<br>
│
├── components/ # Reusable UI & visualization components
<br>
│
├── public/ # Static assets (if any)
<br>
│
├── package.json # Project dependencies
<br>
├── tailwind.config.ts # Tailwind config
<br>
├── tsconfig.json # TypeScript config
<br>
├── next.config.mjs # Next.js config
<br>
└── pnpm-lock.yaml # pnpm lock file
<br>

![image](https://github.com/user-attachments/assets/5b3e54ec-2ac1-4ede-82f2-96803ec54ffe)
![image](https://github.com/user-attachments/assets/4c1054da-a0ea-45f0-8fac-5ba6a59f9601)





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

demo website https://minimal-flood-detection.vercel.app/
https://forest-fire-sim.vercel.app/
📄 License
MIT

👨‍💻 Authors<br>
Sreejith
<br>
rohith
