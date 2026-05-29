const { Op } = require('sequelize');
const { Product, Category, Size, Gallery, Restoration } = require('../models');

// SEO helper
const getMeta = (title, description) => ({
  title: `${title} | Chakra Art Industries`,
  description: description || "Chakra Art Industries specializes in high-quality Christian holy statues, church figures, and meticulous statue repainting services."
});

exports.getIndex = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    const featuredProducts = await Product.findAll({
      where: { featured: true },
      include: [
        { model: Category, as: 'category' },
        { model: Size, as: 'size' }
      ],
      limit: 6,
      order: [['createdAt', 'DESC']]
    });

    res.render('frontend/index', {
      meta: getMeta("Premium Christian Holy Statues & Church Figures", "Showcase of exquisite Christian statues, church figures, saints statues, and professional repainting works by Chakra Art Industries."),
      categories,
      featuredProducts,
      whatsappNumber: process.env.CONTACT_WHATSAPP,
      phoneNumber: process.env.CONTACT_PHONE
    });
  } catch (error) {
    next(error);
  }
};

exports.getAbout = (req, res) => {
  res.render('frontend/about', {
    meta: getMeta("About Us", "Learn about the heritage, craftsmanship, and dedication behind Chakra Art Industries' sacred statuary and church restorations.")
  });
};

exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, size } = req.query;
    
    // Fetch all categories and sizes for sidebars
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    const sizes = await Size.findAll({ order: [['value', 'ASC']] });

    // Build SQL Where Clauses
    let whereClause = {};

    // Search by Name (SQL LIKE)
    if (search && search.trim() !== '') {
      whereClause.productName = { [Op.like]: `%${search.trim()}%` };
    }

    // Category filter by Slug
    let activeCategory = null;
    if (category && category !== '') {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) {
        whereClause.categoryId = cat.id;
        activeCategory = cat;
      }
    }

    // Base joins
    let includeModels = [
      { model: Category, as: 'category' },
      { model: Size, as: 'size' }
    ];

    // Size filter by Value
    let activeSize = null;
    if (size && size !== '') {
      const sz = await Size.findOne({ where: { value: size } });
      if (sz) {
        activeSize = sz;
        // Restrict relation join to filter products having this size
        includeModels[1] = {
          model: Size,
          as: 'size',
          where: { value: size },
          required: true // Forces INNER JOIN to filter by size
        };
      }
    }

    // Fetch matching products
    const products = await Product.findAll({
      where: whereClause,
      include: includeModels,
      order: [['createdAt', 'DESC']]
    });

    res.render('frontend/products', {
      meta: getMeta("Our Statue Collections", "Browse our collection of Jesus statues, Mother Mary statues, saints, and restoration works."),
      products,
      categories,
      sizes,
      search: search || '',
      categoryFilter: category || '',
      sizeFilter: size || '',
      activeCategory,
      activeSize,
      whatsappNumber: process.env.CONTACT_WHATSAPP,
      phoneNumber: process.env.CONTACT_PHONE
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductDetails = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({
      where: { slug },
      include: [
        { model: Category, as: 'category' },
        { model: Size, as: 'size' }
      ]
    });

    if (!product) {
      return res.status(404).render('frontend/404', {
        meta: getMeta("Page Not Found", "The statue or page you are looking for could not be found.")
      });
    }

    // Fetch related products in the same category
    const relatedProducts = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        id: { [Op.ne]: product.id }
      },
      include: [
        { model: Category, as: 'category' },
        { model: Size, as: 'size' }
      ],
      limit: 4,
      order: [['createdAt', 'DESC']]
    });

    res.render('frontend/product-details', {
      meta: getMeta(product.productName, product.description.substring(0, 155)),
      product,
      relatedProducts,
      whatsappNumber: process.env.CONTACT_WHATSAPP,
      phoneNumber: process.env.CONTACT_PHONE
    });
  } catch (error) {
    next(error);
  }
};

exports.getGallery = async (req, res, next) => {
  try {
    const galleryItems = await Gallery.findAll({ order: [['createdAt', 'DESC']] });
    res.render('frontend/gallery', {
      meta: getMeta("Gallery & Work Showcase", "Take a visual journey through our church restorations, custom carvings, and statue repainting projects."),
      galleryItems
    });
  } catch (error) {
    next(error);
  }
};

exports.getContact = (req, res) => {
  res.render('frontend/contact', {
    meta: getMeta("Contact Us", "Get in touch with Chakra Art Industries for statue inquiries, customized church figures, and repainting quotes."),
    whatsappNumber: process.env.CONTACT_WHATSAPP,
    phoneNumber: process.env.CONTACT_PHONE,
    emailAddress: process.env.CONTACT_EMAIL
  });
};

exports.getRestorations = async (req, res, next) => {
  try {
    const restorations = await Restoration.findAll({ order: [['createdAt', 'DESC']] });
    res.render('frontend/restorations', {
      meta: getMeta("Restoration Showcase", "View the transformation of vintage and weathered church statues with our professional before-and-after repainting works."),
      restorations
    });
  } catch (error) {
    next(error);
  }
};
