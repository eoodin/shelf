package com.nokia.oss.mencius.shelf.web.security;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class UnAuthorizedException extends Exception {
    public UnAuthorizedException() { }
}
