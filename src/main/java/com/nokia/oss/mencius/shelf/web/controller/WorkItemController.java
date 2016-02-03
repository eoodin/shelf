package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

@Controller
@RequestMapping("/work-items")
public class WorkItemController {

    @RequestMapping(value = "/list", method = RequestMethod.GET)
    @ResponseBody
    public List<WorkItem> getWorkItems(@RequestParam("planId") Long planId) {
        List<WorkItem> list;
        EntityManager em = HibernateHelper.createEntityManager();
        Plan plan = em.find(Plan.class, planId);
        list = plan.getWorkItems();
        list.size(); // force load
        em.close();
        for (WorkItem item : list) {
            item.setTitle(item.getTitle());
        }

        return list;
    }

    @RequestMapping(value="/add")
    @ResponseBody
    public Long addWorkItem(@RequestBody ItemSpec is, @RequestParam("plan") Long planId) {
        EntityManager em = HibernateHelper.createEntityManager();

        Plan plan = em.find(Plan.class, planId);
        if (plan == null)
            return -1L;

        WorkItem wi = createItem(is);
        if (wi == null)
            return -1L;

        em.getTransaction().begin();
        try {
            wi.setPlan(plan);
            em.persist(wi);
            em.getTransaction().commit();
            return wi.getId();
        } catch (Exception ex) {
            System.err.println("Save status failed, persistence exception caught: " + ex.getMessage());
            em.getTransaction().rollback();
        } finally {
            em.close();
        }

        return -1L;
    }

    @RequestMapping(value = "/{wiid}", method = RequestMethod.DELETE)
    @ResponseBody
    public boolean removeWorkItem(@PathVariable("wiid") Long wiid) {
        EntityManager em = HibernateHelper.createEntityManager();
        WorkItem wi = em.find(WorkItem.class, wiid);
        if (wi == null)
            return false;
        em.remove(wi);

        return true;
    }

    @RequestMapping(value = "/{wiid}/status", method = RequestMethod.PUT)
    @ResponseBody
    public boolean changeStatus(@PathVariable("wiid") Long wiid, @RequestBody String status) {
        EntityManager em = HibernateHelper.createEntityManager();
        WorkItem wi = em.find(WorkItem.class, wiid);
        if (wi == null)
            return false;

        wi.setStatus(WorkItem.Status.valueOf(status));
        em.getTransaction().begin();
        try {
            em.merge(wi);
            em.getTransaction().commit();
        } catch (Exception ex) {
            System.err.println("Save status failed, persistence exception caught: " + ex.getMessage());
            em.getTransaction().rollback();
        } finally {
            em.close();
        }

        return true;
    }

    private WorkItem createItem(ItemSpec spec){
        WorkItem workItem;
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
            default:
                return null;
        }

        workItem.setStatus(WorkItem.Status.New);
        workItem.setEstimation(Integer.valueOf(spec.estimation));
        workItem.setTitle(spec.title.trim());
        workItem.setDescription(spec.description);

        return workItem;
    }

    static class ItemSpec {
        public String type;
        public String title;
        public String description;
        public String estimation;
        public String points;
    }
}
