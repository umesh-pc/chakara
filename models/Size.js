const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Size = sequelize.define('Size', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
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
  timestamps: true
});

// Custom prototype method for EJS isChecked matching
Size.prototype.toString = function() {
  return this.id.toString();
};

module.exports = Size;
