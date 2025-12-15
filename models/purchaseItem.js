module.exports = (sequelize, DataTypes) => {
  const PurchaseItem = sequelize.define("PurchaseItem", {
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    unitPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
  }, {
    timestamps: false
  });
  return PurchaseItem;
};
