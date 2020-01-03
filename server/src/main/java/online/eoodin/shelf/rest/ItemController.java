package online.eoodin.shelf.rest;

import online.eoodin.shelf.dao.WorkItemDAO;
import online.eoodin.shelf.entity.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
public class ItemController {

    private WorkItemDAO workItemDAO;

    @Autowired
    public ItemController(WorkItemDAO workItemDAO) {
        this.workItemDAO = workItemDAO;
    }

    @GetMapping("/items")
    public List<Item> getItems(@RequestParam(value = "page", defaultValue = "1") Integer page) {
        List<Item> list = new ArrayList<>();
        workItemDAO.findAll(PageRequest.of(page - 1, 20)).forEach(list::add);
        return Collections.unmodifiableList(list);
    }
}
