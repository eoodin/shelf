"use strict";

module.exports = function (sequelize, DataTypes) {
    var workItem = sequelize.define("workItem", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        title: DataTypes.STRING,
        originalEstimation: DataTypes.INTEGER,
        estimation: DataTypes.INTEGER,
        points: DataTypes.INTEGER,
        description: {
            type: DataTypes.STRING,
            length: 'long' // > 524288
        },
        type: {
            type:   DataTypes.ENUM,
            values: ['UserStory', 'Task', 'Defect']
        },
        status: {
            type: DataTypes.ENUM,
            values: ['New', 'InProgress', 'Finished', 'Pending', 'Dropped', 'Removed']
        },
        severity: {
            type: DataTypes.ENUM,
            values: ['Blocker','Critical','Major','Minor']
        },
        state: {
            type: DataTypes.ENUM,
            values: ['Created','Analyzing','Analyzed','Fixing','Fixed','Testing','Tested','Failed']
        }
    }, {
            tableName: 'WorkItem',
            classMethods: {
              associate: function(models) {
                workItem.belongsTo(models.plan);
                workItem.hasOne(workItem, {as: 'parent', foreignKey: 'parent_id'});
                workItem.belongsTo(models.user, {as: 'owner', foreignKey: 'owner_userId'});
                workItem.belongsTo(models.user, {as: 'createdBy', foreignKey: 'createdBy_userId'});
              }
            }
        });

    return workItem;
};
