package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.Plan;
import com.nokia.oss.mencius.shelf.model.Project;
import com.nokia.oss.mencius.shelf.model.Team;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import static java.util.logging.Logger.getLogger;

@Controller
@RequestMapping("/projects")
public class ProjectController {
    private static final Logger LOG = getLogger(ProjectController.class.getName());


    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    private List<Project> listProjects() {
        EntityManager em = HibernateHelper.createEntityManager();
        List<Project> projects = new ArrayList<Project>();

        List list = em.createQuery("select p from Project p").getResultList();
        em.close();

        projects.addAll(list);
        return projects;
    }

    @RequestMapping(value = "/{projectId}", method = RequestMethod.DELETE)
    @ResponseBody
    private String deleteProject(@PathVariable String projectId) {
        Long id = Long.valueOf(projectId);
        EntityManager em = HibernateHelper.createEntityManager();
        em.getTransaction().begin();
        try {
            Project project = em.find(Project.class, id);
            em.remove(project);
            em.getTransaction().commit();
        } catch (Exception ex) {
            LOG.log(Level.SEVERE, "Unable to delete project due to exception: " + ex.getMessage(), ex);
            em.getTransaction().rollback();
            return "failed";
        } finally {
            em.close();
        }

        return "deleted";
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @ResponseBody
    private String createProject(@RequestBody ProjectSpec spec) {
        EntityManager em = HibernateHelper.createEntityManager();
        em.getTransaction().begin();
        try {
            Project project = new Project();
            project.setName(spec.projectName);
            Plan backlog = new Plan();
            backlog.setName("Product backlog");
            backlog.setType("backlog");
            backlog.setProject(project);
            em.persist(backlog);

            project.setBacklog(backlog);
            Team team = em.find(Team.class, spec.teamId);
            project.setTeam(team);

            em.persist(project);
            em.getTransaction().commit();
        } catch (Exception ex) {
            LOG.log(Level.SEVERE, "Unable to create project due to exception: " + ex.getMessage(), ex);
            em.getTransaction().rollback();
            return "failed";
        } finally {
            em.close();
        }

        return "created";
    }

    public static class ProjectSpec {
        public String projectName;
        public Long teamId;
    }
}
