"use strict";

module.exports = function (sequelize, DataTypes) {
    var file = sequelize.define("file", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        name: DataTypes.STRING,
        size: DataTypes.BIGINT(20),
        mime: DataTypes.STRING,
        data: DataTypes.BLOB
    });

    return file;
};