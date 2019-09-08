"use strict";

module.exports = function (sequelize, DataTypes) {
    var password = sequelize.define("password", {
        userId: {type: DataTypes.STRING, primaryKey: true},
        password: DataTypes.STRING,
    });

    password.associate = function (models) {
        password.belongsTo(models.user);
    };
    
    return password;
};

