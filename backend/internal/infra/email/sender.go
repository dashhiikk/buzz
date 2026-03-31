package email

import (
	"fmt"
	"net/smtp"
)

type SMTPSender struct {
	host     string
	port     int
	username string
	password string
	from     string
}

func NewSMTPSender(host string, port int, username, password, from string) *SMTPSender {
	return &SMTPSender{
		host:     host,
		port:     port,
		username: username,
		password: password,
		from:     from,
	}
}

func (s *SMTPSender) SendVerification(to, token string) error {
	subject := "Подверждение email на сайте buzz.su"
	body := fmt.Sprintf("Для подтверждения email перейдите по ссылке: http://localhost:5173/auth/verify?token=%s", token)
	return s.send(to, subject, body)
}

func (s *SMTPSender) SendPasswordReset(to, token string) error {
	subject := "Сброс пароля на сайте buzz.su"
	body := fmt.Sprintf("Для смены пароля перейдите по ссылке: http://localhost:5173/recovery?token=%s", token)
	return s.send(to, subject, body)
}

func (s *SMTPSender) send(to, subject, body string) error {
	auth := smtp.PlainAuth("", s.username, s.password, s.host)

	msg := fmt.Sprintf("From: %s\r\nTo: %s\r\nSubject: %s\r\n\r\n%s", s.from, to, subject, body)

	addr := fmt.Sprintf("%s:%d", s.host, s.port)

	return smtp.SendMail(addr, auth, s.from, []string{to}, []byte(msg))
}
