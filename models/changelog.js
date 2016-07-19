"use strict";

module.exports = function (sequelize, DataTypes) {
    var changeLog = sequelize.define("changeLog", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        originalData: { type: DataTypes.STRING, length: 'long' /* > 524288 */ },
        changedData:  { type: DataTypes.STRING, length: 'long' /* > 524288 */ }
    }, {
            tableName: 'ChangeLog',
            classMethods: {
              associate: function(models) {
                changeLog.belongsTo(models.workItem, {as: 'item', foreignKey: 'item_id'});
                changeLog.belongsTo(models.user, {as: 'user', foreignKey: 'actor_userId'})
              }
            }
        });

    return changeLog;
};