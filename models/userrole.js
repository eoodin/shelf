"use strict";

module.exports = function (sequelize, DataTypes) {
    var UserRole = sequelize.define("UserRole", {
        User_userId: { type: DataTypes.STRING, unique: 'user_role' },
        roles_id: { type: DataTypes.BIGINT, unique: 'user_role' }
    }, {
            timestamps: false,
            tableName: 'User_Role'
        });

    return UserRole;
};