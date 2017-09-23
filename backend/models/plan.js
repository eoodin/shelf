"use strict";

module.exports = function (sequelize, DataTypes) {
    var plan = sequelize.define("plan", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        type: DataTypes.STRING,
        start: DataTypes.DATE,
        end: DataTypes.DATE
    }, {timestamps: false});

    plan.associate = function(models) {
        plan.belongsTo(models.team);
        plan.hasMany(models.task);
        plan.hasOne(models.allocation);
    };

    return plan;
};
