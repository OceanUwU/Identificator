# Identificator

## Setup
Before launching, create two files in the root directory: `cfg.json` and `credentials.json`

`cfg.json`:
```json
{
    "url": "http://localhost:8080",
    "port": 8080,

    "db": {
        "server": "localhost",
        "port": 3306,
        "username": "root",
        "pw": "",
        "db": "identificator"
    },

    "sessSecret": "someRandomString"
}
```
with `url` as the URL of the website your identificator server will be accessed from.

For `credentials.json`, only include client details for the authentication services you're going to use.
```json
{
    "discord": {
        "id": "CLIENT_ID",
        "secret": "CLIENT_SECRET"
    },
    "google": {
        "id": "CLIENT_ID",
        "secret": "CLIENT_SECRET"
    }
}
```