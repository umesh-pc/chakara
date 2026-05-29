const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const slugify = require('slugify');

const Restoration = sequelize.define('Restoration', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageBefore: {
    type: DataTypes.STRING,
    allowNull: false
  },
  imageAfter: {
    type: DataTypes.STRING,
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
    beforeValidate: (restoration) => {
      if (restoration.title) {
        restoration.slug = slugify(restoration.title, { lower: true, strict: true });
      }
    }
  }
});

module.exports = Restoration;
