package com.nokia.oss.mencius.shelf.web.security;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class SimpleAuthenticationProvider implements AuthenticationProvider {

    private static final Map<String, String> CREDENTIALS;

    static {
        CREDENTIALS = new HashMap<>();
        CREDENTIALS.put("admin", "123456");
        CREDENTIALS.put("jefliu", "123456");
        CREDENTIALS.put("rich", "123456");
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getPrincipal() + "";
        String password = authentication.getCredentials() + "";

        for (Map.Entry<String, String> entry : CREDENTIALS.entrySet()) {
            if (!entry.getKey().equals(username))
                continue;

            if (entry.getValue().equals(password))
                return new UsernamePasswordAuthenticationToken(username, password,
                        Collections.singletonList(new SimpleGrantedAuthority("User")));
            else
                break;
        }

        throw new BadCredentialsException("1000");

    }

    @Override
    public boolean supports(Class<?> authentication) {
        return true;
    }
}
