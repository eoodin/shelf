"use strict";

module.exports = function (sequelize, DataTypes) {
    /*
    @OneToOne
    private User createdBy;

    @JsonIgnore
    @OneToMany
    private Collection<User> members;

    @OneToOne
    private User scrumMaster;
    */
    var team = sequelize.define("team", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING
    }, {
            tableName: 'Team',
            classMethods: {
                associate: function(models) {
                    team.belongsToMany(models.user, {
                        // as: 'members',
                        through: 'Team_User',
                        otherKey: 'members_userId',
                        foreignKey: 'Team_id',
                        constraints: false
                    });
                }
            }
        });

    return team;
};