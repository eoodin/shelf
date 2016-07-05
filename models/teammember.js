"use strict";

module.exports = function (sequelize, DataTypes) {
    var TeamMember = sequelize.define("TeamMember", {
        teamId: { type: DataTypes.BIGINT, primaryKey: true},
        userId: { type: DataTypes.STRING, primaryKey: true}
    }, {
            tableName: 'TeamMember',
            classMethods: {
                /*
              associate: function(models) {
                User.hasMany(models.Task)
              }
              */
            }
        });

    return TeamMember;
};