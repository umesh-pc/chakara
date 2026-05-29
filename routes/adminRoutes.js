const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAuthenticated, forwardAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/upload');

// --- Authentication Routes ---
router.get('/login', forwardAuthenticated, adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.getLogout);

// --- Protected Dashboard ---
router.get('/dashboard', ensureAuthenticated, adminController.getDashboard);

// --- Product Management CRUD ---
router.get('/products', ensureAuthenticated, adminController.getProducts);
router.get('/products/new', ensureAuthenticated, adminController.getAddProduct);
router.post('/products/new', ensureAuthenticated, upload.array('images', 5), adminController.postAddProduct);
router.get('/products/edit/:id', ensureAuthenticated, adminController.getEditProduct);
router.post('/products/edit/:id', ensureAuthenticated, upload.array('images', 5), adminController.postEditProduct);
router.post('/products/delete/:id', ensureAuthenticated, adminController.postDeleteProduct);
router.post('/products/toggle-featured/:id', ensureAuthenticated, adminController.postToggleFeatured);

// --- Category Management ---
router.get('/categories', ensureAuthenticated, adminController.getCategories);
router.post('/categories', ensureAuthenticated, adminController.postAddCategory);
router.post('/categories/delete/:id', ensureAuthenticated, adminController.postDeleteCategory);

// --- Size Management ---
router.get('/sizes', ensureAuthenticated, adminController.getSizes);
router.post('/sizes', ensureAuthenticated, adminController.postAddSize);
router.post('/sizes/delete/:id', ensureAuthenticated, adminController.postDeleteSize);

// --- Gallery Management ---
router.get('/gallery', ensureAuthenticated, adminController.getGallery);
router.post('/gallery', ensureAuthenticated, upload.single('image'), adminController.postAddGallery);
router.post('/gallery/delete/:id', ensureAuthenticated, adminController.postDeleteGallery);

// --- Restoration Management ---
router.get('/restorations', ensureAuthenticated, adminController.getRestorations);
router.get('/restorations/new', ensureAuthenticated, adminController.getAddRestoration);
router.post('/restorations/new', ensureAuthenticated, upload.fields([{ name: 'imageBefore', maxCount: 1 }, { name: 'imageAfter', maxCount: 1 }]), adminController.postAddRestoration);
router.get('/restorations/edit/:id', ensureAuthenticated, adminController.getEditRestoration);
router.post('/restorations/edit/:id', ensureAuthenticated, upload.fields([{ name: 'imageBefore', maxCount: 1 }, { name: 'imageAfter', maxCount: 1 }]), adminController.postEditRestoration);
// --- Settings Management ---
router.get('/settings', ensureAuthenticated, adminController.getSettings);
router.post('/settings', ensureAuthenticated, adminController.postUpdateSettings);

module.exports = router;
