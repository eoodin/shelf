'use strict';
module.exports = (sequelize, DataTypes) => {
  var history = sequelize.define('history', {
  }, {updatedAt: false});
  history.associate = function(models) {
    history.hasMany(models.change);
    history.belongsTo(models.user);
  };

  return history;
};