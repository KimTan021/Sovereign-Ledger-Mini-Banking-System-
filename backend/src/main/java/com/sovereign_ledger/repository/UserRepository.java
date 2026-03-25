package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {

}