use std::collections::HashMap;
use sqlx::postgres::PgArguments;
use sqlx::query::Query;
use sqlx::{query, Postgres};
use std::fmt::Display;

pub struct Builder {
    pub query: String,
    counter: u32,
    bindings: Vec<
        Box<
            dyn Fn(Query<'static, Postgres, PgArguments>) -> Query<'static, Postgres, PgArguments>
                + Send
                + Sync,
        >,
    >,
}

impl Builder {
    pub fn new() -> Self {
        Self {
            query: String::new(),
            counter: 1,
            bindings: Vec::new(),
        }
    }

    pub fn push(&mut self, str: &str) -> &mut Self {
        self.query.push_str(str);
        self
    }

    pub fn push_bind<T>(&mut self, parameter: T) -> &mut Self
    where
        T: 'static + Send + Sync + Clone + sqlx::Encode<'static, Postgres> + sqlx::Type<Postgres>,
    {
        let parameter = parameter.clone();
        self.bindings
            .push(Box::new(move |query| query.bind(parameter.clone())));

        self.query.push_str(&format!("${}", self.counter));
        self.counter += 1;

        self
    }

    pub fn to_query(self) -> Query<'static, Postgres, PgArguments> {
        // Query-String wird in eine `'static` Lifetime konvertiert
        let query_str: &'static str = Box::leak(self.query.into_boxed_str());

        let mut query = query(query_str);

        for binder in self.bindings {
            query = binder(query);
        }

        query
    }

    pub fn trim_query(&mut self, char_count: usize) -> &mut Self {
        self.query
            .truncate(self.query.len().saturating_sub(char_count));
        self
    }
}

impl Display for Builder {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.query)
    }
}

pub struct InsertBuilder {
    table: String,
    returning: Option<String>,
    values: HashMap<
        String,
        Vec<Box<
            dyn Fn(Query<'static, Postgres, PgArguments>) -> Query<'static, Postgres, PgArguments>
            + Send
            + Sync,
        >>,
    >,
    total_rows_to_insert: u32
}

impl InsertBuilder {
    pub fn new(table: String) -> Self {
        Self {
            values: HashMap::new(),
            table,
            returning: None,
            total_rows_to_insert: 0
        }
    }

    pub fn returning(&mut self, ret: Option<String>) -> &Self {
        self.returning = ret;
        self
    }


    pub fn push<T>(&mut self, column: &str, parameter: T) -> &mut Self
    where
        T: 'static + Send + Sync + Clone + sqlx::Encode<'static, Postgres> + sqlx::Type<Postgres>,
    {
        let parameter = parameter.clone();

        if let Some(vals)  = self.values.get_mut(column) {
            vals.push(Box::new(move |query| query.bind(parameter.clone())));
            if self.total_rows_to_insert < u32::try_from(vals.len()).unwrap() {
                self.total_rows_to_insert = u32::try_from(vals.len()).unwrap()
            }
        } else {
            self.values.insert(String::from(column),vec![Box::new(move |query| query.bind(parameter.clone()))]);
            if self.total_rows_to_insert < 1 {
                self.total_rows_to_insert = 1
            }
        }

        self
    }

    pub fn sql(&self) -> String {
        let mut sql = format!("INSERT INTO {} (\n{}\n) VALUES\n", self.table, self.values.keys().cloned().map(|column| {format!("\"{column}\"")}).collect::<Vec<String>>().join(",\n"));

        let mut counter = 1;
        let mut rows = Vec::<String>::new();

        for row_index in 0..self.total_rows_to_insert {
            let mut row = String::from("(");
            let mut values = Vec::<String>::new();
            for (_, vals) in &self.values {
                if u32::try_from(vals.len()).unwrap() > row_index {
                    values.push(format!("${counter}"));
                    counter += 1;
                }
            }
            row = format!("{row}{})", values.join(", "));
            rows.push(row);
        }

        sql = format!("{sql}{} {};", rows.join(",\n"),if let Some(ret) = &self.returning {
            format!("RETURNING {}", ret)
        } else {
            String::new()
        });

        sql
    }

    pub fn to_query(&self) -> Query<'static, Postgres, PgArguments> {
        let sql_str = self.sql();
        let query_str: &'static str = Box::leak(sql_str.clone().into_boxed_str());
        let mut query = query(query_str);


        for row_index in 0..self.total_rows_to_insert {
            for (_, vals) in &self.values {
                if u32::try_from(vals.len()).unwrap() > row_index {
                    query = vals[usize::try_from(row_index).unwrap()](query);
                }
            }
        }

        // for (_, binder) in &self.values {
        //     query = binder(query);
        // }

        query
    }
}

impl Display for InsertBuilder {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.sql())
    }
}
