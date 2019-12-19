package online.eoodin.shelf.rest;

import online.eoodin.shelf.dao.WorkItemDAO;
import online.eoodin.shelf.entity.Item;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ItemController.class)
@WithMockCustomUser(username = "admin", roles = {"ROLE_USER", "ROLE_ADMIN"})
@ActiveProfiles("test")
public class ItemControllerTest {
    @Autowired
    private MockMvc mvc;

    @MockBean
    WorkItemDAO workItemDAO;

    @Test
    public void test() throws Exception {
        Page<Item> page = new PageImpl<>(Arrays.asList(
                new Item(1L, "test1"),
                new Item(2L, "test1")));
        given(workItemDAO.findAll(PageRequest.of(0, 20))).willReturn(page);
        mvc.perform(get("/items").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id", org.hamcrest.CoreMatchers.is(1)));
    }

}
