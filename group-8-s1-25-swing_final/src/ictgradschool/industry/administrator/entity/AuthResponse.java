package ictgradschool.industry.administrator.entity;

import java.util.List;

public class AuthResponse {
    private String tokenId;
    private List<String> roles;

    public String getTokenId() {
        return tokenId;
    }
    public List<String> getRoles() {
        return roles;
    }

}