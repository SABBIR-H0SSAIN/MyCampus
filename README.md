# MyCampus

A unified web platform for university campus communities to find roommates, buy and sell used student items, organize emergency blood donation requests, share academic resources, and browse campus locations on an interactive map.

---

## Features

- **AI Campus Assistant**: Integrated chatbot powered by Gemini and Server-Sent Events (SSE) streaming. It queries database records across modules to answer student questions and link directly to relevant listings.
- **Interactive Map**: OpenStreetMap integration built with Leaflet and CARTO Voyager tiles. Displays color-coded markers for roommates, blood requests, marketplace items, and lost & found posts.
- **Roommate Finder**: Post and search roommate or flat listings near campus. Includes an AI compatibility check based on lifestyle preferences.
- **Blood Donation Network**: Post emergency blood requests with blood group, required units, hospital location, and urgency status.
- **Marketplace & Item Exchange**: Sell or trade used hostel furniture, electronics, and books with fellow students.
- **Academic Resources**: Share and download lecture notes, lab manuals, and previous exam question papers.
- **Lost & Found**: Report lost or found items with location details and photos.
- **Admin Portal**: Student verification queue (student ID card verification), content reporting, and campus announcements.

---

## Tech Stack

- **Backend**: Laravel 11, PHP 8.2+, Laravel Sanctum (API Token Auth)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **State & Data**: TanStack Query (React Query v5)
- **Map & Geocoding**: Leaflet (`react-leaflet`), OpenStreetMap, Nominatim
- **Database**: MySQL (SQLite used for automated tests)

---

## Getting Started

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js >= 18 and pnpm (or npm)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/SABBIR-H0SSAIN/MyCampus.git
   cd MyCampus
   ```

2. **Install dependencies**
   ```bash
   composer install
   pnpm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Update database settings in `.env`:
   ```env
   DB_CONNECTION=sqlite
   # Or MySQL:
   # DB_CONNECTION=mysql
   # DB_HOST=127.0.0.1
   # DB_PORT=3306
   # DB_DATABASE=mycampus
   # DB_USERNAME=root
   # DB_PASSWORD=

   # Gemini API key (optional for local mock)
   GEMINI_API_KEY=your_key_here
   ```

4. **Prepare Storage and Seed Database**
   ```bash
   php artisan storage:link
   php artisan migrate:fresh --seed
   ```

5. **Start Development Servers**

   Terminal 1 (Vite frontend):
   ```bash
   npm run dev
   ```

   Terminal 2 (Laravel backend):
   ```bash
   php artisan serve
   ```

   Visit `http://localhost:8000` in your browser.

---

## Demo Accounts

The database seeder creates default accounts for testing:

| Role | Email | Password |
|---|---|---|
| Student | `sabbir01619@gmail.com` | `password` |
| Test Student | `test.roommate@mycampus.test` | `password` |
| Admin | `admin@mycampus.test` | `password` |

---

## Testing

Run PHPUnit tests:

```bash
php artisan test
```

---

## License

This project is licensed under the [MIT License](LICENSE).
