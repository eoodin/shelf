package com.nokia.oss.mencius.shelf.web.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.*;
import com.nokia.oss.mencius.shelf.utils.UserUtils;
import com.nokia.oss.mencius.shelf.ShelfException;
import com.nokia.oss.mencius.shelf.web.NotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.servlet.http.HttpServletRequest;
import java.util.*;

@Controller
@RequestMapping("/work-items")
public class WorkItemController {

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public WorkItemList getWorkItems(
            @RequestParam(value = "planId", required = false) Long planId,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @RequestParam(value = "desc", required = false) boolean desc) {
        WorkItemList list = new WorkItemList();
        EntityManager em = HibernateHelper.createEntityManager();
        Plan plan = em.find(Plan.class, planId);

        String jpql = "SELECT w FROM WorkItem w WHERE w.plan=:plan";
        if (sortBy != null) {
            jpql += " ORDER BY w." + sortBy;
            if (desc) {
                jpql += " DESC";
            }
        }

        List results = em.createQuery(jpql).setParameter("plan", plan).getResultList();
        list.addAll(results);
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

            Changes changes = new Changes();
            if (spec.status != null) {
                WorkItem.Status status = WorkItem.Status.valueOf(spec.status);
                if (changes.addChange("status", item.getStatus(), status))
                    item.setStatus(status);
            }

            if (spec.estimation != null)
                if (changes.addChange("estimation", item.getEstimation(), spec.estimation)) {
                    item.setEstimation(spec.estimation);
                    if (spec.estimation == 0)
                        item.setStatus(WorkItem.Status.Finished);
                }

            if (spec.title != null)
                if (changes.addChange("title", item.getTitle(), spec.title))
                    item.setTitle(spec.title);

            if (spec.description != null)
                if(changes.addChange("description", item.getDescription(), spec.description))
                    item.setDescription(spec.description);

            if (spec.ownerId != null)
                if (changes.addChange("owner", item.getOwner().getUserId(), spec.ownerId))
                    item.setOwner(em.find(User.class, spec.ownerId));

            User currentUser = UserUtils.findOrCreateUser(request.getRemoteUser());
            em.getTransaction().begin();
            try {
                em.persist(item);

                ChangeLog changeLog = new ChangeLog();
                changeLog.setActor(currentUser);
                changeLog.setOriginalData(changes.getOldJson());
                changeLog.setChangedData(changes.getNewJson());
                changeLog.setItem(item);
                changeLog.setChangeTime(new Date());
                em.persist(changeLog);

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
                Defect defect = new Defect();
                defect.setSeverity(Defect.Severity.valueOf(spec.severity));
                workItem = defect;
                break;
            case "Task":
                workItem = new Task();
                break;
            default:
                return null;
        }

        workItem.setStatus(WorkItem.Status.New);
        if (spec.estimation != null) {
            Integer estimation = Integer.valueOf(spec.estimation);
            workItem.setOriginalEstimation(estimation);
            workItem.setEstimation(estimation);
        }
        workItem.setTitle(spec.title.trim());
        workItem.setDescription(spec.description);
        workItem.setCreatedAt(new Date());

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
        public String severity;
    }

    public static class WorkItemList extends ArrayList<WorkItem> { }

    static class Changes {
        Map<String, Object> oldValues = new HashMap<>();
        Map<String, Object> newValues = new HashMap<>();

        private static final ObjectMapper jsonMapper = new ObjectMapper();


        public boolean addChange(String field, Object oldVal, Object newVal) {
            if (oldVal == null && newVal == null)
                return false;

            if ((oldVal != null && oldVal.equals(newVal)) || (newVal != null && newVal.equals(oldVal)))
                return false;

            oldValues.put(field, oldVal);
            newValues.put(field, newVal);
            return true;
        }

        public String getOldJson() throws JsonProcessingException {
            return jsonMapper.writeValueAsString(oldValues);
        }

        public String getNewJson() throws JsonProcessingException {
            return jsonMapper.writeValueAsString(newValues);
        }
    }
}
