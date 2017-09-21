"use strict";

module.exports = function (sequelize, DataTypes) {
    var task = sequelize.define("task", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        title: DataTypes.STRING,
        priority: { type:   DataTypes.INTEGER, defaultValue: 1 },
        originalEstimation: { type: DataTypes.INTEGER, defaultValue: 0 },
        estimation: { type: DataTypes.INTEGER, defaultValue: 0 },
        description: { type: DataTypes.STRING, length: 'long' /*524288*/ },
        status: {
            type: DataTypes.ENUM,
            values: ['New', 'InProgress', 'Finished', 'Pending', 'Dropped', 'Removed']
        }
    });
    task.associate = function(models) {
        task.belongsTo(models.plan);
        task.belongsTo(models.user, {as: 'owner'});
        task.belongsTo(models.user, {as: 'creator'});
        task.hasMany(models.change);
    };
    
    return task;
};
