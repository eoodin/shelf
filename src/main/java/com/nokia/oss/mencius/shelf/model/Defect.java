package com.nokia.oss.mencius.shelf.model;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("DE")
public class Defect extends WorkItem {

    @Override
    public String getType() {
        return "DE";
    }
}
