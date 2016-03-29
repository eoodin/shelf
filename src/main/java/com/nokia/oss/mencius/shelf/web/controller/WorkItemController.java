package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.*;
import com.nokia.oss.mencius.shelf.utils.UserUtils;
import com.nokia.oss.mencius.shelf.ShelfException;
import com.nokia.oss.mencius.shelf.web.NotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;

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
                throw new ShelfException("Cannot create work item.");

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
                throw new ShelfException(ex.getMessage());
            }
        }
        finally {
            em.close();
        }
    }

    @RequestMapping(value="/{id}", method = RequestMethod.PUT)
    @ResponseBody
    public void updateItem(
            @PathVariable("id") Long id,
            @RequestBody ItemSpec spec,
            HttpServletRequest request) throws ShelfException {
        EntityManager em = HibernateHelper.createEntityManager();

        try {
            WorkItem item = em.find(WorkItem.class, id);
            if (item == null)
                throw new NotFoundException();

            if (spec.status != null)
                item.setStatus(WorkItem.Status.valueOf(spec.status));

            if (spec.estimation != null)
                item.setEstimation(spec.estimation);

            if (spec.title != null)
                item.setTitle(spec.title);

            if (spec.description != null)
                item.setDescription(spec.description);

            if (spec.ownerId != null)
                item.setOwner(em.find(User.class, spec.ownerId));

            // TODO: add work log
            // User currentUser = UserUtils.findOrCreateUser(request.getRemoteUser());
            em.getTransaction().begin();
            try {
                em.persist(item);
                em.getTransaction().commit();
            } catch (Exception ex) {
                System.err.println("Save status failed, persistence exception caught: " + ex.getMessage());
                em.getTransaction().rollback();
                throw new ShelfException(ex.getMessage());
            }
        }
        finally {
            em.close();
        }
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

    private WorkItem createItem(ItemSpec spec){
        WorkItem workItem;
        switch (spec.type) {
            case "UserStory": // TODO: better way to create instance?
                UserStory userStory = new UserStory();
                userStory.setPoints(Integer.valueOf(spec.points));
                workItem = userStory;
                break;
            case "Defect":
                workItem = new Defect();
                break;
            case "Task":
                workItem = new Task();
                break;
            default:
                return null;
        }

        workItem.setStatus(WorkItem.Status.New);
        Integer estimation = Integer.valueOf(spec.estimation);
        workItem.setOriginalEstimation(estimation);
        workItem.setEstimation(estimation);
        workItem.setTitle(spec.title.trim());
        workItem.setDescription(spec.description);

        return workItem;
    }

    static class ItemSpec {
        public Long projectId;
        public Long planId;
        public String ownerId;
        public String type;
        public String title;
        public String description;
        public Integer estimation;
        public String points;
        public String status;
    }

    public static class WorkItemList extends ArrayList<WorkItem> {

    }
}
