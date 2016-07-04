"use strict";
//TODO:...
module.exports = function (sequelize, DataTypes) {
    var WorkItem = sequelize.define("WorkItem", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        title: DataTypes.STRING
    }, {
            tableName: 'WorkItem',
            classMethods: {
                /*
              associate: function(models) {
                User.hasMany(models.Task)
              }
              */
            }
        });

    return WorkItem;
};