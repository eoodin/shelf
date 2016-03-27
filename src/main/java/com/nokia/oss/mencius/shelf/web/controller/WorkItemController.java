package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.*;
import com.nokia.oss.mencius.shelf.utils.UserUtils;
import com.nokia.oss.mencius.shelf.web.security.ShelfException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/work-items")
public class WorkItemController {

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public WorkItemList getWorkItems(@RequestParam("planId") Long planId) {
        WorkItemList list = new WorkItemList();
        EntityManager em = HibernateHelper.createEntityManager();
        Plan plan = em.find(Plan.class, planId);
        list.addAll(plan.getWorkItems());
        em.close();
        return list;
    }

    @RequestMapping(value="/", method = RequestMethod.POST)
    @ResponseBody
    public Long addWorkItem(@RequestBody ItemSpec spec, HttpServletRequest request) throws ShelfException {
        EntityManager em = HibernateHelper.createEntityManager();

        try {
            Plan plan = em.find(Plan.class, spec.planId);
            if (plan == null) {
                Project project = em.find(Project.class, spec.projectId);
                plan = project.getBacklog();
            }

            WorkItem wi = createItem(spec);
            if (wi == null)
                return -1L;

            User currentUser = UserUtils.findOrCreateUser(request.getRemoteUser());
            em.getTransaction().begin();
            try {
                wi.setCreatedBy(currentUser);
                wi.setOwner(currentUser);
                wi.setPlan(plan);
                em.persist(wi);
                em.getTransaction().commit();
                return wi.getId();
            } catch (Exception ex) {
                System.err.println("Save status failed, persistence exception caught: " + ex.getMessage());
                em.getTransaction().rollback();
            }

        }
        finally {
            em.close();
        }

        return -1L;
    }

    @RequestMapping(value = "/{wiid}", method = RequestMethod.DELETE)
    @ResponseBody
    public boolean removeWorkItem(@PathVariable("wiid") Long wiid) {
        EntityManager em = HibernateHelper.createEntityManager();
        try {
            WorkItem wi = em.find(WorkItem.class, wiid);
            if (wi == null)
                return false;

            em.getTransaction().begin();
            try {
                em.remove(wi);
                em.getTransaction().commit();
                return true;
            } catch (Exception ex) {
                System.err.println("Save status failed, persistence exception caught: " + ex.getMessage());
                em.getTransaction().rollback();
            }
        }
        finally {
            em.close();
        }

        return false;
    }

    @RequestMapping(value = "/{wiid}", method = RequestMethod.PUT)
    @ResponseBody
    public boolean changeStatus(@PathVariable("wiid") Long wiid, @RequestBody ChangeSpec spec) {
        EntityManager em = HibernateHelper.createEntityManager();
        try {
            em.getTransaction().begin();
            WorkItem wi = em.find(WorkItem.class, wiid);
            if (wi == null)
                return false;

            if (spec.status != null)
                wi.setStatus(WorkItem.Status.valueOf(spec.status));

            if (spec.ownerId != null)
                wi.setOwner(em.find(User.class, spec.ownerId));

            em.merge(wi);
            em.getTransaction().commit();
        }
        catch (Exception ex) {
            System.err.println("Save status failed, persistence exception caught: " + ex.getMessage());
            em.getTransaction().rollback();
            return false;
        }
        finally {
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
        public Long projectId;
        public Long planId;
        public String type;
        public String title;
        public String description;
        public String estimation;
        public String points;
    }

    static class ChangeSpec {
        public String ownerId;
        public String status;
    }

    public static class WorkItemList extends ArrayList<WorkItem> {

    }
}
