package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.Plan;
import com.nokia.oss.mencius.shelf.model.Project;
import com.nokia.oss.mencius.shelf.model.WorkItem;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import java.lang.annotation.RetentionPolicy;
import java.util.ArrayList;
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
        plan.setType(spec.getType());
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

    public static class PlanSpec {
        private Long projectId;
        private String name;
        private String type;

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

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String toString() {
            return "[name:" + name + ",type:" + type + "]";
        }
    }
}
