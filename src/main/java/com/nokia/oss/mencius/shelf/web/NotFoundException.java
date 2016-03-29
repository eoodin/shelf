package com.nokia.oss.mencius.shelf.web;

import com.nokia.oss.mencius.shelf.ShelfException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class NotFoundException extends ShelfException {
    public NotFoundException() { super("Resource associated with given URI not found"); }
}
