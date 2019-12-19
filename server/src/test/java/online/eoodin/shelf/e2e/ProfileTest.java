package online.eoodin.shelf.e2e;

import online.eoodin.shelf.model.AccessorInfo;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.LocalHostUriTemplateHandler;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.net.URI;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class ProfileTest {

    @Autowired
    Environment environment;

    @Test
    public void test() {
        TestRestTemplate restTemplate = new TestRestTemplate(
                TestRestTemplate.HttpClientOption.ENABLE_REDIRECTS,
                TestRestTemplate.HttpClientOption.ENABLE_COOKIES);

        restTemplate.setUriTemplateHandler(new LocalHostUriTemplateHandler(environment, "http"));

        ResponseEntity<AccessorInfo> resp = restTemplate.exchange(
                RequestEntity.get(uri(restTemplate, "/accessor")).header(HttpHeaders.ORIGIN, "http://localhost:9000").build(),
                AccessorInfo.class);

        assertThat(resp.getStatusCode(), equalTo(HttpStatus.UNAUTHORIZED));

        MultiValueMap<String, String> form = new LinkedMultiValueMap<String, String>();
        form.set("username", "admin");
        form.set("password", "123456");
        ResponseEntity<String> loginResp = restTemplate.exchange(
                RequestEntity.post(uri(restTemplate, "/login"))
                        .header(HttpHeaders.ORIGIN, "http://localhost:9000")
                        .accept(MediaType.APPLICATION_JSON)
                        .body(form),
                String.class);

        assertEquals(loginResp.getStatusCode(), HttpStatus.FOUND);

        resp = restTemplate.exchange(
                RequestEntity.get(uri(restTemplate, "/accessor"))
                        .header(HttpHeaders.ORIGIN, "http://localhost:9000")
                        .header(HttpHeaders.COOKIE, loginResp.getHeaders().getFirst(HttpHeaders.SET_COOKIE))
                        .build(),
                AccessorInfo.class);

        assertThat(resp.getStatusCode(), equalTo(HttpStatus.OK));
        assertThat(resp.getBody().getUser(), notNullValue());
        assertThat(resp.getBody().getUser().getUsername(), equalTo("admin"));
    }

    private URI uri(TestRestTemplate restTemplate, String path) {
        return restTemplate.getRestTemplate().getUriTemplateHandler().expand(path);
    }
}
