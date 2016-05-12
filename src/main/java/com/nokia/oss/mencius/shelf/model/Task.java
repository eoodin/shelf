package com.nokia.oss.mencius.shelf.model;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("TA")
public class Task extends WorkItem {
    @Override
    public void setStatus(Status status) {
        super.setStatus(status);
        if (Status.Finished.equals(status))
            setEstimation(0);
    }
}
