package com.sovereign_ledger.repository;

import com.sovereign_ledger.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

}