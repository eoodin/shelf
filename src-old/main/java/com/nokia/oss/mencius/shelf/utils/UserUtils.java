package com.nokia.oss.mencius.shelf.utils;

import com.nokia.oss.mencius.shelf.ShelfException;
import com.nokia.oss.mencius.shelf.model.User;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.*;

public class UserUtils {
    public static User findOrCreateUser(EntityManager em, String userId) throws ShelfException {
        Collection<User> users = findOrCreateUsers(em, userId);
        return users.iterator().next();
    }

    public static Collection<User> findOrCreateUsers(EntityManager em, String... userIds) throws ShelfException {
        String sql = "SELECT u FROM User u WHERE u.userId IN :ids";
        TypedQuery<User> query = em.createQuery(sql, User.class).setParameter("ids", Arrays.asList(userIds));

        List<User> list = query.getResultList();

        Map<String, User> id2Users = new HashMap<>();
        for (User u : list) {
            id2Users.put(u.getUserId(), u);
        }

        for (String userId : userIds) {
            if (id2Users.containsKey(userId))
                continue;

            User newUser = createUser(userId);
            em.persist(newUser);
            list.add(newUser);
            id2Users.put(userId, newUser);
        }

        return list;
    }

    private static User createUser(String userId) {
        User newUser = new User();
        newUser.setName("Administrator");   // TODO: find extra information from other system.
        newUser.setEmail("admin@localhost");
        newUser.setUserId(userId);
        newUser.setCreatedAt(new Date());

        return newUser;
    }
}
