const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Homepage
router.get('/', homeController.getIndex);

// About Us
router.get('/about', homeController.getAbout);

// Product Catalog
router.get('/products', homeController.getProducts);

// Product Details (using SEO friendly URL slugs)
router.get('/product/:slug', homeController.getProductDetails);

// Work Showcase / Gallery
router.get('/gallery', homeController.getGallery);

// Restored Statues (Before & After) Showcase
router.get('/restorations', homeController.getRestorations);

// Contact Info
router.get('/contact', homeController.getContact);

module.exports = router;
