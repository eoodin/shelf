package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.ShelfException;
import com.nokia.oss.mencius.shelf.model.User;
import com.nokia.oss.mencius.shelf.model.UserPreference;
import com.nokia.oss.mencius.shelf.utils.UserUtils;
import com.nokia.oss.mencius.shelf.web.NotFoundException;
import com.nokia.oss.mencius.shelf.web.security.UnAuthorizedException;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/users")
public class UserController {
    @PersistenceContext
    private EntityManager em;

    @RequestMapping(value = "/me", method = RequestMethod.GET)
    @ResponseBody
    @Transactional
    public User getPlans(HttpServletRequest request) throws ShelfException {
        String remoteUser = request.getRemoteUser();
        if (null == remoteUser || remoteUser.isEmpty())
            throw new UnAuthorizedException();

        return UserUtils.findOrCreateUser(em, remoteUser);
    }


    @RequestMapping(value = "/{id}/preferences", method = RequestMethod.GET)
    @ResponseBody
    @Transactional
    public Map<String, String> getPreference(@PathVariable("id") String userId, HttpServletRequest request)
            throws UnAuthorizedException {
        String remoteUser = request.getRemoteUser();
        if (remoteUser == null || !remoteUser.equals(userId))
            throw new UnAuthorizedException();

        User user = em.find(User.class, userId);
        Map<String, String> map = new HashMap<>();
        for (UserPreference preference : user.getPreferences())
            map.put(preference.getName(), preference.getValue());

        return map;
    }

    @RequestMapping(value = "/{id}/preferences", method = RequestMethod.PUT)
    @ResponseBody
    @Transactional
    public void setPreference(@PathVariable("id") String userId,
                              HttpServletRequest request,
                              @RequestParam String name,
                              @RequestParam(required = false) String value)
            throws UnAuthorizedException, NotFoundException {
        String remoteUser = request.getRemoteUser();
        if (remoteUser == null || !remoteUser.equals(userId))
            throw new UnAuthorizedException();

        User user = em.find(User.class, userId);
        String sql = "SELECT p FROM UserPreference p WHERE p.user=:user AND p.name=:name";
        TypedQuery<UserPreference> query = em.createQuery(sql, UserPreference.class);
        query.setParameter("user", user);
        query.setParameter("name", name);
        List<UserPreference> results = query.getResultList();

        UserPreference preference = results.isEmpty() ? createPreference(user, name) : results.get(0);

        if (results.isEmpty() || preference.getValue() == null || !preference.getValue().equals(value)) {
            preference.setValue(value);
            preference.setChangedAt(new Date());
            em.merge(preference);
        }
    }

    private UserPreference createPreference(User user, String name) {
        UserPreference preference = new UserPreference();
        preference.setUser(user);
        preference.setName(name);
        preference.setCreatedAt(new Date());
        return preference;
    }


    public static class UserInfo {
        private String userId;
        private String name;
        private String email;

        public UserInfo(User user) {
            name = user.getName();
            userId = user.getUserId();
            email = user.getEmail();
        }

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
