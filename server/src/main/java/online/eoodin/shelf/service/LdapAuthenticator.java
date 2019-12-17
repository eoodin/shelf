package online.eoodin.shelf.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.stereotype.Component;

@Component
public class LdapAuthenticator {
    private final LdapTemplate template;

    @Autowired
    public LdapAuthenticator(LdapTemplate template) {
        this.template = template;
    }
}
