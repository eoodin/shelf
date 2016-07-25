"use strict";

module.exports = function (sequelize, DataTypes) {

    var preference = sequelize.define("preference", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        value: DataTypes.STRING
    }, {
            tableName: 'UserPreference',
            classMethods: {
              associate: function(models) {
                preference.belongsTo(models.user, {foreignKey: 'user_userId'});
              }
            }
        });

    return preference;
};