package lk.jiat.entity;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "statuses")
public class Status implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String name; // "Pending", "Completed", "In Progress"

    public Status() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}