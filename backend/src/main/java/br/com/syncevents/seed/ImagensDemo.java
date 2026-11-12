package br.com.syncevents.seed;

import java.awt.Color;
import java.awt.Font;
import java.awt.GradientPaint;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Random;

import javax.imageio.ImageIO;

/**
 * Gera imagens ilustrativas (gradiente com "luzes" desfocadas) para os dados de demonstração.
 * Não usamos fotos reais para não depender de imagens com direitos autorais.
 */
final class ImagensDemo {

    private ImagensDemo() {
    }

    static byte[] foto(Color base, long semente, int largura, int altura) {
        BufferedImage img = new BufferedImage(largura, altura, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setPaint(new GradientPaint(0, 0, base.brighter(), largura, altura, base.darker().darker()));
        g.fillRect(0, 0, largura, altura);
        Random r = new Random(semente);
        for (int i = 0; i < 26; i++) {
            int d = 20 + r.nextInt(largura / 4);
            int alpha = 30 + r.nextInt(90);
            g.setColor(new Color(255, 225 + r.nextInt(30), 170 + r.nextInt(60), alpha));
            g.fillOval(r.nextInt(largura), r.nextInt(altura), d, d);
        }
        g.dispose();
        return jpg(img);
    }

    static byte[] logo(Color base, String iniciais) {
        int lado = 400;
        BufferedImage img = new BufferedImage(lado, lado, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        g.setColor(base.darker());
        g.fillRect(0, 0, lado, lado);
        g.setColor(new Color(248, 242, 236));
        g.setFont(new Font(Font.SERIF, Font.BOLD, 170));
        var fm = g.getFontMetrics();
        g.drawString(iniciais, (lado - fm.stringWidth(iniciais)) / 2, (lado - fm.getHeight()) / 2 + fm.getAscent());
        g.dispose();
        return jpg(img);
    }

    private static byte[] jpg(BufferedImage img) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ImageIO.write(img, "jpg", out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
