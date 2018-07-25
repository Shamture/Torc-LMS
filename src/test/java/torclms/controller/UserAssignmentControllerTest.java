package torclms.controller;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import torclms.entity.AssignmentStatus;
import torclms.model.Course;
import torclms.model.User;
import torclms.model.UserAssignment;
import torclms.service.CourseService;
import torclms.service.UserService;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.collection.IsCollectionWithSize.hasSize;
import static org.hamcrest.core.Is.is;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class UserAssignmentControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private UserService userService;

    private User testUser;

    private static int NUM_ASSIGNMENTS = 10;

    @Before
    public void setup () {
        testUser = new User();
        testUser.setUserId(1L);
    }

    @Test
    @WithMockUser(username="test@example.com",roles={"ADMIN", "MANAGER", "TRAINEE"})
    public void whenGettingUserAssignments_assignmentsReturned () throws Exception {
        ArgumentCaptor<String> userEmailCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Long> assignmentUserIdCaptor = ArgumentCaptor.forClass(Long.class);

        given(userService.findUserByEmail(userEmailCaptor.capture())).willReturn(testUser);
        given(userService.findAssignmentsByUserId(assignmentUserIdCaptor.capture())).willReturn(generateAssignments(NUM_ASSIGNMENTS));

        mvc.perform(get("/api/assignments/active-user").accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(NUM_ASSIGNMENTS)))
            .andExpect(jsonPath("$[0].assignedCourse.title", is("Course 0")));

        verify(userService).findUserByEmail(userEmailCaptor.capture());
        verify(userService).findAssignmentsByUserId(assignmentUserIdCaptor.capture());
    }

    private List<UserAssignment> generateAssignments (int numAssignments) {
        List<UserAssignment> assignments = new ArrayList<>();

        for (int i = 0;i < numAssignments; i++) {
            assignments.add(new UserAssignment(testUser, new Course("Course " + i), new Date(), AssignmentStatus.INCOMPLETE));
        }

        return  assignments;
    }

}
