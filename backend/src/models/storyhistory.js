'use strict';
module.exports = (sequelize, DataTypes) => {
  var storyHistory = sequelize.define('storyHistory', {
    storyId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    historyId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT
    }
  }, { tableName: 'story_histories', updatedAt: false });
  storyHistory.associate = function (models) {
    // associations can be defined here
  }
  return storyHistory;
};