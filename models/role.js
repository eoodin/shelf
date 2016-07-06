"use strict";

module.exports = function (sequelize, DataTypes) {
    var role = sequelize.define("role", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        description: DataTypes.STRING
    }, {
            timestamps: false,
            tableName: 'Role'
        });

    return role;
};