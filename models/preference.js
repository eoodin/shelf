"use strict";

module.exports = function (sequelize, DataTypes) {

    var preference = sequelize.define("preference", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        value: DataTypes.STRING
    }, {
            classMethods: {
              associate: function(models) {
                preference.belongsTo(models.user, {foreignKey: 'userId'});
              }
            }
        });

    return preference;
};