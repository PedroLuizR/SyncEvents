package br.com.syncevents.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import br.com.syncevents.auth.JwtAuthFilter;
import br.com.syncevents.auth.JwtService;
import br.com.syncevents.common.ErroSegurancaHandler;

/**
 * Segurança stateless com JWT. Rotas públicas liberadas; o restante exige token.
 * O perfil do usuário vira ROLE_CLIENTE / ROLE_EMPRESA.
 */
@Configuration
public class SecurityConfig {

    static final String[] ROTAS_PUBLICAS = {
        "/actuator/health/**",
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/files/**",
        "/api/v1/auth/cadastro/**",
        "/api/v1/auth/login",
        "/error",
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, ErroSegurancaHandler erroHandler,
            JwtService jwtService) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(e -> e
                        .authenticationEntryPoint(erroHandler)
                        .accessDeniedHandler(erroHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(ROTAS_PUBLICAS).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categorias/**").permitAll()
                        // Rotas exclusivas de empresa (a posse do recurso é checada no service)
                        .requestMatchers("/api/v1/empresas/me", "/api/v1/empresas/me/**").hasRole("EMPRESA")
                        .requestMatchers("/api/v1/servicos/me").hasRole("EMPRESA")
                        .requestMatchers(HttpMethod.POST, "/api/v1/servicos/**").hasRole("EMPRESA")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/servicos/**").hasRole("EMPRESA")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/servicos/**").hasRole("EMPRESA")
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthFilter(jwtService), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
