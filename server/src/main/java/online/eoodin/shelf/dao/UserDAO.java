package online.eoodin.shelf.dao;

import online.eoodin.shelf.entity.User;
import org.springframework.data.jpa.repository.support.JpaRepositoryImplementation;

public interface UserDAO extends JpaRepositoryImplementation<User, Long> {
    User findByUsername(String username);
}
