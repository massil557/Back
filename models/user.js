const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    login: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING, allowNull: false, defaultValue: "user" } // 'admin' or 'user'
  }, {
    timestamps: true
  });

  User.prototype.setPassword = async function(password) {
    this.passwordHash = await bcrypt.hash(password, 10);
    return this.passwordHash;
  };

  User.prototype.validatePassword = async function(password) {
    return bcrypt.compare(password, this.passwordHash);
  };

  return User;
};
