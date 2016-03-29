package com.nokia.oss.mencius.shelf;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ShelfException extends Exception {
    public ShelfException(String message) { super(message); }
    public ShelfException(String message, Throwable cause) { super(message, cause); }
}
