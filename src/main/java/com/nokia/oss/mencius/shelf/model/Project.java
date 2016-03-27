package com.nokia.oss.mencius.shelf.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.List;

@Entity
public class Project {
    @Id
    @GeneratedValue
    private Long id;

    @Column
    private String name;

    @OneToOne
    private Team team;

    @OneToOne
    private Plan backlog;

    @OneToMany(mappedBy = "project", cascade = CascadeType.REMOVE)
    // @OrderBy("id ASC")
    @JsonIgnore
    private List<Plan> plans;

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

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public Plan getBacklog() {
        return backlog;
    }

    public void setBacklog(Plan backlog) {
        this.backlog = backlog;
    }

    public List<Plan> getPlans() {
        return plans;
    }

    public void setPlans(List<Plan> plans) {
        this.plans = plans;
    }
}
