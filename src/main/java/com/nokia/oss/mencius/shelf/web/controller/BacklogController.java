package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.Plan;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.Query;

@Controller
@RequestMapping(value = "/backlogs")
public class BacklogController {

    @RequestMapping(value = "/{backlogId}", method = RequestMethod.GET)
    @ResponseBody
    public Plan getBacklog(@PathVariable("backlogId") Long  backlogId) {
        EntityManager em = HibernateHelper.createEntityManager();
        try {
            Query query = em.createQuery("SELECT p FROM Plan p WHERE p.type = 'backlog' AND p.id=:backlogId")
                    .setParameter("backlogId", backlogId);

            return (Plan) query.getSingleResult();
        }
        finally {
            em.close();
        }
    }
}
