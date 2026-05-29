const { sequelize } = require('../config/db');
const Admin = require('./Admin');
const Category = require('./Category');
const Size = require('./Size');
const Product = require('./Product');
const Gallery = require('./Gallery');
const Restoration = require('./Restoration');
const Setting = require('./Setting');

// --- Associations ---

// 1. One-to-Many (Category -> Products)
Category.hasMany(Product, { foreignKey: 'categoryId', onDelete: 'RESTRICT' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// 2. Many-to-Many (Products <-> Sizes)
Product.belongsToMany(Size, { through: 'ProductSizes', as: 'size', foreignKey: 'productId', otherKey: 'sizeId', onDelete: 'CASCADE' });
Size.belongsToMany(Product, { through: 'ProductSizes', as: 'product', foreignKey: 'sizeId', otherKey: 'productId', onDelete: 'RESTRICT' });

module.exports = {
  sequelize,
  Admin,
  Category,
  Size,
  Product,
  Gallery,
  Restoration,
  Setting
};
