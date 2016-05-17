package com.nokia.oss.mencius.shelf.web.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nokia.oss.mencius.shelf.ShelfException;
import com.nokia.oss.mencius.shelf.model.*;
import com.nokia.oss.mencius.shelf.utils.UserUtils;
import com.nokia.oss.mencius.shelf.web.NotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.persistence.metamodel.SingularAttribute;
import javax.servlet.http.HttpServletRequest;
import java.util.*;

@Controller
@RequestMapping("/work-items")
public class WorkItemController {
    @PersistenceContext
    private EntityManager em;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    @Transactional
    public WorkItemList getWorkItems(
            @RequestParam(value = "planId", required = false) Long planId,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            @RequestParam(value = "desc", required = false) boolean desc) {
        WorkItemList list = new WorkItemList();
        Plan plan = em.find(Plan.class, planId);
        String jpql = "SELECT w FROM WorkItem w WHERE w.plan=:plan AND w.status <> :status";
        if (sortBy != null) {
            jpql += " ORDER BY w." + sortBy;
            if (desc) {
                jpql += " DESC";
            }
        }

        List results = em.createQuery(jpql)
                .setParameter("plan", plan)
                .setParameter("status", WorkItem.Status.Removed)
                .getResultList();
        list.addAll(results);

        return list;
    }

    @RequestMapping(value="/", method = RequestMethod.POST)
    @ResponseBody
    @Transactional
    public Long addWorkItem(@RequestBody ItemSpec spec, HttpServletRequest request) throws ShelfException {
        if (spec.planId == 0 && spec.projectId == 0)
            throw new ShelfException("Unable to determine realm for work item.");

        WorkItem wi = createItem(spec);
        if (wi == null)
            throw new ShelfException("Cannot create work item.");

        User currentUser = UserUtils.findOrCreateUser(em, request.getRemoteUser());
        wi.setCreatedBy(currentUser);
        wi.setOwner(currentUser);
        Plan plan = em.find(Plan.class, spec.planId);
        wi.setPlan(plan);
        Project project = plan != null ? plan.getProject() : em.find(Project.class, spec.projectId);
        wi.setProject(project);
        em.persist(wi);

        return wi.getId();
    }

    @RequestMapping(value="/{id}", method = RequestMethod.PUT)
    @ResponseBody
    @Transactional
    public void updateItem(
            @PathVariable("id") Long id,
            @RequestBody ItemSpec spec,
            HttpServletRequest request) throws ShelfException, JsonProcessingException {
        WorkItem item = em.find(WorkItem.class, id);
        if (item == null) {
            throw new NotFoundException();
        }

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
            if (changes.addChange("description", item.getDescription(), spec.description))
                item.setDescription(spec.description);

        if (spec.ownerId != null) {
            User owner = item.getOwner();
            if (changes.addChange("owner", owner == null ? 0L : owner.getUserId(), spec.ownerId))
                item.setOwner(em.find(User.class, spec.ownerId));
        }

        User currentUser = UserUtils.findOrCreateUser(em, request.getRemoteUser());


        em.persist(item);

        ChangeLog changeLog = new ChangeLog();
        changeLog.setActor(currentUser);
        changeLog.setOriginalData(changes.getOldJson());
        changeLog.setChangedData(changes.getNewJson());
        changeLog.setItem(item);
        changeLog.setChangeTime(new Date());

        em.persist(changeLog);
    }

    @RequestMapping(value = "/{wiid}", method = RequestMethod.DELETE)
    @ResponseBody
    @Transactional
    public boolean removeWorkItem(@PathVariable("wiid") Long wiid) {
        WorkItem wi = em.find(WorkItem.class, wiid);
        if (wi == null)
            return false;

        wi.setStatus(WorkItem.Status.Removed);
        em.merge(wi);
        return true;
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
        public long projectId;
        public long planId;
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
