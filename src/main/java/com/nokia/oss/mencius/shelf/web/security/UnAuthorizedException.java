package com.nokia.oss.mencius.shelf.web.security;

import com.nokia.oss.mencius.shelf.ShelfException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnAuthorizedException extends ShelfException {
    public UnAuthorizedException() { super("Unauthorized user cannot perform the operation."); }
}
