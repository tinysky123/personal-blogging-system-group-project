package ictgradschool.industry.administrator.util;

import com.google.gson.Gson;
import ictgradschool.industry.administrator.entity.AuthResponse;
import ictgradschool.industry.administrator.entity.ErrorInfo;
import ictgradschool.industry.administrator.entity.UserListResponse;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

public class HttpUtil {



    public static final String BASE_URL = "http://127.0.0.1:3000";
    private static Gson gson = new Gson();

    public static String getHttpResult(String path,String Method, Map<String, String> params,String token) throws Exception {

        String jsonInputString = gson.toJson(params);

        URL url = new URL(BASE_URL + path);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(Method);
        conn.setRequestProperty("Content-Type", "application/json");
        if(token!=null) {
            conn.setRequestProperty("authorization", token);
        }
        if(params!=null && params.size()>0) {
            conn.setDoOutput(true);
            conn.getOutputStream().write(jsonInputString.getBytes());
        }

        int responseCode = conn.getResponseCode();
        if(responseCode == 204) {
            return null;
        }
        BufferedReader reader;
        if (responseCode == 200) {
            reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            reader = new BufferedReader(new InputStreamReader(conn.getErrorStream()));

        }
        StringBuilder response=null;
        response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }

        reader.close();

        if (responseCode == 401) {
            ErrorInfo errorInfo=gson.fromJson(response.toString(), ErrorInfo.class);
            throw new Exception( errorInfo.getMessage() );
        } else if (responseCode != 200 && responseCode != 204) {
            throw new Exception("Request failed. Status code: " + responseCode + ", Response content: " + response.toString());
        }

        return response.toString();
    }
}
