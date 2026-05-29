const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Gallery = sequelize.define('Gallery', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
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
  timestamps: true
});

module.exports = Gallery;
