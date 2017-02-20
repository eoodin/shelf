"use strict";

module.exports = function (sequelize, DataTypes) {
    var change = sequelize.define("change", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        originalData: { type: DataTypes.STRING, length: 'long' /* > 524288 */ },
        changedData:  { type: DataTypes.STRING, length: 'long' /* > 524288 */ }
    }, {
            timestamps: true,
            updatedAt: false,
            classMethods: {
              associate: function(models) {
                change.belongsTo(models.item);
                change.belongsTo(models.user);
              }
            }
        });

    return change;
};