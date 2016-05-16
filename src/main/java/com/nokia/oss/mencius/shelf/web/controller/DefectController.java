package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.ShelfException;
import com.nokia.oss.mencius.shelf.model.*;
import com.nokia.oss.mencius.shelf.web.NotFoundException;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.servlet.http.HttpServletRequest;
import java.util.Date;

@Controller
@RequestMapping("/defects")
public class DefectController extends WorkItemController {
    @PersistenceContext
    private EntityManager em;


    @Resource(name = "planController")
    private PlanController planController;

    @RequestMapping(value="/{id}/fix", method = RequestMethod.POST)
    @ResponseBody
    @Transactional
    public void startFix(@PathVariable("id") Long id, HttpServletRequest request) throws ShelfException {
        Defect defect = em.find(Defect.class, id);
        if (defect == null)
            throw new NotFoundException("Defect not exist ID=" + id);

        Plan currentSprint = planController.getCurrentSprint(defect.getProject());
        if (currentSprint == null)
            throw new ShelfException("No sprint info found");

        User user = em.find(User.class, request.getRemoteUser());
        defect.setStatus(WorkItem.Status.InProgress);
        defect.setState(Defect.State.Fixing); // to simplify.
        Task fixingTask = new Task();
        fixingTask.setCatalog(Task.Catalog.Development);
        fixingTask.setStatus(WorkItem.Status.InProgress);
        fixingTask.setTitle("Fix #" + defect.getId() + ": "  + defect.getTitle());
        fixingTask.setEstimation(8);
        fixingTask.setProject(defect.getProject());
        fixingTask.setCreatedAt(new Date());
        fixingTask.setDescription("Auto generated task for fixing issue #" + id);
        fixingTask.setOriginalEstimation(8);
        fixingTask.setOwner(user);
        fixingTask.setParent(defect);
        defect.setPlan(currentSprint);
        fixingTask.setPlan(currentSprint);
        em.merge(defect);
        em.persist(fixingTask);
    }

    @RequestMapping(value="/{id}/test", method = RequestMethod.POST)
    @ResponseBody
    @Transactional
    public void startTest(@PathVariable("id") Long id, HttpServletRequest request) throws ShelfException {
        Defect defect = em.find(Defect.class, id);
        if (defect == null)
            throw new NotFoundException("Defect not exist ID=" + id);

        Plan currentSprint = planController.getCurrentSprint(defect.getProject());
        if (currentSprint == null)
            throw new ShelfException("No sprint info found");

        User user = em.find(User.class, request.getRemoteUser());
        defect.setState(Defect.State.Testing); // to simplify.
        Task testingTask = new Task();
        testingTask.setStatus(WorkItem.Status.InProgress);
        testingTask.setCatalog(Task.Catalog.Testing);
        testingTask.setTitle("Test #" + defect.getId() + ": " + defect.getTitle());
        testingTask.setEstimation(8);
        testingTask.setProject(defect.getProject());
        testingTask.setCreatedAt(new Date());
        testingTask.setDescription("Auto generated task for testing issue #" + id);
        testingTask.setOriginalEstimation(8);
        testingTask.setOwner(user);
        testingTask.setParent(defect);
        defect.setPlan(currentSprint);
        testingTask.setPlan(currentSprint);
        em.merge(defect);
        em.persist(testingTask);
    }
}
