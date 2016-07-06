"use strict";

module.exports = function (sequelize, DataTypes) {
    /*
    TODO: deal with this association
    @ManyToOne
    private User user;
   */
    var preference = sequelize.define("preference", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        user: DataTypes.STRING,
        name: DataTypes.STRING,
        value: DataTypes.STRING
    }, {
            tableName: 'Preference',
            classMethods: {
                /*
              associate: function(models) {
                preference.hasMany(models.xx)
              }
              */
            }
        });

    return preference;
};