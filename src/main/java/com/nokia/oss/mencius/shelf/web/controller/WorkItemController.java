package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.*;
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
    public Long addWorkItem(@RequestBody ItemSpec is, @RequestParam("plan") Long planId) {
        EntityManager em = HibernateHelper.createEntityManager();
        Long addedId = -1L;

        try {
            em.getTransaction().begin();
            Plan plan = em.find(Plan.class, planId);
            WorkItem wi = createItem(is);
            wi.setPlan(plan);
            em.persist(wi);
            addedId = wi.getId();
            em.getTransaction().commit();
        } catch (Exception ex) {
            // TODO:  log exception & notify rolled back.
            em.getTransaction().rollback();
            return 0L;
        }
        finally {
            em.close();
        }

        return addedId;
    }

    @RequestMapping(value = "/{wiid}", method = RequestMethod.DELETE)
    @ResponseBody
    public boolean removeWorkItem(@PathVariable("wiid") Long wiid) {
        EntityManager em = HibernateHelper.createEntityManager();

        try {
            em.getTransaction().begin();
            WorkItem wi = em.find(WorkItem.class, wiid);
            em.remove(wi);
            em.getTransaction().commit();
        } catch (Exception ex) {
            // TODO:  log exception & notify rolled back.
            em.getTransaction().rollback();
            return false;
        } finally {
            em.close();
        }

        return true;
    }

    private WorkItem createItem(ItemSpec spec) throws UnkownWorkItemTypeException {
        WorkItem workItem = null;
        String typeName = spec.type.toUpperCase().trim();
        switch (typeName) {
            case "US": // TODO: better way to create instance?
                UserStory userStory = new UserStory();
                userStory.setPoints(Integer.valueOf(spec.points));
                workItem = userStory;
                break;
            case "DE":
                workItem = new Defect();
                break;
            case "TA":
                workItem = new Task();
                break;
        }

        if (workItem == null)
            throw new UnkownWorkItemTypeException(spec.type);

        workItem.setStatus(WorkItem.Status.New);
        workItem.setEstimation(Integer.valueOf(spec.estimation));
        workItem.setTitle(spec.title.trim());
        workItem.setDescription(spec.description);

        return workItem;
    }

    public class UnkownWorkItemTypeException extends Exception {
        public UnkownWorkItemTypeException(String type) {
            super("Unkown type given: " + type);
        }
    }

    static class ItemSpec {
        public String type;
        public String title;
        public String description;
        public String estimation;
        public String points;
    }
}
