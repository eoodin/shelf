package com.nokia.oss.mencius.shelf.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.List;

@Entity
@DiscriminatorValue("US")
public class UserStory extends WorkItem {
    @Column
    private int points;

    @JsonIgnore
    @ManyToOne
    private UserStory parent;

    @OneToMany(mappedBy = "parent", fetch = FetchType.EAGER)
    private List<UserStory> children;

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public UserStory getParent() {
        return parent;
    }

    public void setParent(UserStory parent) {
        this.parent = parent;
    }

    public List<UserStory> getChildren() {
        return children;
    }

    public void setChildren(List<UserStory> children) {
        this.children = children;
    }
}
