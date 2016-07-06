"use strict";
//TODO:...
module.exports = function (sequelize, DataTypes) {
    /*
    TODO:

    @OneToMany(mappedBy = "item", cascade = CascadeType.REMOVE)
    @OrderBy("changeTime")
    @JsonIgnore
    private List<ChangeLog> changes;

    for userstory
    @Column
    private int points;

    
    */
    var workItem = sequelize.define("workItem", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        title: DataTypes.STRING,
        originalEstimation: DataTypes.INTEGER,
        estimation: DataTypes.INTEGER,
        points: DataTypes.INTEGER,
        description: {
            type: DataTypes.STRING,
            length: 'long' // > 524288
        },
        type: {
            type:   DataTypes.ENUM,
            values: ['UserStory', 'Task', 'Defect']
        },
        status: {
            type: DataTypes.ENUM,
            values: ['New', 'InProgress', 'Finished', 'Pending', 'Dropped', 'Removed']
        }
    }, {
            tableName: 'WorkItem',
            classMethods: {
              associate: function(models) {
                workItem.belongsTo(models.plan);
                workItem.hasOne(workItem, {as: 'parent', foreignKey: 'parent_id'});
                workItem.belongsTo(models.user, {as: 'owner', foreignKey: 'owner_userId'});
                workItem.belongsTo(models.user, {as: 'createdBy', foreignKey: 'createdBy_userId'});
              }
            }
        });

    return workItem;
};