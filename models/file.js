"use strict";

module.exports = function (sequelize, DataTypes) {
    /*
    TODO:
    @Id
    @GeneratedValue
    private Long id;

    @Column
    private String name;

    @Column
    private Long size;

    @Column
    private String mime;

    @Column
    private Date createdAt;

    @Column
    private Date modifiedAt;

    @Lob
    @Column(length = 10485760)
    private byte[] data;
    */
    var File = sequelize.define("File", {
        userId: { type: DataTypes.STRING, primaryKey: true },
        name: DataTypes.STRING,
        createdAt: DataTypes.DATE
    }, {
            timestamps: false,
            tableName: 'File',
            classMethods: {
                /*
              associate: function(models) {
                File.hasMany(models.Task)
              }
              */
            }
        });

    return File;
};