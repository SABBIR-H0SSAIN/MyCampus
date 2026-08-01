<div align="center">
  <h1>MyCampus</h1>
  <p><strong>A Comprehensive Smart Campus Management & Student Collaboration Platform</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Laravel-11.x-FF2D20?style=flat-square&logo=laravel&logoColor=white" alt="Laravel 11" />
    <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Google_Gemini-API-8E75B2?style=flat-square&logo=googlegemini&logoColor=white" alt="Google Gemini API" />
    <img src="https://img.shields.io/badge/OpenStreetMap-API-7EBC6F?style=flat-square&logo=openstreetmap&logoColor=white" alt="OpenStreetMap API" />
  </p>
</div>

<br>

**MyCampus** is an all-in-one digital ecosystem built to simplify university life. From finding roommates and acquiring used textbooks to issuing emergency blood donation requests and exploring the campus via an interactive map, MyCampus brings the entire student community together onto one unified platform.

---

## Key Features

| Feature | Description | Highlights |
| :--- | :--- | :--- |
| **AI Campus Assistant** | Intelligent chatbot answering queries by indexing real-time campus data | Google Gemini API, SSE Streaming |
| **Interactive Campus Map** | Dynamic Leaflet map with interactive GPS location picker for all posts | OpenStreetMap, CARTO Voyager, Coordinate Geotagging |
| **Roommate Matchmaking** | Flat & roommate finder with AI compatibility matching | AI Scoring Engine, Habit Matching |
| **Emergency Blood Network** | Urgent campus blood request board with instant contact info | Real-Time Urgency Badges, Blood Group Filters |
| **Student Marketplace & Bids** | Peer-to-peer marketplace with interactive live bidding and price negotiation | Live Bidding Modal, Asking vs Top Bid Badges, Offer Acceptance |
| **Academic Resources Hub** | Collaborative repository for notes, manuals & question papers | Department, Semester & Type Filtering |
| **Lost & Found Portal** | Campus-wide lost & recovered item reporting with photo evidence | Geo-tagged Location, Item Status Tracking |
| **Student Registration Approval** | Multi-tier gatekeeping workflow requiring student ID photo verification before granting platform access | Admin Review Queue, Signed ID Card Viewing, Role Middleware |
| **Admin Moderation Suite** | Administrative moderation dashboard and campus-wide broadcasting | Moderation Tools, Broadcast Alerts |

---

## Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Backend** | Laravel 11, PHP 8.2+, Laravel Sanctum (API Token Auth) |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **AI Integration** | Google Gemini API (SSE Streaming Chatbot, Database Indexing & AI Compatibility Scoring) |
| **Mapping & Geocoding** | OpenStreetMap (Nominatim API), Leaflet (`react-leaflet`), CARTO Voyager |
| **State & Data** | TanStack Query (React Query v5) |
| **Database** | MySQL (SQLite supported for automated testing) |

---

## Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

Ensure you have the following installed:
- **PHP** (>= 8.2)
- **Composer**
- **Node.js** (>= 18) and **pnpm** (or npm)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/SABBIR-H0SSAIN/MyCampus.git
   cd MyCampus
   ```

2. **Install dependencies**
   Install both backend PHP packages and frontend JavaScript dependencies:
   ```bash
   composer install
   pnpm install
   ```

3. **Configure Environment**
   Duplicate the example environment file and generate your application key:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Update your database and API settings in the new `.env` file (set up MySQL database connection):
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=mycampus
   DB_USERNAME=root
   DB_PASSWORD=

   # Gemini API key for the AI Assistant (Optional for local mock)
   GEMINI_API_KEY=your_key_here
   ```

4. **Prepare Storage and Database**
   Link the storage directory for image uploads and run the migrations with seeders to populate dummy data:
   ```bash
   php artisan storage:link
   php artisan migrate:fresh --seed
   ```

5. **Start Development Servers**

   You will need two terminal instances to run the backend and frontend simultaneously.

   **Terminal 1 (Vite Frontend):**
   ```bash
   npm run dev
   ```

   **Terminal 2 (Laravel Backend):**
   ```bash
   php artisan serve
   ```

   Finally, open your browser and visit `http://localhost:8000` to see the application in action!

---

## Automated Testing

MyCampus features 42 automated tests covering student authentication, marketplace bidding, emergency requests, roommate matchmaking, admin workflows, and AI assistant streaming.

To run the complete test suite:

```bash
php artisan test
```

### Module Test Commands

| Module / Feature | Command | Tested Scenarios |
| :--- | :--- | :--- |
| **Auth & Registration Gate** | `php artisan test --filter=AuthTest` | Student registration, ID card approval gate, login/logout, Sanctum tokens |
| **Marketplace & Geotagging** | `php artisan test --filter=MarketplaceTest` | Item listing CRUD, GPS map coordinates, favorites, buyer purchase requests |
| **Live Bidding System** | `php artisan test --filter=MarketplaceBidTest` | Live bid placement, price increments, seller bid acceptance, bid withdrawals |
| **Roommate Matching** | `php artisan test --filter=RoommateTest` | Flat posts, location coordinates, roommate compatibility requests |
| **Blood Network** | `php artisan test --filter=BloodRequestTest` | Urgent blood requests, donor commits, status resolution to 'fulfilled' |
| **Product Exchange** | `php artisan test --filter=ExchangeTest` | Direct item-for-item exchange listings, swap offers, acceptances |
| **Lost & Found** | `php artisan test --filter=LostAndFoundTest` | Lost/found item posting, photo evidence, map location, item claiming |
| **Academic Hub** | `php artisan test --filter=ResourceTest` | Notes & question bank uploads, department/semester filters, deletion |
| **Admin Moderation** | `php artisan test --filter=AdminTest` | Dashboard analytics, student ID approval/rejection queue, campus broadcasts |
| **AI Assistant** | `php artisan test --filter=AiChatControllerTest` | Gemini API SSE streaming, campus database context retrieval, fallback |
| **Notifications & Search** | `php artisan test --filter=NotificationAndSearchTest` | Real-time in-app notification creation, global keyword search across modules |
| **Models & Scopes** | `php artisan test --filter=ModelTest` | Eloquent model relationships, role scopes, decimal GPS coordinates |

---

## License

This project is licensed under the [MIT License](LICENSE).
