package ictgradschool.industry.administrator.view;

import ictgradschool.industry.administrator.service.ImageLoader;
import ictgradschool.industry.administrator.model.UserModel;
import ictgradschool.industry.administrator.entity.AuthResponse;
import ictgradschool.industry.administrator.entity.User;
import ictgradschool.industry.administrator.entity.UserDetail;
import ictgradschool.industry.administrator.service.AuthService;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;
import java.util.List;

public class MainFrame extends JFrame {
    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginButton;
    private JButton logoutButton;
    private JTable userTable;
    private JButton deleteButton;
    private JPanel profilePanel;
    private JPanel descriptionPanel;
    private AuthService authService;
    private UserModel userModel;
    private String token;
    public MainFrame() {
        authService = new AuthService();
        userModel = new UserModel();
        initUI();
        updateButtonStates();
    }

    private void initUI() {
        setTitle("administrator");
        setSize(800, 600);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLayout(new BorderLayout());

        JPanel loginPanel = new JPanel();
        usernameField = new JTextField(20);
        passwordField = new JPasswordField(20);
        loginButton = new JButton("login");
        logoutButton = new JButton("logout");

        loginPanel.add(new JLabel("username:"));
        loginPanel.add(usernameField);
        loginPanel.add(new JLabel("password:"));
        loginPanel.add(passwordField);
        loginPanel.add(loginButton);
        loginPanel.add(logoutButton);

        userTable = new JTable(userModel);
        JScrollPane tableScrollPane = new JScrollPane(userTable);

        deleteButton = new JButton("Delete user");

        profilePanel = new JPanel();
        profilePanel.setLayout(new BoxLayout(profilePanel, BoxLayout.Y_AXIS));
        profilePanel.setPreferredSize(new Dimension(200, 150));
    
        descriptionPanel = new JPanel();
        descriptionPanel.setLayout(new BoxLayout(descriptionPanel, BoxLayout.Y_AXIS));
        descriptionPanel.setPreferredSize(new Dimension(200, 1000));

        JPanel eastPanel = new JPanel();
        eastPanel.setLayout(new BoxLayout(eastPanel, BoxLayout.Y_AXIS));
        eastPanel.setAlignmentX(Component.CENTER_ALIGNMENT);
        profilePanel.setAlignmentX(Component.CENTER_ALIGNMENT);
        descriptionPanel.setAlignmentX(Component.CENTER_ALIGNMENT);
        eastPanel.add(profilePanel);
        eastPanel.add(descriptionPanel);
        add(eastPanel, BorderLayout.EAST);
        add(loginPanel, BorderLayout.NORTH);
        add(tableScrollPane, BorderLayout.CENTER);
        add(deleteButton, BorderLayout.SOUTH);
        add(eastPanel, BorderLayout.EAST);

        loginButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String username = usernameField.getText();
                String password = new String(passwordField.getPassword());
                authenticateUser(username, password);
            }
        });

        logoutButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                logout();
            }
        });

        deleteButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                int selectedRow = userTable.getSelectedRow();
                if (selectedRow != -1) {
                    deleteUser(selectedRow);
                }
            }
        });

        userTable.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseClicked(MouseEvent e) {
                int selectedRow = userTable.getSelectedRow();
                if (selectedRow != -1) {
                    loadUserProfile(selectedRow);
                }
            }
        });
    }

    private void authenticateUser(String username, String password) {
        try {
            AuthResponse response = authService.login(username, password);
            if (response != null && response.getRoles().contains("admin")) {
                token = response.getTokenId();
                loadUserList();
                updateButtonStates(); 
            } else {
                JOptionPane.showMessageDialog(this, "This account has no administrator privileges", "error", JOptionPane.ERROR_MESSAGE);
                logout();
            }
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Login failed: The username or password is incorrect", "error", JOptionPane.ERROR_MESSAGE);
        }
        updateButtonStates(); 
    }

    private void loadUserList() {
        try {
            List<User> users = authService.getUserList(token);
            userModel.setUsers(users);
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Failed to obtain the user list: " + ex.getMessage(), "error", JOptionPane.ERROR_MESSAGE);
        }
    }

    private void loadUserProfile(int row) {
        User user = userModel.getUserAt(row);
        try {
            UserDetail detail = authService.getUserDetail(token, user.getUserId());
            ImageLoader.loadImage(AuthService.BASE_URL+detail.getAvatarUrl(), profilePanel);
            descriptionPanel.removeAll();
            descriptionPanel.setLayout(new BoxLayout(descriptionPanel, BoxLayout.Y_AXIS));
            JLabel usernameLabel = new JLabel(detail.getUsername());
            usernameLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
            String description = detail.getDescription().replaceAll("\n", "");

            descriptionPanel.add(usernameLabel);
            descriptionPanel.add(new JLabel("   "));
            JTextArea descriptionTextArea = new JTextArea(description);
            Color defaultBgColor = this.getBackground();
            descriptionTextArea.setBackground(defaultBgColor);
            descriptionTextArea.setLineWrap(true);
            descriptionTextArea.setFont(new Font("Monospaced", Font.ITALIC, 13));
            descriptionPanel.add(descriptionTextArea);

        } catch (Exception ex) {
            JOptionPane.showMessageDialog(this, "Failed to obtain user information: " + ex.getMessage(), "error", JOptionPane.ERROR_MESSAGE);
        }
        updateButtonStates(); 
    }

    private void deleteUser(int row) {
        User user = userModel.getUserAt(row);
        int confirm = JOptionPane.showConfirmDialog(this, "Are you sure you want to delete this user?", "Confirm Deletion", JOptionPane.YES_NO_OPTION);
        if (confirm == JOptionPane.YES_OPTION) {
            try {
                authService.deleteUser(token, user.getUserId());
                userModel.removeUser(row);
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Failed to delete the user: " + ex.getMessage(), "error", JOptionPane.ERROR_MESSAGE);
            }
        }
    }

    private void logout() {
        token = null;
        userModel.clearUsers();
        profilePanel.removeAll();
        profilePanel.revalidate();
        descriptionPanel.removeAll();
        descriptionPanel.revalidate();
        profilePanel.repaint();

        if (usernameField != null) {
            usernameField.setText("");
        }
        if (passwordField != null) {
            passwordField.setText("");
        }

        updateButtonStates();
    }

    private void updateButtonStates() {
        boolean isLoggedIn = token != null;
        loginButton.setEnabled(!isLoggedIn);
        loginButton.setVisible(!isLoggedIn);
        logoutButton.setEnabled(isLoggedIn);
        logoutButton.setVisible(isLoggedIn);
        deleteButton.setEnabled(isLoggedIn && userTable.getSelectedRow() != -1);

        revalidate();
        repaint();
    }
    
   

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            MainFrame frame = new MainFrame();
            frame.setVisible(true);
        });
    }
}