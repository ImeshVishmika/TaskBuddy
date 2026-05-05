package lk.jiat.controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import lk.jiat.service.TaskService; // Ensure you have your DAO
import lk.jiat.entity.Priority;
import lk.jiat.entity.Status;
import lk.jiat.entity.Task;

import java.util.List;


@Path("/tasks") // Endpoint URL: http://localhost:8080/api/tasks
public class TaskController {

    private final TaskService taskService = new TaskService();
    private final Gson gson = new Gson();

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllTasks() {
        try {
            List<Task> tasks = taskService.getAllTasks();
            String json = gson.toJson(tasks);
            return Response.ok(json).build();
        } catch (Exception e) {
            return Response.status(500).entity(e.getMessage()).build();
        }
    }


    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response saveTask(String jsonBody) {
        try {
            //  JSON to a generic JsonObject
            JsonObject jsonObject = gson.fromJson(jsonBody, com.google.gson.JsonObject.class);

            // Map the main Task fields using Gson
            Task task = gson.fromJson(jsonBody, Task.class);

            // Priority Linking
            if (jsonObject.has("priorityId")) {
                int pId = jsonObject.get("priorityId").getAsInt();

                // Fetch the real Priority object
                Priority priority = taskService.getPriorityById(pId);

                if (priority != null) {
                    task.setPriority(priority); // Link it to the Task
                }
            }

            // Status Linking
            if (jsonObject.has("statusId")) {
                int sId = jsonObject.get("statusId").getAsInt();


                Status status = taskService.getStatusById(sId);

                if (status != null) {
                    task.setStatus(status);
                }
            }

            taskService.saveTask(task);

            return Response.ok("{\"status\":\"Saved\"}").build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(500).entity("Error saving task: " + e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteTask(@PathParam("id") String id) {
        try {
            taskService.deleteTask(id); // Ensure your DAO has delete logic
            return Response.ok("{\"status\":\"Deleted\"}").build();
        } catch (Exception e) {
            return Response.status(500).entity("Error deleting task").build();
        }
    }
}