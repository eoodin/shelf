"use strict";

module.exports = function (sequelize, DataTypes) {
    var user = sequelize.define("user", {
        userId: { type: DataTypes.STRING, primaryKey: true },
        email: DataTypes.STRING,
        name: DataTypes.STRING,
        createdAt: DataTypes.DATE
    }, {
            timestamps: false,
            tableName: 'User',
            classMethods: {
              associate: function(models) {
                user.belongsToMany(models.role, {
                    through: 'User_Role',
                    otherKey: 'roles_id',
                    foreignKey: 'User_userId',
                    constraints: false
                });
                // user.belongsToMany(models.team, {
                //         // as: 'members',
                //         through: 'Team_User',
                //         otherKey: 'Team_id',
                //         foreignKey: 'member_userId',
                //         constraints: false
                //     });
              }
            }
        });

    return user;
};
