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
    var Team = sequelize.define("Team", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        createdBy: DataTypes.STRING,
        scrumMaster: DataTypes.STRING,
        createdAt: DataTypes.DATE
    }, {
            tableName: 'Team',
            underscored: true,
            classMethods: {
                //TODO
                // associate: function (models) {
                //     Team.hasMany(models.User, {through: {model: TeamMember}})
                // }
            }
        });

    return Team;
};