package online.eoodin.shelf.e2e;

import online.eoodin.shelf.entity.Item;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class ItemTest {
    /*
    @MockBean
    private RemoteService remoteService;

    @Test
    public void test() {
        org.mockito.BDDMockito.given(remoteService.someCall()).willReturn("mock");
        // act
        // asert
    }
     */

    @Test
    public void test(@Autowired TestRestTemplate restTemplate) throws Exception {
        List<Item> items = restTemplate.getForObject("/items", List.class);
        assertThat(items).hasSize(2);
    }


}
