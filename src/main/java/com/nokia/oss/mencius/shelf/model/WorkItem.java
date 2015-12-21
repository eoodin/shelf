package com.nokia.oss.mencius.shelf.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn
@DiscriminatorValue("WI")
abstract public class WorkItem {
    public enum Status {
        New,
        InProgress,
        Finished,
        Pending,
        Dropped
    }

    @Id
    @GeneratedValue
    private Long id;

    @Column
    private String title;

    @Column
    private int estimation;

    @Column
    private String description;

    @Column
    private Status status;

    @ManyToOne
    @JsonIgnore
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

    public int getEstimation() {
        return estimation;
    }

    public void setEstimation(int estimation) {
        this.estimation = estimation;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Plan getPlan() {
        return plan;
    }

    public void setPlan(Plan plan) {
        this.plan = plan;
    }

    @JsonGetter
    public abstract String getType();

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}
