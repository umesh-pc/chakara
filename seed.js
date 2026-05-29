const { sequelize, Admin, Category, Size, Product, Gallery, Restoration, Setting } = require('./models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load Env
dotenv.config();

// Direct paths to generated images in the brain folder
const generatedImages = {
  jesus: 'C:\\Users\\umesh\\.gemini\\antigravity-ide\\brain\\6786fd70-cde4-4fdd-a5c6-5b328480ffcd\\hero_jesus_statue_1779984088792.png',
  mary: 'C:\\Users\\umesh\\.gemini\\antigravity-ide\\brain\\6786fd70-cde4-4fdd-a5c6-5b328480ffcd\\hero_mary_statue_1779984113302.png',
  joseph: 'C:\\Users\\umesh\\.gemini\\antigravity-ide\\brain\\6786fd70-cde4-4fdd-a5c6-5b328480ffcd\\saint_joseph_statue_1779984134882.png',
  repainting: 'C:\\Users\\umesh\\.gemini\\antigravity-ide\\brain\\6786fd70-cde4-4fdd-a5c6-5b328480ffcd\\statue_repainting_work_1779984152370.png'
};

const base64Fallback = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const copyOrWriteFallback = (src, dest) => {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Successfully copied image to: ${dest}`);
    } else {
      fs.writeFileSync(dest, Buffer.from(base64Fallback, 'base64'));
      console.log(`Source image not found. Wrote fallback image to: ${dest}`);
    }
  } catch (err) {
    console.error(`Error copying image to ${dest}:`, err.message);
  }
};

const runSeed = async () => {
  try {
    // 1. Connect & Re-create SQL Tables
    console.log('Synchronizing database schema (dropping and recreating tables)...');
    await sequelize.sync({ force: true });
    console.log('Tables synced.');

    // 2. Set up assets folders & Copy generated assets
    console.log('Moving generated image assets to public folders...');
    
    // Core theme assets
    copyOrWriteFallback(generatedImages.jesus, 'public/images/hero_jesus_statue.png');
    copyOrWriteFallback(generatedImages.mary, 'public/images/hero_mary_statue.png');
    copyOrWriteFallback(generatedImages.joseph, 'public/images/saint_joseph_statue.png');
    copyOrWriteFallback(generatedImages.repainting, 'public/images/statue_repainting_work.png');
    
    // Product Upload directories targets
    copyOrWriteFallback(generatedImages.jesus, 'public/uploads/products/jesus_sacred_heart.png');
    copyOrWriteFallback(generatedImages.mary, 'public/uploads/products/mary_immaculate.png');
    copyOrWriteFallback(generatedImages.joseph, 'public/uploads/products/saint_joseph_baby.png');
    copyOrWriteFallback(generatedImages.repainting, 'public/uploads/products/cathedral_repainting.png');
    
    // Gallery target
    copyOrWriteFallback(generatedImages.repainting, 'public/uploads/gallery/altar_restoration.png');
    copyOrWriteFallback(generatedImages.jesus, 'public/uploads/gallery/cathedral_install.png');

    // Restorations target
    copyOrWriteFallback(generatedImages.repainting, 'public/uploads/restorations/antique_wood_before.png');
    copyOrWriteFallback(generatedImages.jesus, 'public/uploads/restorations/antique_wood_after.png');
    copyOrWriteFallback(generatedImages.joseph, 'public/uploads/restorations/saint_joseph_before.png');
    copyOrWriteFallback(generatedImages.mary, 'public/uploads/restorations/saint_joseph_after.png');

    // 3. Seed Admin Account
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
    
    await Admin.create({
      username: adminUsername,
      password: hashedAdminPassword,
      email: process.env.CONTACT_EMAIL || 'admin@chakraart.com'
    });
    console.log(`Admin user seeded. Username: ${adminUsername}, Password: ${adminPassword}`);

    // 4. Seed Sizes (Using loop to guarantee lifecycle triggers and id retrieval)
    const sizesData = [
      { value: '1.5ft', description: 'Ideal for home shrines, desks, or personal prayer corners' },
      { value: '2ft', description: 'Suitable for small altars, niche displays, and chapels' },
      { value: '3ft', description: 'Perfect size for standard chapel shrines and parish side altars' },
      { value: '4ft', description: 'Prominent size suited for medium-sized churches and sanctuaries' },
      { value: '5ft', description: 'Grand statue height suitable for main altar side shrines' },
      { value: '6ft', description: 'Cathedral scale, designed as a major centerpiece figure' }
    ];
    const seededSizes = [];
    for (const sizeData of sizesData) {
      const sz = await Size.create(sizeData);
      seededSizes.push(sz);
    }
    console.log(`Seeded ${seededSizes.length} size options.`);

    // Helper maps for relations
    const sizeMap = seededSizes.reduce((map, sz) => {
      map[sz.value] = sz.id;
      return map;
    }, {});

    // 5. Seed Categories (Using loop to trigger beforeValidate hooks for slugification)
    const categoriesData = [
      { name: 'Jesus Statues', description: 'Sacred Heart of Jesus, Divine Mercy, Crucifixes, and related Christ figures.' },
      { name: 'Mother Mary Statues', description: 'Our Lady of Grace, Immaculate Conception, Lourdes, Fatima, and Baby Jesus figures.' },
      { name: 'Saints', description: 'St. Joseph, St. Jude, St. Antony, St. Francis, and other saints of the Church.' }
    ];
    const seededCategories = [];
    for (const catData of categoriesData) {
      const cat = await Category.create(catData);
      seededCategories.push(cat);
    }
    console.log(`Seeded ${seededCategories.length} categories.`);

    const catMap = seededCategories.reduce((map, cat) => {
      map[cat.slug] = cat.id;
      return map;
    }, {});

    // 6. Seed Products & Establish M2M Associations
    console.log('Seeding products and linking heights...');
    
    // Product 1
    const p1 = await Product.create({
      productName: 'Sacred Heart of Jesus Marble Statue',
      description: 'Exquisite, church-quality marble-dust composite statue depicting the Sacred Heart of Jesus. Hand-detailed with crimson drapery outlines and 24k gold leaf embellishments on the halo. Suitable for both indoor sanctuary niches and covered outdoor altars.',
      categoryId: catMap['jesus-statues'],
      images: ['/uploads/products/jesus_sacred_heart.png'],
      featured: true
    });
    await p1.setSize([sizeMap['2ft'], sizeMap['3ft'], sizeMap['4ft'], sizeMap['6ft']]);

    // Product 2
    const p2 = await Product.create({
      productName: 'Immaculate Conception Virgin Mary Statue',
      description: 'Traditional representation of the Immaculate Conception of Blessed Virgin Mary. Features detailed folding textures on the white and sky-blue robes, standing gracefully on a globe crushing the serpent. Painted with high-resistance acrylic artist pigments.',
      categoryId: catMap['mother-mary-statues'],
      images: ['/uploads/products/mary_immaculate.png'],
      featured: true
    });
    await p2.setSize([sizeMap['1.5ft'], sizeMap['2ft'], sizeMap['3ft'], sizeMap['4ft'], sizeMap['5ft']]);

    // Product 3
    const p3 = await Product.create({
      productName: 'Saint Joseph holding Baby Jesus',
      description: 'A classic portrayal of St. Joseph carrying the Infant Jesus and a symbolic lily branch. Hand-carved from solid mahogany wood by our master artists, featuring warm wooden stain finishes and highly defined facial details.',
      categoryId: catMap['saints'],
      images: ['/uploads/products/saint_joseph_baby.png'],
      featured: true
    });
    await p3.setSize([sizeMap['2ft'], sizeMap['3ft'], sizeMap['5ft']]);



    console.log('Showcase products and height associations seeded successfully.');

    // 7. Seed Gallery
    const galleryData = [
      {
        imagePath: '/uploads/gallery/altar_restoration.png',
        title: 'Statue Refurbishment Workshop',
        description: 'Our master artist restoring colors on an antique wooden statue in our main Thrissur workshop.'
      },
      {
        imagePath: '/uploads/gallery/cathedral_install.png',
        title: 'Cathedral Altar Setup',
        description: 'Setup of customized marble-dust statues inside the sanctuary of a local cathedral.'
      }
    ];
    await Gallery.bulkCreate(galleryData);
    console.log('Seeded gallery installation photos.');

    // 8. Seed Restorations
    const restorationsData = [
      {
        title: 'Antique Wooden St. Antony Statue Restoration',
        description: 'Complete paint stripping, crack repair, and fine repainting of a 100-year-old wooden Saint Antony parish statue. Restored with authentic ecclesiastical colors and sealed with custom weather-resistant matte lacquer.',
        imageBefore: '/uploads/restorations/antique_wood_before.png',
        imageAfter: '/uploads/restorations/antique_wood_after.png',
        featured: true
      },
      {
        title: 'Sacred Heart Cathedral Altar Figure Repainting',
        description: 'Repaired fractured fingers and structural base chips, followed by detailed facial restoration and 24k gold leaf gilding on the halo.',
        imageBefore: '/uploads/restorations/saint_joseph_before.png',
        imageAfter: '/uploads/restorations/saint_joseph_after.png',
        featured: true
      }
    ];
    await Restoration.bulkCreate(restorationsData);
    console.log('Seeded restorations before/after entries.');

    // 9. Seed Default Settings
    await Setting.create({
      whatsappNum: process.env.CONTACT_WHATSAPP || '919446577541',
      phoneNum: process.env.CONTACT_PHONE || '+91 94465 77541',
      emailAddr: process.env.CONTACT_EMAIL || 'info@chakraart.com',
      address: 'Chakra Art Industries, Statue Street, Divine Nagar, Thrissur, Kerala - 680001',
      openingTime: '9:00 AM',
      closingTime: '6:00 PM',
      workingDays: 'Mon - Sat',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125528.29340625345!2d76.13611893888358!3d10.519847116744888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d3926.3533479006093!2d76.2238478!3d10.5198471!5e0!3m2!1sen!2sin!4v1716912345678!5m2!1sen!2sin'
    });
    console.log('Seeded default contact and workshop settings.');

    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with database error:', error);
    process.exit(1);
  }
};

runSeed();
