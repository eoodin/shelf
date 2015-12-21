package com.nokia.oss.mencius.shelf.model;

import javax.persistence.*;

@Entity
@DiscriminatorValue("US")
public class UserStory extends WorkItem {
    @Column
    private int points;

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }
}
