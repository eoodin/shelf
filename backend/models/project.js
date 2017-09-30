"use strict";

module.exports = function (sequelize, DataTypes) {
    var project = sequelize.define("project", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING
    }, {timestamps: false});
    project.associate = function(models) {
        project.belongsTo(models.team);
        project.hasMany(models.story); //  cascade = CascadeType.REMOVE
        project.hasMany(models.release);
    };
    
    return project;
};
