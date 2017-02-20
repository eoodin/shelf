"use strict";

module.exports = function (sequelize, DataTypes) {
    var defect = sequelize.define("defect", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        title: DataTypes.STRING,
        description: { type: DataTypes.STRING, length: 'long' /*524288*/ },
        severity: {
            type: DataTypes.ENUM,
            values: ['Blocker', 'Critical', 'Major', 'Minor']
        },
        status: {
            type: DataTypes.ENUM,
            values: ['Created', 'Analyzing', 'Analyzed', 'Fixing', 'Fixed', 'Testing', 'Tested', 'Failed']
        }
    }, {
            classMethods: {
                associate: function (models) {
                    defect.belongsTo(models.project);
                    defect.belongsTo(models.user, { as: 'owner' });
                    defect.belongsTo(models.user, { as: 'creator' });
                }
            }
        });

    return defect;
};
