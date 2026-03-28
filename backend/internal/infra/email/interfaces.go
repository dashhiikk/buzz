package email

type Sender interface {
	SendPasswordReset(to, token string) error
	SendVerification(to, token string) error
}
