# Pokédeckz — Pokémon TCG Catalog & Personal Collection Manager

> **Formal University Project Title:**  
> Pokédeckz – Aplikasi Katalog dan Manajemen Koleksi Pokémon Trading Card Game Berbasis Progressive Web Apps.  
> **Course:** Pengembangan dan Pemrograman Berbasis (PPB) — Ganjil 2026.

---

## 1. Project Overview & Description

**Pokédeckz** is a full-stack Progressive Web Application (PWA) designed for Pokémon Trading Card Game (TCG) enthusiasts and collectors. The application serves a dual purpose:

1. **Authentic Pokémon TCG Catalog:** An extensive card database powered by live data from **TCGdex**, allowing users to search, filter by rarity and sets, sort, and inspect genuine, officially released Pokémon cards with authentic illustrations, attacks, abilities, and card metadata.
2. **Personal Collection Management Platform:** A digital binder where registered collectors can track cards they own, record specific quantities and card conditions (Near Mint, Lightly Played, etc.), manage a personal wishlist, and monitor real-time collection statistics.

---

## 2. Project Objectives

- Provide a single, responsive platform that functions as both a trading card catalog and a personal digital binder.
- Satisfy all university academic requirements for PPB Ganjil 2026, including:
  - Custom REST API built with Node.js and Express.js.
  - Supabase PostgreSQL primary database with Row Level Security (RLS).
  - Supabase Auth for identity and access management.
  - Progressive Web Application (PWA) capabilities (offline support, Web App Manifest, Service Worker).
  - Responsive mobile-first design with a native-style Bottom Navigation Bar.
  - At least five distinct application views (Home, Catalog, Collection, Wishlist, Card Detail, Profile/About, Auth).
  - Strict authenticity rules (zero fictitious Pokémon or fabricated stats).

---

## 3. Technology Stack

| Layer | Technologies & Tools |
|---|---|
| **Frontend Platform** | React 18, Vite, JavaScript (ES Modules, JSX) |
| **Routing & Navigation** | React Router DOM v6 |
| **PWA & Offline** | `vite-plugin-pwa`, Service Worker (Workbox), Web App Manifest |
| **Icons & UI** | Lucide React Icons, Custom Responsive CSS with CSS Variables |
| **HTTP Client** | Axios (with token interception and error normalization) |
| **Backend API** | Node.js, Express.js (custom REST API web service) |
| **Database** | Supabase PostgreSQL (hosted relational database) |
| **Security & Auth** | Supabase Auth (JWT Bearer Token verification), Row Level Security (RLS) |
| **External TCG Data** | TCGdex REST API (`https://api.tcgdex.net/v2/en`) with in-memory caching |

---

## 4. Key Application Features

- **Genuine TCG Data:** Powered by the TCGdex REST API, fetching authentic cards, expansion sets, local numbers, attack stats, abilities, and high-resolution card artwork.
- **Global Search & Multi-Attribute Filters:** Filter cards across expansion sets, rarities (Common, Holo, Ultra Rare, Secret Rare), categories (Pokémon, Trainer, Energy), and sort by name or card number.
- **Personal Collection Binder:**
  - Add any card directly from the catalog.
  - Increment/decrement quantities owned.
  - Select card conditions: *Near Mint*, *Lightly Played*, *Moderately Played*, *Heavily Played*, *Damaged*.
  - Delete cards with confirmation dialogs.
- **Personal Wishlist:** Bookmark desired cards and transfer them directly into your collection once acquired.
- **Collection Statistics:** Real-time metrics for unique cards owned, total card count, and represented expansion sets.
- **PWA Capabilities:** Installable to mobile and desktop home screens, fast asset precaching, and custom offline fallback screen.
- **Poké Ball Visual Identity:** Clean black and white aesthetic with vivid red accents, subtle dark surfaces, smooth hover micro-animations, and mobile-friendly tap targets.

---

## 5. Application Page Structure

1. **Home Page (`/`)**: Main dashboard with hero branding, quick card search, featured authentic cards carousel, expansion sets grid, and real-time personal collection statistics.
2. **Card Catalog Page (`/catalog`)**: Browseable grid of authentic Pokémon cards with search, filter dropdowns (set, rarity, category), sorting, and multi-page pagination.
3. **My Collection Page (`/collection`)**: Authenticated personal binder view showing owned cards enriched with TCGdex artwork, condition badges, quantity steppers, and filters.
4. **Wishlist Page (`/wishlist`)**: Personal list of desired cards with one-click transfer to collection or quick removal.
5. **Card Detail Page (`/card/:id`)**: Full-page inspection of any card showing high-res artwork, HP, types, rarity, attacks, abilities, weakness/resistance, illustrator, and collection/wishlist action controls.
6. **Profile / About Page (`/profile`)**: User identity details, editable academic metadata (Student Name, NIM, Class for university examination), app architecture overview, TCGdex attribution, and logout.
7. **Login (`/login`) & Register (`/register`)**: Dedicated Supabase Auth onboarding with validation.

---

## 6. Project Directory Structure

```text
pokedeckz/
├── backend/
│   ├── config/
│   │   └── supabase.js             # Supabase client & token-scoped client helper
│   ├── controllers/
│   │   ├── cardController.js       # Handles card and set queries via TCGdex
│   │   ├── collectionController.js # Handles collection CRUD
│   │   ├── profileController.js    # Handles user profile retrieval & updates
│   │   └── wishlistController.js   # Handles wishlist additions & removals
│   ├── middleware/
│   │   └── auth.js                 # JWT Bearer token verification via Supabase
│   ├── routes/
│   │   ├── cardRoutes.js           # /api/cards endpoints
│   │   ├── collectionRoutes.js     # /api/collection endpoints (protected)
│   │   ├── profileRoutes.js        # /api/profile endpoints (protected)
│   │   ├── setRoutes.js            # /api/sets endpoints
│   │   └── wishlistRoutes.js       # /api/wishlist endpoints (protected)
│   ├── services/
│   │   ├── supabaseService.js      # PostgreSQL database queries under RLS
│   │   └── tcgdexService.js        # TCGdex integration with memory caching
│   ├── utils/
│   │   └── errorHandler.js         # Centralized error handler
│   ├── .env.example
│   ├── package.json
│   └── server.js                   # Express application entrypoint
│
├── database/
│   └── supabase-schema.sql         # SQL migration script for tables, triggers & RLS
│
├── frontend/
│   ├── public/
│   │   ├── icons/
│   │   │   ├── icon-192x192.svg    # PWA app icon (192x192)
│   │   │   └── icon-512x512.svg    # PWA app icon (512x512)
│   │   ├── favicon.svg             # Browser tab icon
│   │   └── offline.html            # PWA offline fallback page
│   ├── src/
│   │   ├── components/
│   │   │   ├── BottomNavigation.jsx# Mobile bottom navigation bar
│   │   │   ├── CardGrid.jsx        # Responsive card grid wrapper
│   │   │   ├── CollectionStats.jsx # Stats counter cards
│   │   │   ├── ConfirmDialog.jsx   # Deletion confirmation modal
│   │   │   ├── EmptyState.jsx      # Generic empty state UI
│   │   │   ├── FilterDropdown.jsx  # Reusable select dropdown
│   │   │   ├── LoadingSkeleton.jsx # Shimmer loading placeholder
│   │   │   ├── Navbar.jsx          # Top desktop navigation header
│   │   │   ├── PokemonCard.jsx     # Individual card card component
│   │   │   ├── ProtectedRoute.jsx  # Auth guard wrapper
│   │   │   ├── SearchBar.jsx       # Debounced search input
│   │   │   └── Toast.jsx           # Animated feedback toast
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # React context for Supabase auth state
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCollection.js
│   │   │   └── useWishlist.js
│   │   ├── pages/
│   │   │   ├── CardDetail.jsx
│   │   │   ├── Catalog.jsx
│   │   │   ├── Collection.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Wishlist.jsx
│   │   ├── services/
│   │   │   ├── api.js              # Axios service targeting Express backend
│   │   │   └── supabase.js         # Supabase client for authentication
│   │   ├── styles/
│   │   │   ├── auth.css
│   │   │   ├── components.css
│   │   │   ├── global.css
│   │   │   ├── pages.css
│   │   │   └── variables.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js              # Vite configuration with PWA plugin
│
├── .gitignore
└── README.md
```

---

## 7. Supabase Database & Authentication Setup

### Step 1: Create Supabase Project
1. Log in to [supabase.com](https://supabase.com/) and create a new project.
2. Note your **Project URL** and **API anon / public key** from `Project Settings` > `API`.

### Step 2: Run Database Initialization Script
1. Navigate to the **SQL Editor** tab in your Supabase Dashboard.
2. Open the file `database/supabase-schema.sql` from this repository.
3. Paste the entire SQL script and click **Run**.
4. This script creates:
   - `profiles` table (linked to `auth.users` with cascading deletion).
   - `collection_items` table with quantity & condition constraints.
   - `wishlist_items` table with unique user-card constraints.
   - Triggers for automatic `updated_at` management.
   - Database trigger `on_auth_user_created` to automatically initialize a profile upon user registration.
   - Row Level Security (RLS) policies enforcing that users can only select, insert, update, or delete their own rows.

---

## 8. Environment Variables Configuration

### Frontend (`frontend/.env`)
Create a file named `.env` inside the `frontend/` directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (`backend/.env`)
Create a file named `.env` inside the `backend/` directory:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

---

## 9. Installation & Running Locally

### Prerequisites
- Node.js version 18.0.0 or higher
- npm (Node Package Manager)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### Step 3: Run the Application
Open two separate terminal windows:

**Terminal 1 — Run Backend Server:**
```bash
cd backend
npm run dev
# The API will start on http://localhost:3001
```

**Terminal 2 — Run Frontend PWA:**
```bash
cd frontend
npm run dev
# The frontend development server will start on http://localhost:5173
```

Open your browser and navigate to `http://localhost:5173`.

---

## 10. Custom REST API Documentation

All protected endpoints require an `Authorization: Bearer <access_token>` header, verified against Supabase Auth.

### Health Check
- `GET /api/health` — Check backend status.

### Card Catalog (TCGdex)
- `GET /api/cards` — Retrieve paginated card listings.
  - Query parameters: `search`, `rarity`, `set`, `category`, `page`, `limit`, `sort`, `order`.
- `GET /api/cards/:id` — Retrieve comprehensive card metadata by card ID (e.g. `swsh3-136`).
- `GET /api/sets` — Retrieve expansion set listings.
- `GET /api/sets/:id` — Retrieve specific expansion set details.

### Personal Collection (Protected)
- `GET /api/collection` — Retrieve all cards in the authenticated user's collection.
- `POST /api/collection` — Add a card to the collection (`cardId`, `quantity`, `condition`).
- `PATCH /api/collection/:id` (or `PUT`) — Update card quantity or condition.
- `DELETE /api/collection/:id` — Remove card from collection.

### Wishlist (Protected)
- `GET /api/wishlist` — Retrieve user's wishlist cards.
- `POST /api/wishlist` — Add a card to user's wishlist (`cardId`).
- `DELETE /api/wishlist/:id` — Remove a card from the wishlist.

### User Profile (Protected)
- `GET /api/profile` — Get authenticated user's profile information.
- `PATCH /api/profile` (or `PUT`) — Update `full_name`, `username`, or `avatar_url`.

---

## 11. Progressive Web App (PWA) Features

- **Service Worker & Caching:** Configured using `vite-plugin-pwa` with Workbox.
  - **StaleWhileRevalidate** caching strategy for TCGdex card queries.
  - **CacheFirst** strategy for card artwork (`assets.tcgdex.net`).
  - Network-first strategy for dynamic user collection endpoints.
- **Offline Fallback:** When internet connectivity is lost, the application gracefully displays `public/offline.html` while preserving previously cached data.
- **Installability:** Meets all Chromium and WebKit criteria for "Add to Home Screen" installation on Android, iOS, Windows, and macOS.

---

## 12. Deployment Guide

### Frontend Deployment (Vercel / Netlify)
1. Push your repository to GitHub.
2. Link the repository to **Vercel** or **Netlify**.
3. Set the Root Directory to `frontend`.
4. Configure the Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_API_BASE_URL` (URL of your deployed backend)
5. Deploy.

### Backend Deployment (Render / Railway)
1. Link your repository to **Render** or **Railway**.
2. Set the Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure Environment Variables:
   - `PORT=3001` (or provider's default)
   - `FRONTEND_URL` (URL of your deployed frontend)
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
6. Deploy.

---

## 13. Academic Disclaimer & Attribution

> **Disclaimer:**  
> Pokédeckz is an unofficial, non-commercial fan-made student project developed for academic evaluation in the **PPB Ganjil 2026** course.  
> It is not affiliated with, endorsed by, or sponsored by Nintendo, Creatures Inc., GAME FREAK, or The Pokémon Company.  
> Pokémon names, trademarks, characters, and trading card artwork are the intellectual property of their respective owners.

> **Data Attribution:**  
> Card information, expansion set listings, and authentic trading card illustrations are provided by the [TCGdex](https://tcgdex.dev/) open-source API.
