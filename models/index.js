// models/index.js
const { Sequelize, DataTypes } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "..", "database.sqlite"),
  logging: false,
  // SQLite options to handle concurrency better
  pool: { max: 1, min: 0, idle: 20000 },
  acquire: 30000,
  idle: 20000
});

// Models
const User = require("./user")(sequelize, DataTypes);
const Fleur = require("./fleur")(sequelize, DataTypes);
const Bouquet = require("./bouquet")(sequelize, DataTypes);
const BouquetFlower = require("./bouquetFlower")(sequelize, DataTypes);
const Like = require("./like")(sequelize, DataTypes);

// Bouquet ↔ Fleur (through BouquetFlower)
Bouquet.belongsToMany(Fleur, {
  through: BouquetFlower,
  foreignKey: "bouquetId",
  otherKey: "fleurId"
});
Fleur.belongsToMany(Bouquet, {
  through: BouquetFlower,
  foreignKey: "fleurId",
  otherKey: "bouquetId"
});
Bouquet.hasMany(BouquetFlower, { foreignKey: "bouquetId" });
BouquetFlower.belongsTo(Bouquet, { foreignKey: "bouquetId" });
Fleur.hasMany(BouquetFlower, { foreignKey: "fleurId" });
BouquetFlower.belongsTo(Fleur, { foreignKey: "fleurId" });

// User ↔ Bouquet (through Like) with aliases
User.belongsToMany(Bouquet, {
  through: Like,
  foreignKey: "userId",
  otherKey: "bouquetId",
  as: "LikedBouquets" // alias when querying from User
});
Bouquet.belongsToMany(User, {
  through: Like,
  foreignKey: "bouquetId",
  otherKey: "userId",
  as: "UsersWhoLiked" // alias when querying from Bouquet
});
User.hasMany(Like, { foreignKey: "userId" });
Like.belongsTo(User, { foreignKey: "userId" });
Bouquet.hasMany(Like, { foreignKey: "bouquetId" });
Like.belongsTo(Bouquet, { foreignKey: "bouquetId" });

// Add likesCount to Bouquet model
Bouquet.prototype.getLikesCount = async function() {
  return await Like.count({ where: { bouquetId: this.id } });
};

module.exports = {
  sequelize,
  User,
  Fleur,
  Bouquet,
  BouquetFlower,
  Like
};
