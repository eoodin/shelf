package online.eoodin.shelf.security;

import online.eoodin.shelf.dao.UserDAO;
import online.eoodin.shelf.entity.User;
import org.springframework.context.annotation.Profile;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service("userDetailsService")
@Profile("!test")
public class MyUserDetailsService implements UserDetailsService {

    private final UserDAO userRepository;

    public MyUserDetailsService(UserDAO userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        // seed user
        if ("admin".equals(username)) {
            User user = new User();
            user.setUsername("admin");
            user.setPassword("$2a$10$VBvdTax6HTPIJV6L2m9COuwMVNRAf81xCPpE2NGbZKah6xMZhKNae");
            user.setName("Administrator");
            user.setEmail("web@master");
            return new MyUserPrincipal(user);
        }

        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException(username);
        }

        return new MyUserPrincipal(user);
    }
}
