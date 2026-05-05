package lk.jiat.service;

import lk.jiat.entity.Priority;
import lk.jiat.entity.Status;
import lk.jiat.entity.Task;
import lk.jiat.util.HibernateUtil;
import org.hibernate.Session;
import org.hibernate.Transaction;
import java.util.List;

public class TaskService {

    // Save Task
    public void saveTask(Task task) {
        System.out.println(task);
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();

            session.merge(task);
            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
        }
    }

    public Priority getPriorityById(int id) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.get(Priority.class, id);
        }
    }

    // Get All Tasks
    public List<Task> getAllTasks() {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            // "DISTINCT t" prevents duplicate tasks when fetching subtasks
            return session.createQuery("SELECT DISTINCT t FROM Task t LEFT JOIN FETCH t.subTasks", Task.class).list();
        }
    }

    //  Delete Task
    public void deleteTask(String id) {
        Transaction transaction = null;
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            transaction = session.beginTransaction();

            Task task = session.get(Task.class, id);
            if (task != null) {
                session.delete(task);
            }

            transaction.commit();
        } catch (Exception e) {
            if (transaction != null) transaction.rollback();
            e.printStackTrace();
        }
    }

    public Status getStatusById(int sId) {
        try (Session session = HibernateUtil.getSessionFactory().openSession()) {
            return session.get(Status.class,sId);
        }
    }
}