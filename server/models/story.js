"use strict";

module.exports = function (sequelize, DataTypes) {
    var story = sequelize.define("story", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        title: DataTypes.STRING,
        priority: { type:   DataTypes.INTEGER, defaultValue: 1 },
        points: { type: DataTypes.INTEGER, defaultValue: 0 },
        description: { type: DataTypes.STRING, length: 'long' /*524288*/ },
        status: {
            type: DataTypes.ENUM,
            values: ['New', 'Working', 'Done', 'Dropped']
        }
    }, {
            classMethods: {
              associate: function(models) {
                story.belongsTo(models.project);
                story.belongsTo(story, {as: 'parent'});
                story.belongsTo(models.user, {as: 'creator'});
                story.hasMany(models.story, {as: 'children', foreignKey: 'parentId'});
              }
            }
        });

    return story;
};
