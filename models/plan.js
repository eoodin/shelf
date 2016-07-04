"use strict";

module.exports = function (sequelize, DataTypes) {
    /*
    TODO:
    @JsonIgnore
    @ManyToOne
    Project project;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.REMOVE)
    @JsonIgnore
    private List<WorkItem> workItems;

    @OneToOne(mappedBy = "sprint", cascade = CascadeType.REMOVE)
    private Allocation allocation;
 */
    var Plan = sequelize.define("Plan", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        type: DataTypes.STRING,
        start: DataTypes.DATE,
        end: DataTypes.DATE,
        project_id: DataTypes.BIGINT
        // workItems: ...
        // allocation: ...
    }, {
            timestamps: false,
            tableName: 'Plan',
            underscored: true,
            classMethods: {
              associate: function(models) {
                Plan.belongsTo(models.Project)
              }
            }
        });

    return Plan;
};