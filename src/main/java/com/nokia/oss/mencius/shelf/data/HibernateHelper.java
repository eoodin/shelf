package com.nokia.oss.mencius.shelf.data;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class HibernateHelper {
    private static EntityManagerFactory EM_FACTORY;

    public static EntityManager createEntityManager() {
        return getEntityManagerFactory().createEntityManager();
    }

    synchronized private static EntityManagerFactory getEntityManagerFactory() {
        if (EM_FACTORY == null) {
            EM_FACTORY = Persistence.createEntityManagerFactory("shelf-storage");
        }

        return EM_FACTORY;
    }
}
