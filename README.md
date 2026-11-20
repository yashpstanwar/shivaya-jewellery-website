# SHIVAYA JEWELLERY

> Fine jewellery that becomes you · The Flora Collection 2026

An editorial luxury fine jewellery web experience combining smooth scrollytelling, HTML5 Canvas image sequence scrubbing, interactive 3D ring transitions, and modern e-commerce interactions.

---

## ✨ Features

- **Hero 3D Stage**: Looping 3D video sequence with seamless scroll-driven scale and crossfade handoff to canvas.
- **The Flora Ring Chapter**: Pinned canvas 3D rotation with dynamic callout cards and glowing SVG leader lines tracking ring facets.
- **Craftsmanship & Atelier**: Side-profile inspection highlighting bespoke goldsmithing benchmarks.
- **Exploded View ("Inside Flora")**: Interactive scroll-driven 3D disassembly of the ring into four constituent components (Centre stone, Halo petals, 18k mount, Pavé shank).
- **Interactive Ring Customizer**: Real-time alloy selector (Yellow gold, White gold, Rose gold) and size picker.
- **The Presentation Box Finale**: Scroll-controlled multi-phase sequence: ring box opening, velvet slot descent with optical glint, and box closure.
- **Full E-Commerce Suite**:
  - Filterable product catalogue with instant search.
  - Interactive Shopping Bag & Wishlist with local storage persistence.
  - Quick-view product modal with 1.9× cursor-following zoom lens.
  - Inertial smooth scrolling powered by Lenis and GSAP ScrollTrigger.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)

### Running Locally

Start the built-in HTTP server:

```bash
node tools/serve.mjs site 5533
```

Then open your browser at:

```
http://127.0.0.1:5533
```

---

## 📁 Project Structure

```
├── site/
│   ├── index.html        # Semantic HTML layout and drawer dialogs
│   ├── css/
│   │   ├── style.css     # Design tokens, typography, drawers, catalogue
│   │   └── journey.css   # Sticky chapter pins, canvas overlays, leader lines
│   ├── js/
│   │   ├── main.js       # Bag, wishlist, catalogue search, filters, modals
│   │   └── journey.js    # Scrollytelling engine and canvas frame renderer
│   ├── vendor/           # GSAP, ScrollTrigger, Lenis
│   └── assets/           # Video, images, and WebP frame sequences (turn & box)
├── tools/
│   └── serve.mjs         # Static HTTP server
└── README.md
```

---

## 📜 License

Created for SHIVAYA JEWELLERY. All rights reserved.
