const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const slugify = require('slugify');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
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
    beforeValidate: (category) => {
      if (category.name) {
        category.slug = slugify(category.name, { lower: true, strict: true });
      }
    }
  }
});

// Custom prototype toString method
Category.prototype.toString = function() {
  return this.id.toString();
};

module.exports = Category;
