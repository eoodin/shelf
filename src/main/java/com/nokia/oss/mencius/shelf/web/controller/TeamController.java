package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.ShelfException;
import com.nokia.oss.mencius.shelf.model.Team;
import com.nokia.oss.mencius.shelf.model.User;
import com.nokia.oss.mencius.shelf.utils.UserUtils;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/teams")
public class TeamController {
    @PersistenceContext
    private EntityManager em;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    @Transactional
    public List<Team> getTeams() {
        List<Team> teams = new ArrayList<>();
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Team> cq = cb.createQuery(Team.class);
        Root<Team> team = cq.from(Team.class);
        cq.select(team);
        List<Team> list = em.createQuery(cq).getResultList();
        for (Team t : list) {
            t.getScrumMaster();
            t.getMembers().size();
            t.getCreatedBy();
        }

        teams.addAll(list);

        return teams;
    }

    @RequestMapping(value = "/{teamId}/members", method = RequestMethod.GET)
    @ResponseBody
    @Transactional
    public List<User> getMembers(@PathVariable("teamId") Long teamId) {
        Team team = em.find(Team.class, teamId);
        return new ArrayList<>(team.getMembers());
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, headers = {"Content-type=application/json"})
    @ResponseBody
    @Transactional
    public Team createTeam(@RequestBody TeamSpec spec, HttpServletRequest request) throws ShelfException {
        Collection<User> users = UserUtils.findOrCreateUsers(em, spec.getUsers());
        User scrumMaster = UserUtils.findOrCreateUser(em, spec.getScrumMaster());
        User currentUser = UserUtils.findOrCreateUser(em, request.getRemoteUser());

        Team team = new Team();
        team.setName(spec.getName());
        team.setCreatedAt(new Date());
        team.setMembers(users);
        team.setScrumMaster(scrumMaster);
        team.setCreatedBy(currentUser);
        em.persist(team);

        return team;
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    @ResponseBody
    @Transactional
    public String deleteTeam(@PathVariable("id") Long teamId) {
        Team team = em.find(Team.class, teamId);
        em.remove(team);
        return "ok";
    }


    public static class TeamSpec {
        private String name;
        private String[] users;
        private String scrumMaster;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String[] getUsers() {
            return users;
        }

        public void setUsers(String[] users) {
            this.users = users;
        }

        public String getScrumMaster() {
            return scrumMaster;
        }

        public void setScrumMaster(String scrumMaster) {
            this.scrumMaster = scrumMaster;
        }
    }
}
