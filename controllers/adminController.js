const { Admin, Product, Category, Size, Gallery, Restoration, Setting } = require('../models');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper to follow Map Short Link redirect
const followMapRedirect = (url) => {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(res.headers.location);
      } else {
        resolve(url);
      }
    }).on('error', () => {
      resolve(url);
    });
  });
};

// Helper to convert short/long Maps URL into iframe-compatible Embed Link
const convertToMapEmbedUrl = async (url) => {
  if (!url || url.trim() === '') return '';
  let resolvedUrl = url.trim();

  // Follow redirect if short link
  if (resolvedUrl.includes('maps.app.goo.gl') || resolvedUrl.includes('goo.gl/maps')) {
    resolvedUrl = await followMapRedirect(resolvedUrl);
  }

  // Already an embed format
  if (resolvedUrl.includes('output=embed') || resolvedUrl.includes('/embed') || resolvedUrl.includes('pb=')) {
    return resolvedUrl;
  }

  // Parse place name or coordinates
  let query = '';
  const placeMatch = resolvedUrl.match(/\/maps\/place\/([^\/]+)/);
  if (placeMatch && placeMatch[1]) {
    query = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
  } else {
    const coordMatch = resolvedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch && coordMatch[1] && coordMatch[2]) {
      query = `${coordMatch[1]},${coordMatch[2]}`;
    }
  }

  // Fallback to text query
  if (!query) {
    query = resolvedUrl;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};

// Helper to delete local file safely
const deleteFileSafe = (relativeFilePath) => {
  try {
    const absolutePath = path.join(__dirname, '..', 'public', relativeFilePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  } catch (err) {
    console.error(`Failed to delete file: ${relativeFilePath}`, err.message);
  }
};

// GET Login Page
exports.getLogin = (req, res) => {
  res.render('admin/login', { 
    error: req.query.error || null,
    success: req.query.success || null
  });
};

// POST Login Authentication
exports.postLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.redirect('/admin/login?error=Please fill in all fields');
    }

    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.redirect('/admin/login?error=Invalid username or password');
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.redirect('/admin/login?error=Invalid username or password');
    }

    // Set session
    req.session.adminId = admin.id;
    req.session.username = admin.username;

    res.redirect('/admin/dashboard');
  } catch (error) {
    next(error);
  }
};

// GET Logout
exports.getLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/admin/login?success=Logged out successfully');
  });
};

// GET Dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const productCount = await Product.count();
    const categoryCount = await Category.count();
    const sizeCount = await Size.count();
    const galleryCount = await Gallery.count();
    const restorationCount = await Restoration.count();

    const recentProducts = await Product.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Size, as: 'size' }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.render('admin/dashboard', {
      username: req.session.username,
      productCount,
      categoryCount,
      sizeCount,
      galleryCount,
      restorationCount,
      recentProducts,
      page: 'dashboard'
    });
  } catch (error) {
    next(error);
  }
};

// GET Product list
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Size, as: 'size' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.render('admin/products', {
      username: req.session.username,
      products,
      page: 'products',
      error: req.query.error || null
    });
  } catch (error) {
    next(error);
  }
};

// GET Add Product Form
exports.getAddProduct = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    const sizes = await Size.findAll({ order: [['value', 'ASC']] });

    res.render('admin/product-form', {
      username: req.session.username,
      categories,
      sizes,
      product: null,
      page: 'products',
      error: req.query.error || null
    });
  } catch (error) {
    next(error);
  }
};

// POST Add Product Handler
exports.postAddProduct = async (req, res, next) => {
  try {
    const { productName, description, category, size, featured } = req.body;
    
    // Check if images are uploaded
    if (!req.files || req.files.length === 0) {
      return res.redirect('/admin/products/new?error=Please upload at least one image');
    }

    const imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);

    // Create product
    const product = await Product.create({
      productName,
      description,
      categoryId: category, // maps to foreignKey
      images: imagePaths,
      featured: featured === 'true' || featured === 'on'
    });

    // Associate many-to-many sizes
    if (size) {
      const sizeIds = Array.isArray(size) ? size : [size];
      await product.setSize(sizeIds);
    }

    res.redirect('/admin/products');
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => deleteFileSafe(`/uploads/products/${file.filename}`));
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path || 'name';
      return res.redirect(`/admin/products/new?error=A statue with this ${field} already exists. Please choose a unique name.`);
    }
    if (error.name === 'SequelizeValidationError') {
      return res.redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

// GET Edit Product Form
exports.getEditProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id, {
      include: [{ model: Size, as: 'size' }]
    });

    if (!product) {
      return res.redirect('/admin/products?error=Product not found');
    }

    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    const sizes = await Size.findAll({ order: [['value', 'ASC']] });

    res.render('admin/product-form', {
      username: req.session.username,
      categories,
      sizes,
      product,
      page: 'products',
      error: req.query.error || null
    });
  } catch (error) {
    next(error);
  }
};

// POST Edit Product Handler
exports.postEditProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productName, description, category, size, featured } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.redirect('/admin/products?error=Product not found');
    }

    let imagePaths = product.images;

    // If new files are uploaded, replace current images
    if (req.files && req.files.length > 0) {
      // Delete old images from disk
      product.images.forEach(img => deleteFileSafe(img));
      imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
    }

    product.productName = productName;
    product.description = description;
    product.categoryId = category;
    product.images = imagePaths;
    product.featured = featured === 'true' || featured === 'on';

    await product.save();

    // Update many-to-many size associations
    const sizeIds = size ? (Array.isArray(size) ? size : [size]) : [];
    await product.setSize(sizeIds);

    res.redirect('/admin/products');
  } catch (error) {
    if (req.files) {
      req.files.forEach(file => deleteFileSafe(`/uploads/products/${file.filename}`));
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.redirect(`/admin/products/edit/${id}?error=A statue with this name already exists. Please choose a unique name.`);
    }
    if (error.name === 'SequelizeValidationError') {
      return res.redirect(`/admin/products/edit/${id}?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

// POST Delete Product
exports.postDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.redirect('/admin/products?error=Product not found');
    }

    // Delete associated images from disk
    product.images.forEach(img => deleteFileSafe(img));

    // Delete product record (Cascade deletes the association table entry)
    await product.destroy();
    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
};

// POST Toggle Featured
exports.postToggleFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.redirect('/admin/products?error=Product not found');
    }
    product.featured = !product.featured;
    await product.save();
    res.redirect('/admin/products');
  } catch (error) {
    next(error);
  }
};

// GET Categories Manager
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.render('admin/categories', {
      username: req.session.username,
      categories,
      page: 'categories',
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    next(error);
  }
};

// POST Add Category
exports.postAddCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || name.trim() === '') {
      return res.redirect('/admin/categories?error=Category name is required');
    }

    // Check duplicate
    const existing = await Category.findOne({ where: { name: name.trim() } });
    if (existing) {
      return res.redirect('/admin/categories?error=Category already exists');
    }

    await Category.create({ name: name.trim(), description });
    res.redirect('/admin/categories?success=Category added successfully');
  } catch (error) {
    next(error);
  }
};

// POST Delete Category
exports.postDeleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category is used in products
    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.redirect(`/admin/categories?error=Cannot delete category: ${productCount} product(s) are currently assigned to it.`);
    }

    await Category.destroy({ where: { id } });
    res.redirect('/admin/categories?success=Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

// GET Sizes Manager
exports.getSizes = async (req, res, next) => {
  try {
    const sizes = await Size.findAll({ order: [['value', 'ASC']] });
    res.render('admin/sizes', {
      username: req.session.username,
      sizes,
      page: 'sizes',
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    next(error);
  }
};

// POST Add Size
exports.postAddSize = async (req, res, next) => {
  try {
    const { value, description } = req.body;
    if (!value || value.trim() === '') {
      return res.redirect('/admin/sizes?error=Size value is required');
    }

    const existing = await Size.findOne({ where: { value: value.trim() } });
    if (existing) {
      return res.redirect('/admin/sizes?error=Size value already exists');
    }

    await Size.create({ value: value.trim(), description });
    res.redirect('/admin/sizes?success=Size added successfully');
  } catch (error) {
    next(error);
  }
};

// POST Delete Size
exports.postDeleteSize = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if size is used in products (fetch size with associated products using junction model count check)
    const sz = await Size.findByPk(id, {
      include: [{ model: Product, as: 'product' }]
    });

    if (sz && sz.product && sz.product.length > 0) {
      return res.redirect(`/admin/sizes?error=Cannot delete size: ${sz.product.length} product(s) are currently available in this size.`);
    }

    await Size.destroy({ where: { id } });
    res.redirect('/admin/sizes?success=Size deleted successfully');
  } catch (error) {
    next(error);
  }
};

// GET Gallery Manager
exports.getGallery = async (req, res, next) => {
  try {
    const galleryItems = await Gallery.findAll({ order: [['createdAt', 'DESC']] });
    res.render('admin/gallery', {
      username: req.session.username,
      galleryItems,
      page: 'gallery',
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    next(error);
  }
};

// POST Add Gallery Image
exports.postAddGallery = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!req.file) {
      return res.redirect('/admin/gallery?error=Please select an image file');
    }

    const imagePath = `/uploads/gallery/${req.file.filename}`;

    await Gallery.create({
      imagePath,
      title,
      description
    });

    res.redirect('/admin/gallery?success=Gallery image uploaded successfully');
  } catch (error) {
    if (req.file) {
      deleteFileSafe(`/uploads/gallery/${req.file.filename}`);
    }
    next(error);
  }
};

// POST Delete Gallery Image
exports.postDeleteGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const galleryItem = await Gallery.findByPk(id);
    if (!galleryItem) {
      return res.redirect('/admin/gallery?error=Gallery item not found');
    }

    // Delete image from disk
    deleteFileSafe(galleryItem.imagePath);

    // Delete record from DB
    await galleryItem.destroy();
    res.redirect('/admin/gallery?success=Gallery item deleted successfully');
  } catch (error) {
    next(error);
  }
};

// GET Restorations List
exports.getRestorations = async (req, res, next) => {
  try {
    const restorations = await Restoration.findAll({ order: [['createdAt', 'DESC']] });
    res.render('admin/restorations', {
      username: req.session.username,
      restorations,
      page: 'restorations',
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    next(error);
  }
};

// GET Add Restoration Form
exports.getAddRestoration = (req, res) => {
  res.render('admin/restoration-form', {
    username: req.session.username,
    restoration: null,
    page: 'restorations',
    error: req.query.error || null
  });
};

// POST Add Restoration Handler
exports.postAddRestoration = async (req, res, next) => {
  try {
    const { title, description, featured } = req.body;

    if (!req.files || !req.files['imageBefore'] || !req.files['imageAfter']) {
      return res.redirect('/admin/restorations/new?error=Please upload both Before and After images');
    }

    const imageBeforePath = `/uploads/restorations/${req.files['imageBefore'][0].filename}`;
    const imageAfterPath = `/uploads/restorations/${req.files['imageAfter'][0].filename}`;

    await Restoration.create({
      title,
      description,
      imageBefore: imageBeforePath,
      imageAfter: imageAfterPath,
      featured: featured === 'true' || featured === 'on'
    });

    res.redirect('/admin/restorations?success=Restoration project added successfully');
  } catch (error) {
    if (req.files) {
      if (req.files['imageBefore']) deleteFileSafe(`/uploads/restorations/${req.files['imageBefore'][0].filename}`);
      if (req.files['imageAfter']) deleteFileSafe(`/uploads/restorations/${req.files['imageAfter'][0].filename}`);
    }
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.redirect(`/admin/restorations/new?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

// GET Edit Restoration Form
exports.getEditRestoration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restoration = await Restoration.findByPk(id);
    if (!restoration) {
      return res.redirect('/admin/restorations?error=Restoration not found');
    }
    res.render('admin/restoration-form', {
      username: req.session.username,
      restoration,
      page: 'restorations',
      error: req.query.error || null
    });
  } catch (error) {
    next(error);
  }
};

// POST Edit Restoration Handler
exports.postEditRestoration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, featured } = req.body;

    const restoration = await Restoration.findByPk(id);
    if (!restoration) {
      return res.redirect('/admin/restorations?error=Restoration not found');
    }

    let imageBeforePath = restoration.imageBefore;
    let imageAfterPath = restoration.imageAfter;

    if (req.files) {
      if (req.files['imageBefore'] && req.files['imageBefore'].length > 0) {
        deleteFileSafe(restoration.imageBefore);
        imageBeforePath = `/uploads/restorations/${req.files['imageBefore'][0].filename}`;
      }
      if (req.files['imageAfter'] && req.files['imageAfter'].length > 0) {
        deleteFileSafe(restoration.imageAfter);
        imageAfterPath = `/uploads/restorations/${req.files['imageAfter'][0].filename}`;
      }
    }

    restoration.title = title;
    restoration.description = description;
    restoration.imageBefore = imageBeforePath;
    restoration.imageAfter = imageAfterPath;
    restoration.featured = featured === 'true' || featured === 'on';

    await restoration.save();
    res.redirect('/admin/restorations?success=Restoration project updated successfully');
  } catch (error) {
    if (req.files) {
      if (req.files['imageBefore']) deleteFileSafe(`/uploads/restorations/${req.files['imageBefore'][0].filename}`);
      if (req.files['imageAfter']) deleteFileSafe(`/uploads/restorations/${req.files['imageAfter'][0].filename}`);
    }
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      return res.redirect(`/admin/restorations/edit/${id}?error=${encodeURIComponent(error.message)}`);
    }
    next(error);
  }
};

// POST Delete Restoration
exports.postDeleteRestoration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const restoration = await Restoration.findByPk(id);
    if (!restoration) {
      return res.redirect('/admin/restorations?error=Restoration not found');
    }

    deleteFileSafe(restoration.imageBefore);
    deleteFileSafe(restoration.imageAfter);

    await restoration.destroy();
    res.redirect('/admin/restorations?success=Restoration project deleted successfully');
  } catch (error) {
    next(error);
  }
};

// GET Settings Panel
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findByPk(1);
    if (!settings) {
      settings = await Setting.create({
        whatsappNum: process.env.CONTACT_WHATSAPP || '919446577541',
        phoneNum: process.env.CONTACT_PHONE || '+91 94465 77541',
        emailAddr: process.env.CONTACT_EMAIL || 'info@chakraart.com',
        address: 'Chakra Art Industries, Statue Street, Divine Nagar, Thrissur, Kerala - 680001',
        openingTime: '9:00 AM',
        closingTime: '6:00 PM',
        workingDays: 'Mon - Sat',
        mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125528.29340625345!2d76.13611893888358!3d10.519847116744888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d3926.3533479006093!2d76.2238478!3d10.5198471!5e0!3m2!1sen!2sin!4v1716912345678!5m2!1sen!2sin'
      });
    }
    res.render('admin/settings', {
      username: req.session.username,
      settings,
      page: 'settings',
      error: req.query.error || null,
      success: req.query.success || null
    });
  } catch (error) {
    next(error);
  }
};

// POST Update Settings
exports.postUpdateSettings = async (req, res, next) => {
  try {
    const { whatsappNum, phoneNum, emailAddr, address, openingTime, closingTime, workingDays, mapEmbedUrl } = req.body;
    
    let settings = await Setting.findByPk(1);
    if (!settings) {
      settings = new Setting({ id: 1 });
    }

    // Convert map URL to iframe-embed format if needed
    const parsedMapUrl = await convertToMapEmbedUrl(mapEmbedUrl);

    settings.whatsappNum = whatsappNum;
    settings.phoneNum = phoneNum;
    settings.emailAddr = emailAddr;
    settings.address = address;
    settings.openingTime = openingTime;
    settings.closingTime = closingTime;
    settings.workingDays = workingDays;
    settings.mapEmbedUrl = parsedMapUrl;

    await settings.save();
    res.redirect('/admin/settings?success=Settings updated successfully');
  } catch (error) {
    next(error);
  }
};
