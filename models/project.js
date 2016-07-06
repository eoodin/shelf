"use strict";

module.exports = function (sequelize, DataTypes) {
    /*
    TODO: following fields
    @OneToOne
    private Team team;

    @OneToMany(mappedBy = "project", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<Plan> plans;

    @OneToMany(mappedBy = "project", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private Set<WorkItem> items;
 */
    var project = sequelize.define("project", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING
    }, {
            timestamps: false,
            tableName: 'Project',
            classMethods: {
                associate: function(models) {
                    project.belongsTo(models.team);
                }
            }
        });

    return project;
};