package Campus.Maintenance.System.service;

import Campus.Maintenance.System.model.User;
import Campus.Maintenance.System.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User updatedUser) {

    User existingUser = userRepository.findById(id).orElseThrow();

    existingUser.setName(updatedUser.getName());
    existingUser.setEmail(updatedUser.getEmail());
    existingUser.setPassword(updatedUser.getPassword());
    existingUser.setRole(updatedUser.getRole());

    return userRepository.save(existingUser);
    }

    public long getUserCount() {
       return userRepository.count();
    }

public long getStaffCount() {
        return userRepository.countByRole("STAFF");
    }

    public void deleteUser(Long id) {
    userRepository.deleteById(id);
    }
}