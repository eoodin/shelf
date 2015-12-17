package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.data.HibernateHelper;
import com.nokia.oss.mencius.shelf.model.Project;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/projects")
public class ProjectController {

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
        Project project = em.find(Project.class, id);
        em.remove(project);
        em.getTransaction().commit();

        return "deleted";
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @ResponseBody
    private String createProject(@RequestBody String projectName) {
        EntityManager em = HibernateHelper.createEntityManager();
        em.getTransaction().begin();
        Project project = new Project();
        project.setName(projectName);
        em.persist(project);
        em.getTransaction().commit();
        em.close();
        return "created";
    }
}
