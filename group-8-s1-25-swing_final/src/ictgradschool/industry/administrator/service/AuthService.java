package ictgradschool.industry.administrator.service;

import com.google.gson.Gson;
import ictgradschool.industry.administrator.entity.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import ictgradschool.industry.administrator.util.HttpUtil;

public class AuthService {
    public static final String BASE_URL = "http://127.0.0.1:3000";
    private Gson gson = new Gson();

    public AuthResponse login(String username, String password) throws Exception {
        Map<String, String> params = new HashMap<>();
        params.put("username", username);
        params.put("password", password);
        String ret=HttpUtil.getHttpResult("/api/auth","POST",params,null);
        return gson.fromJson(ret, AuthResponse.class);
    }

    public List<User> getUserList(String token) throws Exception {
        String ret=HttpUtil.getHttpResult("/api/users","GET",null,token);
        UserListResponse userListResponse = gson.fromJson(ret, UserListResponse.class);
        return userListResponse.getData();
    }

    public UserDetail getUserDetail(String token, int userId) throws Exception {
        String ret=HttpUtil.getHttpResult("/api/users/" + userId,"GET",null,token);
        return gson.fromJson(ret, UserDetail.class);
    }

    public void deleteUser(String token, int userId) throws Exception {
        HttpUtil.getHttpResult("/api/users/" + userId,"DELETE",null,token);
    }
}