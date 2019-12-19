package online.eoodin.shelf.rest;

import online.eoodin.shelf.security.MyUserPrincipal;
import online.eoodin.shelf.entity.User;
import online.eoodin.shelf.model.AccessorInfo;
import online.eoodin.shelf.model.ShelfUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
public class LoginUserController {

    @RequestMapping("/accessor")
    public AccessorInfo getAccessorInfo() {
        AccessorInfo profile = new AccessorInfo();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        MyUserPrincipal userPrincipal = (MyUserPrincipal) auth.getPrincipal();
        ShelfUser user = translateUser(userPrincipal.getUser());
        profile.setUser(user);

        return profile;
    }

    private ShelfUser translateUser(User entity) {
        ShelfUser user = new ShelfUser();
        user.setUsername(entity.getUsername());
        user.setDisplayName(entity.getName());
        user.setEmail(entity.getEmail());
        return user;
    }
}
