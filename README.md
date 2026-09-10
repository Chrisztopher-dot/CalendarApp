# LifeAtlas | Personal Calendar & Lifestyle Organizer

A modern, lightweight personal organizer web app centered around a calendar with Swedish holidays and name days, 3×/day mood tracking, life domain goals, journaling, media uploads, and an interactive mood curve diagram.

Built with **React 18 + Vite + Tailwind CSS + Lucide Icons** with **zero backend complexity**. All user data is strictly partitioned in the client browser's `localStorage["organizerData_<email>"]`.

Ready for instant deployment on an **AWS EC2** instance (t3.micro / t4g.nano AWS Free Tier).

---

## Features

- **🇸🇪 Swedish Calendar**:
  - Month, Week, and Day views.
  - Complete Swedish Name Days (*Svenska Akademiens namnlängd*) for all 365 days.
  - Accurate calculation of Swedish Public Holidays (*Röda dagar*, Midsummer, Easter, Ascension, Christmas) and traditional Eves (*Aftnar*).
  - Color-coded event chips across 5 life domains.

- **📈 Interactive Mood Curve & Statistics**:
  - Smooth Bezier SVG curve visualizing good/bad days with gradient zones.
  - **Click any day on the curve** to slide open a deep-dive drawer showing linked moods, scheduled events, notes, goals, and photos for that day.
  - Life-domain balance meters & top energizing activities correlation.

- **☀️ Känsloregistrering (3× per dag)**:
  - Morning ☀️, Afternoon 🌤️, Evening 🌙 check-in slots.
  - 5 expressive smiley levels (😫 Terrible to 🤩 Awesome).
  - Multi-tag activity selector (*Workout, Friends, Food, Rest, Socialize, Work, Family, Outdoors, Reading, Gaming, Creative*).
  - Quick reflection notes and 7-day average metrics.

- **🎯 Goals & Milestones**:
  - Horizons: **Yearly**, **Monthly**, and **Weekly**.
  - Categorized across 5 Life Domains: **Work**, **Health**, **Activities**, **Hobbies**, **Production**.
  - Interactive progress sliders and completion checklists.

- **📂 Life Domains Hub**:
  - Dedicated views for **Work**, **Health**, **Activities**, **Hobbies**, and **Production**.
  - Aggregates all linked calendar events, active goals, notes, and photos per section.

- **📝 Notes & Journal**:
  - Markdown-friendly journal entries with section tags, date linking, and live search.

- **📸 Media Gallery**:
  - Photo upload with automatic client-side canvas compression (prevents `localStorage` overflow).
  - Lightbox viewer, download, and delete.

- **🔒 LocalStorage Partitioning & Demo Mode**:
  - Data stored in `localStorage["organizerData_<email>"]`.
  - 1-Click instant **Demo Mode** (`demo@organizer.app`) prefilled with rich realistic data.
  - Export and Import complete JSON data backups at any time.

---

## Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Production Build

```bash
npm run build
```

Build output is generated into the `dist/` directory (<100 KB gzipped).

---

## AWS EC2 Deployment

See the complete step-by-step guide in [deployment/AWS_DEPLOYMENT_GUIDE.md](deployment/AWS_DEPLOYMENT_GUIDE.md).

### Quick Docker Deployment on EC2:
```bash
cd deployment
docker compose up -d --build
```
Access at `http://<your-ec2-ip>` on Port 80!
