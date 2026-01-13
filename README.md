# Plantify - AI Plant Identifier

Plantify is a modern web application that helps you identify plants and get care instructions instantly using Google Gemini AI.

## Features

- **Instant Identification**: Snap a photo or upload an image to identify any plant.
- **Health Diagnosis**: Detect diseases and get treatment recommendations.
- **My Collection**: Keep track of your plants and their growth.
- **AI Assistant**: Chat with 'Flora', your botanical expert.
- **AR Placement**: Visualize how plants look in your space.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up API Key:**
   Create a `.env.local` file and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Tech Stack

- **Framework**: React 19
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **AI Platform**: Google Gemini 2.5 Flash
- **Icons**: Lucide React & Google Material Symbols
