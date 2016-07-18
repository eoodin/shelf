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
    var plan = sequelize.define("plan", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        type: DataTypes.STRING,
        start: DataTypes.DATE,
        end: DataTypes.DATE,
        // workItems: ...
        // allocation: ...
    }, {
            timestamps: false,
            tableName: 'Plan',
            classMethods: {
              associate: function(models) {
                plan.belongsTo(models.project);
                plan.hasMany(models.workItem);
                plan.hasOne(models.allocation, {as: 'allocation', foreignKey: 'sprint_id'});
              }
            }
        });

    return plan;
};