package com.nokia.oss.mencius.shelf.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import javax.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type")
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

    @Column(nullable = false)
    private int originalEstimation;

    @Column(nullable = false)
    private int estimation;

    @Lob
    private String description;

    @Column
    private Status status;

    @ManyToOne
    @JsonIgnore
    private Plan plan;

    @OneToOne
    private User owner;

    @OneToOne
    private User createdBy;

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

    public int getOriginalEstimation() {
        return originalEstimation;
    }

    public void setOriginalEstimation(int estimation) {
        this.originalEstimation = estimation;
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

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }
}
