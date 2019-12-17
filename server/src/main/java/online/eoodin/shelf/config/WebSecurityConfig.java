package online.eoodin.shelf.config;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository;

@EnableWebSecurity
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    private HttpSessionCsrfTokenRepository tokenRepository = new HttpSessionCsrfTokenRepository();

    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withDefaultPasswordEncoder()
                .username("user")
                .password("password")
                .roles("USER")
                .build();
        return new InMemoryUserDetailsManager(user);
    }

    @Bean
    public CsrfTokenRepository tokenRepository() {
        return tokenRepository;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.authorizeRequests().antMatchers("/profile").permitAll();
        http.authorizeRequests().antMatchers("/**").hasRole("USER").and().formLogin()
                .usernameParameter("username")
                .passwordParameter("password")
//                .loginPage("/login")
//                .failureUrl("/login?failed")
                .loginProcessingUrl("/authenticate");
        http.csrf(csrf -> csrf.csrfTokenRepository(tokenRepository));
    }
}
