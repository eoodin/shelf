package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.User;
import com.nokia.oss.mencius.shelf.web.security.UnAuthorizedException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/users")
public class UserController {

    @RequestMapping(value = "/me", method = RequestMethod.GET)
    @ResponseBody
    public UserInfo getPlans(HttpServletRequest request) throws UnAuthorizedException {
        String remoteUser = request.getRemoteUser();
        if (null == remoteUser || remoteUser.isEmpty())
            throw new UnAuthorizedException();

        User user = findOrCreateUser(remoteUser);
        UserInfo userInfo = new UserInfo();
        userInfo.setName(user.getName());
        userInfo.setUserId(user.getUserId());
        userInfo.setEmail(user.getEmail());

        return userInfo;
    }

    private User findOrCreateUser(String remoteUser) {
        User user;EntityManager em = HibernateHelper.createEntityManager();
        List users = em.createQuery("SELECT u from User u WHERE u.userId LIKE :userId")
                .setParameter("userId", remoteUser)
                .getResultList();

        if (users.isEmpty()) {
            user = new User();
//            TODO: find extra information from other system.
//            Object extraUserInfo = getExtraUserInfo();
//            user.setName(extraUserInfo.getName());
//            user.setEmail(extraUserInfo.getEmail());
            em.getTransaction().begin();
            try {
                user.setName("Administrator");
                user.setEmail("admin@localhost");
                user.setUserId(remoteUser);
                user.setCreatedAt(new Date());
                em.persist(user);
                em.getTransaction().commit();
            }
            catch (Exception ex) {
                em.getTransaction().rollback();
                throw ex;
            }
        }
        else {
            user = (User) users.get(0);
        }
        return user;
    }

    public static class UserInfo {
        private String userId;
        private String name;
        private String email;

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public void setName(String name) {
            this.name = name;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getUserId() {
            return userId;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }
    }
}
