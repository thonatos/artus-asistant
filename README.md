# artus-asistant

> Telegram Bot / OpenAI Asistant powered by artus.

## Usage

### Config

config app with dotenv.

```
# telegram
API_ID = 0
APP_TITLE = "title"
API_HASH = "hash"

BOT_AUTH_TOKEN = "token"
SESSION_STRING = "sesstion_string"

TELEGRAM_CHANNEL = "channel"

# proxy
PROXY_IP = 127.0.0.1
PROXY_PORT = 1080
PROXY_SOCKET_TYPE = 5

# mysql
MYSQL_HOST = "localhost"
MYSQL_PORT = 3306
MYSQL_DATABASE = "mysql"
MYSQL_USERNAME = "root"
MYSQL_PASSWORD = "root"

# redis
REDIS_HOST = 'localhost'
REDIS_PORT = 6379
REDIS_USERNAME = ''
REDIS_PASSWORD = ''
REDIS_DATABASE = 0

# openai
OPENAI_KEY = "key"
```

### Development

```bash
$ pnpm i
$ pnpm run dev
```

### Production

```bash
$ pnpm run start

# nohup
$ nohup pnpm run start &
```

### Requirement

- Node.js 16.x
- Typescript 4.x+
