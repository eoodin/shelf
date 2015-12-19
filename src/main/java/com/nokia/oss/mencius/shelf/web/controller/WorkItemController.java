package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.Plan;
import com.nokia.oss.mencius.shelf.model.Project;
import com.nokia.oss.mencius.shelf.model.WorkItem;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import java.util.Set;

@Controller
@RequestMapping("/work-items")
public class WorkItemController {

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    public Set<WorkItem> getWorkItems(@RequestParam("planId") Long planId) {
        Set<WorkItem> list;
        EntityManager em = HibernateHelper.createEntityManager();
        Plan plan = em.find(Plan.class, planId);
        list = plan.getWorkItems();
        list.size(); // force load

        em.close();
        return list;
    }

    @RequestMapping(value="/add")
    @ResponseBody
    public Long addWorkItem(@RequestBody WorkItem wi, @RequestParam("plan") Long planId) {
        EntityManager em = HibernateHelper.createEntityManager();

        try {
            em.getTransaction().begin();
            Plan plan = em.find(Plan.class, planId);
            wi.setPlan(plan);
            em.persist(wi);
            em.getTransaction().commit();
        } catch (Exception ex) {
            em.getTransaction().rollback();
            return 0L;
        }
        finally {
            em.close();
        }

        return wi.getId();
    }
}
