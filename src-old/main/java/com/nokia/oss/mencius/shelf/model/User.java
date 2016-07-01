package com.nokia.oss.mencius.shelf.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.Collection;
import java.util.Date;

@Entity
public class User {
    @Column
    @Id
    private String userId;

    @Column
    private String name;

    @Column
    private String email;

    @Column(nullable = false)
    private Date createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private Collection<UserPreference> preferences;

    @OneToMany(fetch = FetchType.EAGER)
    private Collection<Role> roles;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Collection<UserPreference> getPreferences() {
        return preferences;
    }

    public void setPreferences(Collection<UserPreference> preferences) {
        this.preferences = preferences;
    }

    public Collection<Role> getRoles() {
        return roles;
    }

    public void setRoles(Collection<Role> roles) {
        this.roles = roles;
    }
}