"use strict";

module.exports = function (sequelize, DataTypes) {
    var item = sequelize.define("item", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        title: DataTypes.STRING,
        originalEstimation: { type: DataTypes.INTEGER, defaultValue: 0 },
        priority: { type:   DataTypes.INTEGER, defaultValue: 1 },
        estimation: { type: DataTypes.INTEGER, defaultValue: 0 },
        points: { type: DataTypes.INTEGER, defaultValue: 0 },
        description: { type: DataTypes.STRING, length: 'long' /*524288*/ },
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
            classMethods: {
              associate: function(models) {
                item.belongsTo(models.plan);
                item.belongsTo(item, {as: 'parent'});
                item.belongsTo(models.user, {as: 'owner'});
                item.belongsTo(models.user, {as: 'creator'});
                item.hasMany(models.change);
                item.hasMany(models.item, {as: 'children', foreignKey: 'parentId'});
              }
            }
        });

    return item;
};
