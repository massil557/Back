// models/purchase.js
module.exports = (sequelize, DataTypes) => {
  const Purchase = sequelize.define("Purchase", {
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
  }, {
    timestamps: true
  });
  return Purchase;
};
