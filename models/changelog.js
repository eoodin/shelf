"use strict";

module.exports = function (sequelize, DataTypes) {
    var changeLog = sequelize.define("changeLog", {
        userId: { type: DataTypes.STRING, primaryKey: true }
    }, {
            timestamps: false,
            tableName: 'ChangeLog',
            classMethods: {
                /*
              associate: function(models) {
                changeLog.hasMany(models.Task)
              }
              */
            }
        });

    return changeLog;
};