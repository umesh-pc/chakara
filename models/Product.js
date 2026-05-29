const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const slugify = require('slugify');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    allowNull: false
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeValidate: (product) => {
      if (product.productName) {
        product.slug = slugify(product.productName, { lower: true, strict: true });
      }
    }
  }
});

module.exports = Product;
