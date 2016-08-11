"use strict";

module.exports = function (sequelize, DataTypes) {
    var plan = sequelize.define("plan", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        type: DataTypes.STRING,
        start: DataTypes.DATE,
        end: DataTypes.DATE
    }, {
            timestamps: false,
            classMethods: {
              associate: function(models) {
                plan.belongsTo(models.project);
                plan.hasMany(models.item);
                plan.hasOne(models.allocation);
              }
            }
        });

    return plan;
};
