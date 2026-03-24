package config

import (
	"fmt"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Server ServerConfig
	DB     DBConfig
	JWT    JWTConfig
	Jitsi  JitsiConfig
	Email  EmailConfig
	Upload UploadConfig
}

type ServerConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

type DBConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	SecretKey     string
	AccessExpire  time.Duration
	RefreshExpire time.Duration
}

type JitsiConfig struct {
	ServerUrl string `mapstructure:"server_url"`
	JWTSecret string `mapstructure:"jwt_secret"`
	AppID     string `mapstructure:"app_id"`
}

type EmailConfig struct {
	SMTPHost string
	SMTPPort int
	Username string
	Password string
	From     string
}

type UploadConfig struct {
	Path        string   `mapstructure:"path"`
	MaxSize     int64    `mapstructure:"max_size"`
	AllowedExts []string `mapstructure:"allowed_exts"`
}

func Load() (*Config, error) {
	viper.SetEnvPrefix("APP")
	viper.AutomaticEnv()

	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("SERVER_READ_TIMEOUT", "10s")
	viper.SetDefault("SERVER_WRITE_TIMEOUT", "10s")

	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "moonmass-0,073")
	viper.SetDefault("DB_NAME", "buzz")
	viper.SetDefault("DB_SSLMODE", "disable")

	viper.SetDefault("JWT_SECRET_KEY", "default-secret-change-me")
	viper.SetDefault("JWT_ACCESS_EXPIRE", "15m")
	viper.SetDefault("JWT_REFRESH_EXPIRE", "24h")

	viper.SetDefault("JITSI_SERVER_URL", "https://meet.jit.si")
	viper.SetDefault("JITSI_JWT_SECRET", "my-jitsi-secret")
	viper.SetDefault("JITSI_APP_ID", "buzzId")

	viper.SetDefault("EMAIL_SMTP_HOST", "smpt.gmail.com")
	viper.SetDefault("EMAIL_SMTP_PORT", 587)
	viper.SetDefault("EMAIL_USERNAME", "")
	viper.SetDefault("EMAIL_PASSWORD", "")
	viper.SetDefault("EMAIL_FROM", "")

	viper.SetDefault("UPLOAD_PATH", "./uploads")
	viper.SetDefault("UPLOAD_MAX_SIZE", 10<<20)
	viper.SetDefault("UPLOAD_ALLOWED_EXTS", []string{".jpg", ".jpeg", ".png", ".gif", ".pdf", ".txt"})

	readTimeout, err := time.ParseDuration(viper.GetString("SERVER_READ_TIMEOUT"))
	if err != nil {
		return nil, fmt.Errorf("inavid SERVER_READ_TIMEOUT %w", err)
	}
	writeTimeout, err := time.ParseDuration(viper.GetString("SERVER_WRITE_TIMEOUT"))
	if err != nil {
		return nil, fmt.Errorf("inlid SERVER_WRITE_TIMEOUT %w", err)
	}
	accessExpire, err := time.ParseDuration(viper.GetString("JWT_ACCESS_EXPIRE"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_ACCESS_EXPIRE %w", err)
	}
	refreshExpire, err := time.ParseDuration(viper.GetString("JWT_REFRESH_EXPIRE"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_REFRESH_EXPIRE %w", err)
	}

	cnfg := &Config{
		Server: ServerConfig{
			Port:         viper.GetString("SERVER_PORT"),
			ReadTimeout:  readTimeout,
			WriteTimeout: writeTimeout,
		},
		DB: DBConfig{
			Host:     viper.GetString("DB_HOST"),
			Port:     viper.GetString("DB_PORT"),
			User:     viper.GetString("DB_USER"),
			Password: viper.GetString("DB_PASSWORD"),
			DBName:   viper.GetString("DB_NAME"),
			SSLMode:  viper.GetString("DB_SSLMODE"),
		},
		JWT: JWTConfig{
			SecretKey:     viper.GetString("JWT_SECRET_KEY"),
			AccessExpire:  accessExpire,
			RefreshExpire: refreshExpire,
		},
		Jitsi: JitsiConfig{
			ServerUrl: viper.GetString("JITSI_SERVER_URL"),
			JWTSecret: viper.GetString("JITSI_JWT_SECRET"),
			AppID:     viper.GetString("JITSI_APP_ID"),
		},
		Email: EmailConfig{
			SMTPHost: viper.GetString("EMAIL_SMTP_HOST"),
			SMTPPort: viper.GetInt("EMAIL_SMTP_PORT"),
			Username: viper.GetString("EMAIL_USERNAME"),
			Password: viper.GetString("EMAIL_PASSWORD"),
			From:     viper.GetString("EMAIL_FROM"),
		},
		Upload: UploadConfig{
			Path:        viper.GetString("UPLOAD_PATH"),
			MaxSize:     viper.GetInt64("UPLOAD_MAX_SIZE"),
			AllowedExts: viper.GetStringSlice("UPLOAD_ALLOWED_EXTS"),
		},
	}

	return cnfg, nil
}
