package com.nokia.oss.mencius.shelf.model;

import javax.persistence.*;

@Entity
@DiscriminatorValue("US")
public class UserStory extends WorkItem {
    @Column
    private int storyPoint;

    public int getStoryPoint() {
        return storyPoint;
    }

    public void setStoryPoint(int storyPoint) {
        this.storyPoint = storyPoint;
    }
}
