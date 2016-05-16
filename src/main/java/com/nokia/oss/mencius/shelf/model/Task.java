package com.nokia.oss.mencius.shelf.model;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("TA")
public class Task extends WorkItem {

    public enum Catalog {
        Generic,
        Testing,
        Development,
        Improvement
    }

    @Column
    private Catalog catalog = Catalog.Generic;

    @Override
    public void setStatus(Status status) {
        super.setStatus(status);
        if (Status.Finished.equals(status)) {
            setEstimation(0);
            WorkItem parent = getParent();
            if (parent instanceof Defect && Catalog.Development.equals(getCatalog()))
                ((Defect)parent).setState(Defect.State.Fixed);
        }
    }

    public Catalog getCatalog() {
        return catalog;
    }

    public void setCatalog(Catalog catalog) {
        this.catalog = catalog;
    }
}
