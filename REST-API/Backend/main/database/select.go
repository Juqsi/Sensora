package database

import (
	"database/sql"
	"reflect"
	"time"
)

func (db *DB) Select(query string, handler Handler, args ...any) (int, error) {
	args = changeEmptyToSQLNulls(args)

	rows, err := db.Query(query, args...)
	if err != nil {
		return 0, err
	}

	count := 0
	for rows.Next() {
		if err := handler(rows); err != nil {
			_ = rows.Close()
			return count, err
		}
		count++
	}

	return count, rows.Close()
}

func Select[T any](query string, args ...any) ([]T, int, error) {

	if db == nil {
		db = initDB()
	}

	args = changeEmptyToSQLNulls(args)

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, 0, err
	}

	columns, err := rows.Columns()
	if err != nil {
		return nil, 0, err
	}

	objects := make([]T, 0)
	count := 0
	for _ = 0; rows.Next(); count++ {
		object := new(T)

		order := make([]interface{}, len(columns))
		nullstrings := make([][]interface{}, len(columns))
		nulltimes := make([][]interface{}, len(columns))
		nullfloats := make([][]interface{}, len(columns))
		var trash any

		for i, colName := range columns {
			ptr, err := findNestedField(object, colName)
			if err != nil {
				order[i] = &trash
				continue
			}
			if reflect.TypeOf(ptr).Elem().String() == "string" {
				nullstrings[i] = make([]interface{}, 2)
				nullstrings[i][0] = ptr
				nullstrings[i][1] = new(sql.NullString)
				order[i] = nullstrings[i][1]
			} else if reflect.TypeOf(ptr).Elem().String() == "time.Time" {
				nulltimes[i] = make([]interface{}, 2)
				nulltimes[i][0] = ptr
				nulltimes[i][1] = new(sql.NullTime)
				order[i] = nulltimes[i][1]
			} else if reflect.TypeOf(ptr).Elem().String() == "float64" {
				nullfloats[i] = make([]interface{}, 2)
				nullfloats[i][0] = ptr
				nullfloats[i][1] = new(sql.NullFloat64)
				order[i] = nullfloats[i][1]
			} else {
				order[i] = ptr
			}
		}

		err := rows.Scan(order...)
		if err != nil {
			return nil, count, err
		}

		for _, nullstring := range nullstrings {
			if len(nullstring) != 2 {
				continue
			}
			stringPtr := nullstring[0].(*string)
			nullstringPtr := nullstring[1].(*sql.NullString)

			if nullstringPtr.Valid {
				*stringPtr = nullstringPtr.String
			}
		}

		for _, nulltime := range nulltimes {
			if len(nulltime) != 2 {
				continue
			}
			timePtr := nulltime[0].(*time.Time)
			nulltimePtr := nulltime[1].(*sql.NullTime)

			if nulltimePtr.Valid {
				*timePtr = nulltimePtr.Time
			}
		}

		for _, nullfloat := range nullfloats {
			if len(nullfloat) != 2 {
				continue
			}
			floatPtr := nullfloat[0].(*float64)
			nullfloatPtr := nullfloat[1].(*sql.NullFloat64)

			if nullfloatPtr.Valid {
				*floatPtr = nullfloatPtr.Float64
			}
		}

		objects = append(objects, *object)
	}

	return objects, count, rows.Close()
}
