'use strict';
module.exports = (sequelize, DataTypes) => {
  var taskHistory = sequelize.define('taskHistory', {
    taskId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    historyId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.BIGINT
    }
  }, { tableName: 'task_histories', updatedAt: false });
  taskHistory.associate = function (models) {
    // associations can be defined here
  }

  return taskHistory;
};