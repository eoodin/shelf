"use strict";

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define("User", {
        userId: { type: DataTypes.STRING, primaryKey: true },
        email: DataTypes.STRING,
        name: DataTypes.STRING,
        createdAt: DataTypes.DATE
    }, {
            timestamps: false,
            tableName: 'User',
            classMethods: {
                /*
              associate: function(models) {
                User.hasMany(models.Task)
              }
              */
            }
        });

    return User;
};