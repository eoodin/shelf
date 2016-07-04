"use strict";

module.exports = function (sequelize, DataTypes) {
    /*
    TODO: deal with this association
    @ManyToOne
    private User user;
   */
    var Preference = sequelize.define("Preference", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        user: DataTypes.STRING,
        name: DataTypes.STRING,
        value: DataTypes.STRING
    }, {
            tableName: 'Preference',
            classMethods: {
                /*
              associate: function(models) {
                Preference.hasMany(models.xx)
              }
              */
            }
        });

    return Preference;
};