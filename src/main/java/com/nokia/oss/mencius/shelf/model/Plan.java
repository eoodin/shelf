package com.nokia.oss.mencius.shelf.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
public class Plan {
    @Id
    @GeneratedValue
    private Long id;

    @JsonIgnore
    @ManyToOne
    Project project;

    @Column
    private String name;

    @Column
    private String type;

    @Column
    private Date start;

    @Column
    private Date end;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.REMOVE)
    // @OrderBy("id ASC")
    @JsonIgnore
    List<WorkItem> workItems;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public List<WorkItem> getWorkItems() {
        return workItems;
    }

    public void setWorkItems(List<WorkItem> workItems) {
        this.workItems = workItems;
    }

    public Date getStart() {
        return start;
    }

    public void setStart(Date start) {
        this.start = start;
    }

    public Date getEnd() {
        return end;
    }

    public void setEnd(Date end) {
        this.end = end;
    }
}
