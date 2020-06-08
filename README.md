# Identificator

## Setup
Before launching, create a mysql database using the schema in `identificator.sql` and two configuration files in the root directory: `cfg.json` and `credentials.json`.

### Database
demo commands for creating the database as root from within the directory this repository is installed:
```sql
CREATE DATABASE identificator;
CREATE USER 'identifier'@'localhost' IDENTIFIED BY 'CantCrackThisPasswordCauseItsTooGood';
GRANT ALL PRIVILEGES ON identificator.* TO 'identifier'@'localhost';
FLUSH PRIVILEGES;
USE identificator;
SOURCE identificator.sql; 
SHOW COLUMNS FROM users; --test that the database has been created correctly
EXIT;
```

### Config Files
`cfg.json`:
Set `url` as the URL of the website your identificator server will be accessed from.
```json
{
    "url": "http://localhost:8080",
    "port": 8080,

    "db": {
        "server": "localhost",
        "port": 3306,
        "username": "identifier",
        "pw": "CantCrackThisPasswordCauseItsTooGood",
        "db": "identificator"
    },

    "sessSecret": "someRandomString"
}
```

For `credentials.json`, only include client details for the authentication services you're going to use.
The services defined below are the only ones (currently) available.
```json
{
    "discord": {
        "id": "CLIENT_ID",
        "secret": "CLIENT_SECRET"
    },
    "google": {
        "id": "CLIENT_ID",
        "secret": "CLIENT_SECRET"
    },
    "wordpress": {
        "id": "CLIENT_ID",
        "secret": "CLIENT_SECRET"
    },
    "reddit": {
        "id": "CLIENT_ID",
        "secret": "CLIENT_SECRET"
    },
    "github": {
        "id": "CLIENT_ID",
        "secret": "CLIENT_SECRET"
    },
    "gitlab": {
        "id": "CLIENT_ID",
        "secret": "CLIENT_SECRET"
    },
    "facebook": {
        "id": "CLIENT_ID",
        "secret": "CLIENT_SECRET"
    },
    "steam": "API_KEY",
    "yandex": {
        "id": "CLIENT_ID",
        "secret": "CLIENT_SECRET"
    }
}
```

### Running
```
npm install
npm start
```