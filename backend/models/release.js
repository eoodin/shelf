'use strict';
module.exports = (sequelize, DataTypes) => {
  var release = sequelize.define('release', {
    projectId: DataTypes.BIGINT,
    name: DataTypes.STRING,
    targetDate: DataTypes.DATE
  });

  release.associate = function(models) {
    release.belongsTo(models.project);
  };

  return release;
};