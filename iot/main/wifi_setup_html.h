// wifi_setup_html.h
#ifndef WIFI_SETUP_HTML_H
#define WIFI_SETUP_HTML_H

const char wifi_setup_html[] =
    "<!DOCTYPE html>"
    "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1'>"
    "<style>"
    "body { font-family: sans-serif; background: #f4f4f4; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }"
    ".card { background: white; padding: 2em; border-radius: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 100%%; max-width: 400px; }"
    "h1 { text-align: center; color: #333; }"
    "label { display: block; margin-top: 1em; color: #555; font-weight: bold; }"
    "input[type='text'], input[type='password'] { width: 100%%; padding: 10px; border: 1px solid #ccc; border-radius: 8px; margin-top: 0.5em; }"
    "input[type='submit'] { width: 100%%; padding: 12px; margin-top: 2em; background-color: #007BFF; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }"
    "input[type='submit']:hover { background-color: #0056b3; }"
    ".error { color: #b00020; margin-top: 1em; text-align: center; font-weight: bold; }"
    "</style></head><body>"
    "<div class='card'>"
    "<h1>🔧 WLAN-Einrichtung</h1>"
    "%s" // Hier kommt die Fehlermeldung rein
    "<form action='/connect' method='POST'>"
    "<label>SSID</label>"
    "<input type='text' name='ssid' required>"
    "<label>Passwort</label>"
    "<input type='password' name='password' required>"
    "<label>Username</label>"
    "<input type='text' name='username' required>"
    "<input type='submit' value='Verbinden'>"
    "</form>"
    "</div></body></html>";

#endif // WIFI_SETUP_HTML_H
