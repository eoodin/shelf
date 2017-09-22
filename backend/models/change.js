"use strict";

module.exports = function (sequelize, DataTypes) {
    var change = sequelize.define("change", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        originalData: { type: DataTypes.STRING, length: 'long' /* > 524288 */ },
        changedData:  { type: DataTypes.STRING, length: 'long' /* > 524288 */ }
    }, {timestamps: false});
    change.associate = function(models) {
        // change.belongsTo(models.task);
        // change.belongsTo(models.user);
        change.belongsTo(models.history);
    };
    
    return change;
};