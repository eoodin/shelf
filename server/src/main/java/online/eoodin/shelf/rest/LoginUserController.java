package online.eoodin.shelf.rest;

import online.eoodin.shelf.model.LoginUserProfile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@RestController
public class LoginUserController {

    @Autowired
    private CsrfTokenRepository csrfTokenRepository;

    @RequestMapping("/profile")
    public LoginUserProfile getProfile(HttpServletRequest request) {
        LoginUserProfile profile = new LoginUserProfile();
        profile.setCsrf(csrfTokenRepository.loadToken(request).getToken());
        return profile;
    }
}
