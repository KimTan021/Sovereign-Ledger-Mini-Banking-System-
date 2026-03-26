package com.sovereign_ledger.service.service_implementation;

import com.sovereign_ledger.entity.PendingUser;
import com.sovereign_ledger.repository.PendingUserRepository;
import com.sovereign_ledger.service.PendingUserService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PendingUserServiceImplementation implements PendingUserService {
    private final PendingUserRepository pendingUserRepository;

    public PendingUserServiceImplementation(PendingUserRepository pendingUserRepository){
        this.pendingUserRepository=pendingUserRepository;
    }

    public List<PendingUser> findAllPendingUsers(){
        return pendingUserRepository.findAll();
    }

    public PendingUser findPendingUserById(Integer id){
        return pendingUserRepository.findById(id).orElse(null);
    }

    public PendingUser savePendingUser(PendingUser pendingUser){
        return pendingUserRepository.save(pendingUser);
    }

    public void deletePendingUser(Integer id){
        pendingUserRepository.deleteById(id);
    }
}
