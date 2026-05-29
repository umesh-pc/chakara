const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    trim: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
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

// Helper instance method to check password
Admin.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = Admin;
