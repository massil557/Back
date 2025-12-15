module.exports = (sequelize, DataTypes) => {
  const Bouquet = sequelize.define("Bouquet", {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    img: { type: DataTypes.STRING }, // image URL or path
    likesCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
  }, {
    timestamps: true
  });
  return Bouquet;
};
