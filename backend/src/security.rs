use crate::configuration::CONF;
use argon2::{self, Config};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use rand::{rngs::OsRng, TryRngCore};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

fn generate_salt() -> [u8; 16] {
    let mut salt = [0u8; 16];
    OsRng.try_fill_bytes(&mut salt).unwrap();
    salt
}

pub fn hash_password(password: &str) -> String {
    let salt = generate_salt();
    let config = Config::default();
    argon2::hash_encoded(password.as_bytes(), &salt, &config).unwrap()
}

pub fn verify_password(password: &str, hash: &str) -> bool {
    argon2::verify_encoded(hash, password.as_bytes()).unwrap()
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    uid: String,
    exp: u64,
}


pub fn generate_signed_token(uid: String) -> String {
    let expiration = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
        + CONF.token_lifetime_sec;

    let claims = Claims {
        uid,
        exp: expiration,
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_base64_secret(CONF.server_secret.clone().unwrap().as_ref()).unwrap(),
    )
        .unwrap()
}

pub fn verify_token(token: &str) -> Result<String, String> {
    let claims = decode::<Claims>(
        &token,
        &DecodingKey::from_base64_secret(CONF.server_secret.clone().unwrap().as_ref()).unwrap(),
        &Validation::default(),
    );

    match claims {
        Ok(claims) => Ok(claims.claims.uid),
        Err(err) => Err(format!("unable to verify token: {err}"))
    }
}
