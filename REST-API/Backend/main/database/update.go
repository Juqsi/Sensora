package database

func (db *DB) Update(query string, args ...any) (int64, error) {
	args = changeEmptyToSQLNulls(args)
	query, args, err := fillQueryArguments(query, args...)
	if err != nil {
		return 0, err
	}

	response, err := db.Exec(query, args...)
	if err != nil {
		return 0, err
	}

	return response.RowsAffected()
}

func Update(query string, args ...any) (int64, error) {
	if db == nil {
		db = initDB()
	}

	return db.Update(query, args...)
}
