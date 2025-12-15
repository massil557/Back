module.exports = (sequelize, DataTypes) => {
  const BouquetFlower = sequelize.define("BouquetFlower", {
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }
  }, {
    timestamps: false
  });
  return BouquetFlower;
};