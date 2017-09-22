'use strict';
module.exports = (sequelize, DataTypes) => {
  var history = sequelize.define('history', {
    creator: DataTypes.STRING
  });
  history.associate = function(models) {
    history.belongsToMany(models.defect, {as:'changes', through: 'defect_changes'});
    history.hasMany(model.change);
  };

  return history;
};