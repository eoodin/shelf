package com.nokia.oss.mencius.shelf.utils;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.User;
import com.nokia.oss.mencius.shelf.ShelfException;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import java.util.*;

public class UserUtils {
    public static User findOrCreateUser(String userId) throws ShelfException {
        Collection<User> users = findOrCreateUsers(userId);
        return users.iterator().next();
    }

    public static Collection<User> findOrCreateUsers(String ... userIds) throws ShelfException {
        EntityManager em = HibernateHelper.createEntityManager();

        String sql = "SELECT u FROM User u WHERE u.userId IN :ids";
        TypedQuery<User> query = em.createQuery(sql, User.class).setParameter("ids", Arrays.asList(userIds));

        List<User> list = query.getResultList();

        Map<String, User> id2Users = new HashMap<>();
        for (User u : list) {
            id2Users.put(u.getUserId(), u);
        }

        em.getTransaction().begin();
        try {
            for (String userId : userIds) {
                if (id2Users.containsKey(userId))
                    continue;

                User newUser = createUser();

                newUser.setUserId(userId);
                newUser.setCreatedAt(new Date());

                em.persist(newUser);
                list.add(newUser);
            }
            em.getTransaction().commit();
        }
        catch (Exception ex) {
            em.getTransaction().rollback();
            throw new ShelfException("Unable to create users", ex);
        }
        finally {
            em.close();
        }

        return list;
    }

    private static User createUser() {
        User newUser = new User();

        newUser.setName("Administrator");   // TODO: find extra information from other system.
        newUser.setEmail("admin@localhost");
        return newUser;
    }
}
