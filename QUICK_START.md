# Quick Start Manual - Chakra Art Industries

Welcome to the **Chakra Art Industries Showcase Website**. This guide will help you get the full-stack SQL application up and running locally in under 3 minutes.

---

## 🚀 3-Step Quick Start

### Step 1: Initialize the MySQL Database
Open your MySQL Command Line, Workbench, or phpMyAdmin, and run the following command to create the database:
```sql
CREATE DATABASE chakra_art;
```

### Step 2: Configure and Seed the Database
1. Open the **[.env](file:///d:/chakra/.env)** file.
2. Verify or update your password (we detected your MySQL password is **`root123`**, which is already configured for you):
   ```env
   DB_PASSWORD=root123
   ```
3. Open your terminal in `d:\chakra` and run the seeding script:
   ```bash
   npm run seed
   ```
   *This command creates all SQL tables, establishes associations, seeds initial categories, sizes, administrator accounts, and copies generated image assets to their target directories.*

### Step 3: Launch the Server
Start the development server with auto-reload:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your web browser.

---

## 🔐 Default Credentials
* **Admin Login URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
* **Username**: `admin`
* **Password**: `admin123`

---

## 🧪 Testing Checklist

### 1. Public Features
* [ ] **Home Page**: Scroll down to view the auto-sliding banners, category showcase links, and featured statues.
* [ ] **Filter Check**: Go to the *Statues & Products* page, type "Jesus" in the search bar, or filter using the *Categories* (e.g. Saints) and *Sizes* (e.g. 3ft) sidebar.
* [ ] **Details & Contact**: Click *View Details* on a statue. Test the *Send Inquiry on WhatsApp* button; it will launch WhatsApp with a prefilled message containing the statue name.
* [ ] **Gallery View**: Go to the *Gallery* page, hover over a restoration project, and click to view the photo in the custom lightbox modal.

### 2. Admin Features
* [ ] **Dashboard**: Navigate to [http://localhost:3000/admin/login](http://localhost:3000/admin/login), log in with the admin credentials, and view the statistics dashboard.
* [ ] **Add Product**: Go to *Products* -> *Add New Statue*. Enter details, select multiple height checkboxes, choose a file, and click publish. Verify that you see the upload preview thumbnail before submitting!
* [ ] **Edit/Delete**: Try editing or deleting a product. Check the `public/uploads/products/` folder to verify that deleted images are cleaned up from disk.
* [ ] **Manage Sizes/Categories**: Attempt to add a new category or size, and verify it updates immediately.

---

## 🛠️ Troubleshooting

### 1. "Access denied for user..." (Error 1045)
* Open `.env` and verify that `DB_USER` and `DB_PASSWORD` match your MySQL credentials.

### 2. "Unknown database..." (Error 1049)
* Make sure you executed `CREATE DATABASE chakra_art;` in your MySQL console before running the seed command.

### 3. Port 3000 Already in Use
* If you see `EADDRINUSE: address already in use :::3000`, it means a previous Node server is still running. Close your terminal windows or kill the process:
  * **On Windows PowerShell**: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force`
