"use strict";
//TODO:...
module.exports = function (sequelize, DataTypes) {
    /*
    TODO:
public enum Status {
        New,
        InProgress,
        Finished,
        Pending,
        Dropped,
        Removed
    }

    @Id
    @GeneratedValue
    private Long id;

    @Column
    private String title;

    @Column(nullable = false)
    private int originalEstimation;

    @Column(nullable = false)
    private int estimation;

    @Lob
    @Column(length = 524288)
    private String description;

    @Column
    private Status status;

    @ManyToOne
    private WorkItem parent;

    @ManyToOne
    @JsonIgnore
    private Project project;

    @ManyToOne
    @JsonIgnore
    private Plan plan;

    @OneToOne
    private User owner;

    @OneToOne
    private User createdBy;

    @Column
    private Date createdAt;

    @OneToMany(mappedBy = "item", cascade = CascadeType.REMOVE)
    @OrderBy("changeTime")
    @JsonIgnore
    private List<ChangeLog> changes;

    for userstory
    @Column
    private int points;

    
    */
    var WorkItem = sequelize.define("WorkItem", {
        id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
        title: DataTypes.STRING
    }, {
            tableName: 'WorkItem',
            classMethods: {
                /*
              associate: function(models) {
                User.hasMany(models.Task)
              }
              */
            }
        });

    return WorkItem;
};