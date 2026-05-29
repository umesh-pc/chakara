# Chakra Art Industries - Sacred Statues & Church Figure Showcase

A full-stack, responsive website for showcasing Christian holy statues, church figures, saints, and professional statue restoration/repainting works. Built with Node.js, Express.js, MySQL, and EJS templates, utilizing a clean Model-View-Controller (MVC) architecture and Sequelize ORM.

---

## Technical Stack
* **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5 (Responsive components)
* **Backend**: Node.js, Express.js
* **Database**: MySQL (Sequelize ORM)
* **Image Handling**: Multer (Local disk-storage validation and uploads)
* **Authentication**: Session-based auth using `express-session` & `bcryptjs`
* **Design Theme**: Classy Christian-themed aesthetic (marble white backgrounds, gilded gold frames/accents, deep burgundy buttons, and subtle micro-animations)

---

## Main Features
* **Auto-sliding Carousel**: Beautiful high-definition header banners showcasing marble carvings and restorations.
* **Product Catalog**: Complete showcase display (Jesus statues, Mary statues, Saints, Repainting).
* **Advanced Filters**: Seamless frontend filtering by name search, category categories, and height measurements.
* **Dynamic Sizes**: Heights are fully dynamic (e.g. 1.5ft, 2ft, 3ft, etc.). The Admin can add, edit, or remove sizes.
* **No Prices Displayed**: To encourage inquiries, price tags are hidden. Each product details page contains direct phone call and pre-filled WhatsApp inquiry triggers.
* **Interactive Gallery**: Showcase of cathedral installations and before-after restorations with a custom client-side image lightbox modal.
* **Secure Admin Dashboard**: Full CRUD management of statues, categories, sizes, and restoration photos, including automated disk cleanups of uploaded images upon product deletion.
* **WhatsApp Form Bridge**: Fully custom contact page form that packages customer name, email, and description into a WhatsApp chat redirect URL.

---

## Folder Architecture
```
chakra/
├── config/              # SQL Connection setup
├── controllers/         # Request handling logic (Home & Admin controls)
├── middleware/          # Protected session hooks and Multer upload rules
├── models/              # Sequelize database schemas & relations
├── public/              # Static files served by Express
│   ├── css/             # Stylesheets (style.css & admin.css)
│   ├── js/              # Client-side scripts (main.js & admin.js)
│   ├── images/          # Core theme assets & hero sliding banners
│   └── uploads/         # Destination for product & gallery images
├── routes/              # Routing endpoints (front-end & admin dashboards)
├── views/               # EJS template engine files
│   ├── admin/           # Dashboard views
│   └── frontend/        # Public facing views
├── .env                 # Port, connection strings, contact variables
├── package.json         # Node dependency bindings
├── seed.js              # Database seed script
└── server.js            # App launcher & Express bindings
```

---

## Setup Instructions

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [MySQL Server](https://dev.mysql.com/downloads/mysql/) running locally on port `3306`

### 2. Configuration
Create a database named `chakra_art` in your MySQL server:
```sql
CREATE DATABASE chakra_art;
```
Configure your credentials in the `.env` file in the root directory:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=chakra_art
SESSION_SECRET=chakra_art_secret_key_2026
CONTACT_WHATSAPP=919446577541
CONTACT_PHONE=+91 94465 77541
CONTACT_EMAIL=info@chakraart.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 3. Installation & Seeding
Install dependencies and run the seeding script to compile SQL tables, map relations, and copy generated assets:
```bash
npm install
npm run seed
```

### 4. Running the Application
To run the server in development mode (using `nodemon`):
```bash
npm run dev
```
To run the server in standard production mode:
```bash
npm start
```
The application will launch and be available on [http://localhost:3000](http://localhost:3000).

---

## Admin Portal Login Credentials
Access the admin portal by clicking the **Admin Portal** link in the website footer or by visiting [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
* **Username**: `admin`
* **Password**: `admin123`

---

## SEO & Accessibility Optimization
* **Structured Semantic Tags**: Clear page flows with a single page title `<h1>` per view.
* **Auto-generated SEO Slugs**: Categories and Products automatically generate lowercased, clean SEO URLs (e.g. `/product/sacred-heart-of-jesus-marble-statue`).
* **Optimized Image Loading**: Built-in lazy loading and custom page loader to ensure high performance scores.
