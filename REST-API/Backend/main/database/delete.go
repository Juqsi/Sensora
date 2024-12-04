package database

func (db *DB) Delete(query string, args ...any) (int64, error) {
	return db.Update(query, args...)
}

func Delete(query string, args ...any) (int64, error) {
	return Update(query, args...)
}
