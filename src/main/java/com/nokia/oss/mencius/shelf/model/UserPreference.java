package com.nokia.oss.mencius.shelf.model;

import javax.persistence.*;
import java.util.Date;

@Entity
public class UserPreference {
    @GeneratedValue
    @Id
    private Long id;

    @ManyToOne
    private User user;

    @Column
    private String name;

    @Column
    private String value;

    @Column
    private Date createdAt;

    @Column
    private Date changedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(Date changedAt) {
        this.changedAt = changedAt;
    }
}
