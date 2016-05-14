package com.nokia.oss.mencius.shelf.model;

import javax.annotation.Generated;
import javax.persistence.*;
import java.util.Date;

@Entity
public class GenericFile {
    @Id
    @GeneratedValue
    private Long id;

    @Column
    private String name;

    @Column
    private Long size;

    @Column
    private String mime;

    @Column
    private Date createdAt;

    @Column
    private Date modifiedAt;

    @Lob
    @Column(length = 10485760)
    private byte[] data;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public String getMime() {
        return mime;
    }

    public void setMime(String mime) {
        this.mime = mime;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getModifiedAt() {
        return modifiedAt;
    }

    public void setModifiedAt(Date modifiedAt) {
        this.modifiedAt = modifiedAt;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }
}
