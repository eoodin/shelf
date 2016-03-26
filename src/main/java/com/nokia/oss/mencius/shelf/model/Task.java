package com.nokia.oss.mencius.shelf.model;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue("TA")
public class Task extends WorkItem {

}
