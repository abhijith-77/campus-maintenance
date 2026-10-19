package Campus.Maintenance.System.controller;

import Campus.Maintenance.System.model.LoginRequest;
import Campus.Maintenance.System.model.User;
import Campus.Maintenance.System.repository.UserRepository;
import Campus.Maintenance.System.service.JwtService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest loginRequest) {

        User user = userRepository
                .findAll()
                .stream()
                .filter(u -> u.getEmail().equals(loginRequest.getEmail())
                        && u.getPassword().equals(loginRequest.getPassword()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        return jwtService.generateToken(user.getEmail(), user.getRole());
    }
}