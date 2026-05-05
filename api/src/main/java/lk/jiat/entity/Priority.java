package lk.jiat.entity;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "priorities")
public class Priority implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(unique = true, nullable = false)
    private String name; // "High", "Medium", "Low"

    private String colorCode; // Store Hex codes like "#FF3B30"

    public Priority() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getColorCode() { return colorCode; }
    public void setColorCode(String colorCode) { this.colorCode = colorCode; }
}