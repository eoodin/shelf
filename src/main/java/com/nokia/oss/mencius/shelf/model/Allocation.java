package com.nokia.oss.mencius.shelf.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToOne;

@Entity
public class Allocation {
    @Id
    @GeneratedValue
    private Long id;

    @JsonIgnore
    @OneToOne
    private Team team;

    @JsonIgnore
    @OneToOne
    private Plan sprint;

    @Column
    private Long developerHours;

    @Column
    private Long testerHours;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public Plan getSprint() {
        return sprint;
    }

    public void setSprint(Plan sprint) {
        this.sprint = sprint;
    }


    public Long getDeveloperHours() {
        return developerHours;
    }

    public void setDeveloperHours(Long developerHours) {
        this.developerHours = developerHours;
    }

    public Long getTesterHours() {
        return testerHours;
    }

    public void setTesterHours(Long testerHours) {
        this.testerHours = testerHours;
    }
}
