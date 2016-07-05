"use strict";

module.exports = function (sequelize, DataTypes) {
    var Role = sequelize.define("Role", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        description: DataTypes.STRING
    }, {
            timestamps: false,
            tableName: 'Role'
        });

    return Role;
};