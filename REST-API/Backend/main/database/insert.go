package database

import (
	"fmt"
	"strings"
)

func (db *DB) Insert(query, returning string, args ...any) (string, error) {
	query, args, err := fillQueryArguments(query, args...)
	if err != nil {
		return "", err
	}
	args = changeEmptyToSQLNulls(args)

	if len(returning) > 0 {
		query = strings.TrimSuffix(query, ";")
		query += fmt.Sprintf(" RETURNING %s;", returning)
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		return "", err
	}

	if rows.Next() {
		var id string
		err := rows.Scan(&id)
		if err != nil {
			_ = rows.Close()
			return "", err
		}
		return id, rows.Close()
	} else {
		_ = rows.Close()
		if len(returning) > 0 {
			return "", fmt.Errorf("no rows inserted")
		}
		return "", nil
	}
}

func Insert(query, returning string, args ...any) (string, error) {
	if db == nil {
		db = initDB()
	}

	return db.Insert(query, returning, args...)
}
