package lk.jiat.entity;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;

@Entity
@Table(name = "tasks")
public class Task implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String type;
    private String scheduleType;
    private String createdAt;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id")
    private Status status;

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "priority_id")
    private Priority priority;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "task_id")
    private List<SubTask> subTasks;

    public Task() {}

    // Updated Getters and Setters
    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    // ... (Keep your other existing getters/setters)
}