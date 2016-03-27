package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.Allocation;
import com.nokia.oss.mencius.shelf.model.Plan;
import com.nokia.oss.mencius.shelf.model.Project;
import com.nokia.oss.mencius.shelf.model.WorkItem;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

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
    public List<Plan> getPlans(@RequestParam("project") Long projectId) {
        EntityManager em = HibernateHelper.createEntityManager();
        List<Plan> plans = new ArrayList<>();
        Project project = em.find(Project.class, projectId);
        List list = em.createQuery("SELECT p FROM Plan p WHERE p.type = 'sprint' AND p.project=:projectId")
                .setParameter("projectId", project).getResultList();
        plans.addAll(list);

        em.close();
        return plans;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, headers = {"Content-type=application/json"})
    @ResponseBody
    public Plan createPlan(@RequestBody PlanSpec spec) {
        EntityManager em = HibernateHelper.createEntityManager();
        Project project = em.find(Project.class, spec.projectId);
        if (project == null) {
            return null;
        }

        em.getTransaction().begin();
        try {
            Plan plan = new Plan();
            plan.setName(spec.name);
            plan.setType("sprint");
            plan.setStart(spec.start);
            plan.setEnd(spec.end);
            plan.setProject(project);
            em.persist(plan);

            Allocation allocation = new Allocation();
            allocation.setTeam(project.getTeam());
            allocation.setDeveloperHours(spec.devHours);
            allocation.setTesterHours(spec.tstHours);
            allocation.setSprint(plan);

            em.persist(allocation);
            em.getTransaction().commit();
            return plan;
        } catch (Exception ex) {
            em.getTransaction().rollback();
            return null;
        } finally {
            em.close();
        }
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
        } catch (Exception ex) {
            em.getTransaction().rollback();
            return "Failed";
        } finally {
            em.close();
        }

        return "OK";
    }

    public static class PlanSpec {
        public Long projectId;
        public String name;
        public Date start;
        public Date end;
        public Long devHours;
        public Long tstHours;
    }
}
