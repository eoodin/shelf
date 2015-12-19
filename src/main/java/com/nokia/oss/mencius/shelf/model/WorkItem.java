package com.nokia.oss.mencius.shelf.model;

import javax.persistence.*;

@Entity
@Inheritance(strategy=InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn
@DiscriminatorValue("WI")
public class WorkItem {
    @Id
    @GeneratedValue
    private Long id;

    @Column
    private String title;

    @Column
    private String type;

    @ManyToOne
    private Plan plan;

    public WorkItem() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Plan getPlan() {
        return plan;
    }

    public void setPlan(Plan plan) {
        this.plan = plan;
    }
}
