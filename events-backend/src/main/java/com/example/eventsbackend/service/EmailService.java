package com.example.eventsbackend.service;

import com.example.eventsbackend.model.Event;
import com.example.eventsbackend.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public void sendTicket(User user, Event ev, String ticketCode) {
        String to = user.getEmail();
        String subject = "Ваш билет на «" + ev.getTitle() + "»";
        String body = """
            <p>Здравствуйте, %s!</p>
            <p>Спасибо за регистрацию на событие:</p>
            <ul>
              <li><b>Название:</b> %s</li>
              <li><b>Дата:</b> %s</li>
              <li><b>Адрес:</b> %s</li>
              <li><b>Сфера:</b> %s</li>
            </ul>
            <p><b>Номер вашего билета: %s</b></p>
            """.formatted(
                user.getFullName(),
                ev.getTitle(),
                ev.getDate().toLocalDate().toString() + " " + ev.getDate().toLocalTime().toString(),
                ev.getAddress(),
                ev.getCategory(),
                ticketCode
        );

        sendHtml(to, subject, body);
    }

    public void sendConferenceLink(User user, Event ev) {
        String to = user.getEmail();
        String subject = "Ссылка на онлайн-событие «" + ev.getTitle() + "»";
        String html = """
            <p>Здравствуйте, %s!</p>
            <p>Спасибо за регистрацию на онлайн-событие:</p>
            <ul>
             <li><b>Название:</b> %s</li>
             <li><b>Дата:</b> %s</li>
             <li><b>Сфера:</b> %s</li>
            </ul>
            <p><b>Ссылка:</b> <a href="%s" target="_blank">%s</b></p>
            """.formatted(
                user.getFullName(),
                ev.getTitle(),
                ev.getDate().toLocalDate() + " " + ev.getDate().toLocalTime(),
                ev.getCategory(),
                ev.getConferenceLink(),
                ev.getConferenceLink()
        );
        sendHtml(to, subject, html);
    }

    public void sendEventUpdate(User user, Event ev, String changesDescription) {
        String subject = "Событие “" + ev.getTitle() + "” обновлено";
        String body = String.format("""
          Здравствуйте, %s!
          Событие «%s» было изменено:
          %s
          """, user.getFullName(), ev.getTitle(), changesDescription);
            sendHtml(user.getEmail(), subject, body);
    }

    private void sendHtml(String to, String subject, String body) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom("ya.sobytiye@mail.ru");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(msg);
        } catch (MessagingException e) {
            log.error("Не удалось отправить письмо с билетом", e);
        }
    }
}
