package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.Plan;
import com.nokia.oss.mencius.shelf.model.Project;
import com.nokia.oss.mencius.shelf.model.WorkItem;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/plans")
public class PlanController {

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public List<Plan> getPlans(@RequestParam("project") String projectId) {
        EntityManager em = HibernateHelper.createEntityManager();
        List<Plan> plans = new ArrayList<>();
        List list = em.createQuery("select p from Plan p where p.project=" + projectId).getResultList();
        plans.addAll(list);

        em.close();
        return plans;
    }

    @RequestMapping(value = "/{planId}", method = RequestMethod.DELETE)
    @ResponseBody
    public String deletePlan(@PathVariable String planId) {
        Long id = Long.valueOf(planId);

        EntityManager em = HibernateHelper.createEntityManager();
        em.getTransaction().begin();
        Plan plan = em.find(Plan.class, id);
        em.remove(plan);
        em.getTransaction().commit();
        em.close();

        return "deleted";
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, headers = {"Content-type=application/json"})
    @ResponseBody
    public Plan createPlan(@RequestBody PlanSpec spec) {
        EntityManager em = HibernateHelper.createEntityManager();
        Project project = em.find(Project.class, spec.getProjectId());
        if (project == null) {
            return null;
        }

        em.getTransaction().begin();
        Plan plan = new Plan();
        plan.setName(spec.getName());
        plan.setType("sprint");
        plan.setStart(spec.getStart());
        plan.setEnd(spec.getEnd());
        plan.setProject(project);
        em.persist(plan);
        em.getTransaction().commit();
        em.close();

        return plan;
    }

    @RequestMapping(value="/{planId}/add_wi", method = RequestMethod.POST)
    @ResponseBody
    public String addWorkItem(@PathVariable Long planId, @RequestParam("wiid")Long wiid){
        EntityManager em = HibernateHelper.createEntityManager();
        Plan plan = em.find(Plan.class, planId);
        if (plan == null)
            return "plan not exist";

        WorkItem workItem = em.find(WorkItem.class, wiid);
        if (workItem == null)
            return "work item not exist";

        em.getTransaction().begin();
        workItem.setPlan(plan);
        em.merge(workItem);
        em.getTransaction().commit();
        em.close();

        return "OK";
    }

    @RequestMapping(value = "/{planId}/move-in", method = RequestMethod.POST, consumes = "application/json")
    @ResponseBody
    public String moveIn(@PathVariable Long planId, @RequestBody String[] ids) {
        EntityManager em = HibernateHelper.createEntityManager();
        Plan plan = em.find(Plan.class, planId);
        if (plan == null)
            return "plan not exist";

        List<Long> wiIds = new ArrayList<>(ids.length);
        for (String id : ids) {
            wiIds.add(Long.valueOf(id));
        }

        Query query = em.createQuery("SELECT wi FROM WorkItem wi WHERE wi.id IN :ids", WorkItem.class);
        query.setParameter("ids", wiIds);
        List result = query.getResultList();

        em.getTransaction().begin();
        try {
            for (Object wi : result) {
                ((WorkItem) wi).setPlan(plan);
            }

            em.getTransaction().commit();
        }
        catch (Exception ex) {
            em.getTransaction().rollback();
            return "Failed";
        }
        finally {
            em.close();
        }

        return "OK";
    }

    public static class PlanSpec {
        private Long projectId;
        private String name;
        private Date start;
        private Date end;

        public Long getProjectId() {
            return projectId;
        }

        public void setProjectId(Long projectId) {
            this.projectId = projectId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Date getStart() {
            return start;
        }

        public void setStart(Date start) {
            this.start = start;
        }

        public Date getEnd() {
            return end;
        }

        public void setEnd(Date end) {
            this.end = end;
        }

        public String toString() {
            return "[name:" + name + ",start:" + start + ",end:" + end + "]";
        }
    }
}
