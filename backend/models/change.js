"use strict";

module.exports = function (sequelize, DataTypes) {
    var change = sequelize.define("change", {
        historyId: { primaryKey: true, type: DataTypes.BIGINT },
        field: { primaryKey: true, type: DataTypes.STRING },
        value: { type: DataTypes.TEXT, length: 'long' }
    }, {timestamps: false});
    change.associate = function(models) {
        change.belongsTo(models.history);
    };
    
    return change;
};