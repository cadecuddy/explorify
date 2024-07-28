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
	pass := os.Getenv("MYSQL_ROOT_PASSWORD")
	dbName := os.Getenv("MYSQL_DATABASE")
	dbHostname := os.Getenv("MYSQL_HOST_NAME")

	once.Do(func() {
		db, dbError = sql.Open("mysql", fmt.Sprintf("root:%s@tcp(%s:3306)/%s", pass, dbHostname, dbName))
		if dbError != nil {
			panic(dbError.Error())
		}
	})

	return db, dbError
}
