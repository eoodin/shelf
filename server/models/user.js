"use strict";

module.exports = function (sequelize, DataTypes) {
    var user = sequelize.define("user", {
        id: {type: DataTypes.STRING, primaryKey: true},
        email: DataTypes.STRING,
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function (models) {
                user.belongsToMany(models.role, {through: 'user_roles', otherKey: 'roleId', foreignKey: 'userId'});
                user.belongsToMany(models.team, {as: 'teams', through: 'team_members'});
            }
        }
    });

    return user;
};
