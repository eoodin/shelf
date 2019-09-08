"use strict";

module.exports = function (sequelize, DataTypes) {
    var defect = sequelize.define("defect", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        title: DataTypes.STRING,
        description: { type: DataTypes.TEXT, length: 'long' /*524288*/ },
        severity: {
            type: DataTypes.ENUM,
            values: ['Blocker', 'Critical', 'Major', 'Minor']
        },
        status: {
            type: DataTypes.ENUM,
            values: ['Open', 'Analyzing', 'Declined', 'Fixing', 'Fixed', 'Testing', 'Failed', 'Closed']
        }
    });
    defect.associate = function (models) {
        defect.belongsTo(models.project);
        defect.belongsTo(models.user, { as: 'owner' });
        defect.belongsTo(models.user, { as: 'creator' });
        defect.hasMany(models.defectHistory, {as: 'histories'});
        defect.hasMany(models.defectComment);
    };

    return defect;
};
