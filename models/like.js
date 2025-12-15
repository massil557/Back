
module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define("Like", {
}, {
    timestamps: true
  });
  return Like;
};
