package ictgradschool.industry.administrator.service;

import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.awt.GridBagConstraints; 
import java.awt.GridBagLayout; 

public class ImageLoader {
    private static final ExecutorService executorService = Executors.newSingleThreadExecutor();

    public static void loadImage(String imageUrl, JPanel panel) {
        panel.setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.anchor = GridBagConstraints.CENTER;
        JLabel loadingLabel = new JLabel("loading...");
        panel.removeAll();
        panel.add(loadingLabel, gbc);
        panel.revalidate();
        panel.repaint();

        executorService.submit(() -> {
            try {
                URL url = new URL(imageUrl);
                BufferedImage image = ImageIO.read(url);
                Image scaledImage = image.getScaledInstance(100, 100, Image.SCALE_SMOOTH);
                JLabel imageLabel = new JLabel(new ImageIcon(scaledImage));

                SwingUtilities.invokeLater(() -> {
                    panel.removeAll();
                    panel.add(imageLabel, gbc);
                    panel.revalidate();
                    panel.repaint();
                });
            } catch (Exception ex) {
                System.err.println("Error loading image: " + ex.getMessage());
            }
        });
    }
}