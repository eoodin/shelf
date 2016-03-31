package com.nokia.oss.mencius.shelf.model;

import javax.persistence.Column;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.OneToOne;
import java.util.Date;

@Entity
@DiscriminatorValue("DE")
public class Defect extends WorkItem {
    public enum Severity {
        Minor,
        Major,
        Critical,
        Blocker
    }

    @Column
    private Severity severity;

    @Column
    private String version;

    @Column
    private String fixedIn;

    @Column
    private Date fixedAt;

    @OneToOne
    private User fixedBy;

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }
}