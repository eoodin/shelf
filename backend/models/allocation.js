"use strict";

module.exports = function (sequelize, DataTypes) {
    var allocation = sequelize.define("allocation", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        effort: DataTypes.INTEGER
    });
    allocation.associate = function (models) {
        allocation.belongsTo(models.plan);
        allocation.belongsTo(models.team);
    };
    
    return allocation;
};