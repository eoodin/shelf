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
            underscored: true,
            classMethods: {
              associate: function(models) {
                User.belongsToMany(models.Role, {
                    through: 'User_Role',
                    otherKey: 'roles_id',
                    foreignKey: 'User_userId',
                    constraints: false
                })
              }
            }
        });

    return User;
};
