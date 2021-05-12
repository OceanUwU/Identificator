# Identificator

## Setup
1. `npm install`
2. `npx sequelize-cli db:migrate`
3. create`cfg.json`:
    Set `url` as the URL of the website your identificator server will be accessed from.
    ```json
    {
        "port": 8080,
        "url": "http://localhost:8080",
        "sessSecret": "someRandomString"
    }
    ```
4. Create `credentials.json`. For this file, only include client details for the authentication services you're going to use.
    The services defined below are the only ones (currently) available.
    You can order them in the order that you want them to show up on the login page.
    If you're just setting up Identificator for development or testing and you'll need lots of accounts, I recommend Auth0, cause you can make accounts really fast on it
    ```json
    {
        "password": "set this value to literally anything if you want to enable local passwords",
        "discord": {
            "id": "CLIENT_ID",
            "secret": "CLIENT_SECRET"
        },
        "google": {
            "id": "CLIENT_ID",
            "secret": "CLIENT_SECRET"
        },
        "auth0": {
            "domain": "YOUR_APP_DOMAIN.auth0.com",
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
        },
        "identificator": "http://SECONDARY-IDENTIFICATOR-SERVER-URL.com"
    }
    ```
5. `npm start`