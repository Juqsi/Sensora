package database

import (
	"database/sql"
	"fmt"
	"reflect"
	"regexp"
	"strings"
	"time"
)

func changeEmptyToSQLNulls(args []any) []any {
	for i, arg := range args {
		t := reflect.TypeOf(arg).String()
		if t == "string" && len(arg.(string)) == 0 {
			args[i] = sql.NullString{
				String: arg.(string),
				Valid:  false,
			}
		} else if t == "*string" && len(*arg.(*string)) == 0 {
			args[i] = &sql.NullString{
				String: *arg.(*string),
				Valid:  false,
			}
		} else if t == "time.Time" && arg.(time.Time).IsZero() {
			args[i] = sql.NullTime{
				Time:  arg.(time.Time),
				Valid: false,
			}
		}
	}
	return args
}

func findNestedField(object any, colName string) (result interface{}, err error) {
	val := reflect.ValueOf(object).Elem()
	typ := val.Type()

	for j := 0; j < val.NumField(); j++ {
		field := val.Field(j)
		realName := typ.Field(j).Tag.Get("db")
		name := realName

		sub := false
		var names []string
		if strings.Contains(name, ".") {
			sub = true
			names = strings.Split(name, ".")
			name = names[0]
		}

		if name == colName || (strings.Contains(colName, ".") && realName == colName) {
			result = field.Addr().Interface()

			if sub {
				return findNestedField(result, names[1])
			}

			break
		}
	}
	if result == nil {
		return nil, fmt.Errorf("no tag founded for column %s", colName)
	}
	return
}

func IsValidUUID(input string) bool {
	uuidPattern := `^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$`
	match, _ := regexp.MatchString(uuidPattern, input)
	return match
}

func fillQueryArguments(query string, args ...any) (string, []any, error) {
	var arguments []any
	if strings.Contains(query, "{") {
		stateIn := false
		parameter := ""
		position := 0
		for _, rune := range query {
			if rune == '{' {
				stateIn = true
			} else if rune == '}' {
				stateIn = false
				ptr, err := findNestedField(args[0], parameter)
				if err != nil {
					return "", nil, err
				}
				arguments = append(arguments, ptr)
				query = strings.Replace(query, fmt.Sprintf("{%s}", parameter), "?", 1)
				parameter = ""
			} else if stateIn {
				parameter = fmt.Sprintf("%s%c", parameter, rune)
			} else if rune == '?' {
				position++
				arguments = append(arguments, args[position])
			}
		}
	} else {
		arguments = args
	}
	return query, arguments, nil
}
