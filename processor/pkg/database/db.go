package database

import (
	"database/sql"
	"fmt"
	"os"
	"sync"

	_ "github.com/go-sql-driver/mysql"
)

var (
	once    sync.Once
	db      *sql.DB
	dbError error
)

func GetConnection() (*sql.DB, error) {
	user := os.Getenv("MYSQL_PROCESSOR_USER")
	pass := os.Getenv("MYSQL_PROCESSOR_PASSWORD")
	dbName := os.Getenv("MYSQL_DATABASE")

	once.Do(func() {
		db, dbError = sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(mysql:3306)/%s", user, pass, dbName))
		if dbError != nil {
			panic(dbError.Error())
		}
	})

	return db, dbError
}