"use strict";

module.exports = function (sequelize, DataTypes) {
    var team = sequelize.define("team", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING
    }, {
            classMethods: {
                associate: function(models) {
                    team.belongsToMany(models.user, {as:'members', through: 'team_members'});
                }
            }
        });

    return team;
};
