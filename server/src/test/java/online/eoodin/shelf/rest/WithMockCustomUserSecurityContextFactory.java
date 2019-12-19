package online.eoodin.shelf.rest;

import online.eoodin.shelf.entity.User;
import online.eoodin.shelf.security.MyUserPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

public class WithMockCustomUserSecurityContextFactory implements WithSecurityContextFactory<WithMockCustomUser> {
    @Override
    public SecurityContext createSecurityContext(WithMockCustomUser customUser) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        User user = new User();
        user.setUsername(customUser.username());
        user.setName(customUser.name());
        MyUserPrincipal principal = new MyUserPrincipal(user);
        principal.setAuthorities(AuthorityUtils.createAuthorityList(customUser.roles()));
        Authentication auth = new UsernamePasswordAuthenticationToken(principal, "password", principal.getAuthorities());
        context.setAuthentication(auth);
        return context;
    }
}
