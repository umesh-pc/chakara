const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  whatsappNum: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phoneNum: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emailAddr: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  openingTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  closingTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  workingDays: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mapEmbedUrl: {
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

module.exports = Setting;
