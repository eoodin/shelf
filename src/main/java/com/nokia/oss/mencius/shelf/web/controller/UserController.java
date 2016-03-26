package com.nokia.oss.mencius.shelf.web.controller;

import com.nokia.oss.mencius.shelf.model.User;
import com.nokia.oss.mencius.shelf.utils.UserUtils;
import com.nokia.oss.mencius.shelf.web.security.ShelfException;
import com.nokia.oss.mencius.shelf.web.security.UnAuthorizedException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;

@Controller
@RequestMapping("/users")
public class UserController {

    @RequestMapping(value = "/me", method = RequestMethod.GET)
    @ResponseBody
    public UserInfo getPlans(HttpServletRequest request) throws ShelfException {
        String remoteUser = request.getRemoteUser();
        if (null == remoteUser || remoteUser.isEmpty())
            throw new UnAuthorizedException();

        User user = UserUtils.findOrCreateUser(remoteUser);
        UserInfo userInfo = new UserInfo();
        userInfo.setName(user.getName());
        userInfo.setUserId(user.getUserId());
        userInfo.setEmail(user.getEmail());

        return userInfo;
    }



    public static class UserInfo {
        private String userId;
        private String name;
        private String email;

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public void setName(String name) {
            this.name = name;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getUserId() {
            return userId;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }
    }
}
