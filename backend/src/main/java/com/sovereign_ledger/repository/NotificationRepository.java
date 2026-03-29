package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
}
