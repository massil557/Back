module.exports = (sequelize, DataTypes) => {
  const Fleur = sequelize.define("Fleur", {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    unitPrice: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }
  }, {
    timestamps: true
  });
  return Fleur;
};
