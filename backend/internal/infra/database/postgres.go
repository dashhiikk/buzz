package database

import (
	"Buzz/internal/infra/config"
	"fmt"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)

func NewDB(cnfg *config.DBConfig) (*sqlx.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cnfg.Host, cnfg.Port, cnfg.User, cnfg.Password, cnfg.DBName, cnfg.SSLMode,
	)

	db, err := sqlx.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return db, nil
}
