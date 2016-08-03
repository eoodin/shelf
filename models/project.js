"use strict";

module.exports = function (sequelize, DataTypes) {
    var project = sequelize.define("project", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING
    }, {
            timestamps: false,
            tableName: 'Project',
            classMethods: {
                associate: function(models) {
                    project.belongsTo(models.team);
                    project.hasMany(models.plan); //  cascade = CascadeType.REMOVE
                    project.hasMany(models.item); //  cascade = CascadeType.REMOVE
                }
            }
        });

    return project;
};