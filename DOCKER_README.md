# CSM Clinic Dashboard - Docker Deployment

Цей документ описує як розгорнути CSM Clinic Dashboard за допомогою Docker Compose.

## 🚀 Швидкий старт

### 1. Підготовка

```bash
# Клонуйте репозиторій (якщо ще не зробили)
git clone <repository-url>
cd csm_clinic_dashboard

# Налаштуйте змінні середовища
cp env.docker .env
# Відредагуйте .env файл з вашими API ключами
```

### 2. Розгортання

```bash
# Автоматичне розгортання
./deploy.sh

# Або вручну
docker-compose up --build -d
```

### 3. Перевірка

```bash
# Перевірте статус сервісів
docker-compose ps

# Перегляньте логи
docker-compose logs -f

# Відкрийте додаток
open http://localhost:3000
```

## 🏗️ Архітектура

### Сервіси

- **app** - Next.js додаток (порт 3000)
- **postgres** - PostgreSQL база даних (порт 5432)

### Томи

- **postgres_data** - Дані PostgreSQL
- **uploads** - Завантажені файли

## ⚙️ Конфігурація

### Змінні середовища

Скопіюйте `env.docker` в `.env` та налаштуйте:

```env
# API ключі (обов'язково)
POSTIZ_API_KEY=your-actual-api-key
POSTIZ_BASE_URL=https://api.postiz.com
BLOTATO_API_KEY=your-actual-api-key
BLOTATO_PROFILES_URL=https://your-webhook-url
N8N_SUBMIT_FORM_WEBHOOK=https://your-n8n-webhook
CSM_API_KEY=your-csm-api-key

# Безпека (змініть в продакшені)
AUTH_SECRET=your-secure-secret-here
```

### База даних

База даних автоматично ініціалізується з:

- Таблицями для користувачів, сесій, постів та інтеграцій
- Індексами для оптимізації
- Тригерами для оновлення timestamps
- Дефолтним адміном (email: admin@csm.com, password: admin123)

## 🔧 Управління

### Основні команди

```bash
# Запуск сервісів
docker-compose up -d

# Зупинка сервісів
docker-compose down

# Перезапуск
docker-compose restart

# Перегляд логів
docker-compose logs -f app
docker-compose logs -f postgres

# Виконання команд в контейнері
docker-compose exec app npm run db:migrate
docker-compose exec postgres psql -U postgres -d csm_clinic_dashboard
```

### Очищення

```bash
# Зупинка та видалення контейнерів
docker-compose down

# Видалення з томами (ВНИМАНИЕ: втрата даних!)
docker-compose down -v

# Повне очищення
docker-compose down --rmi all -v
```

## 📊 Моніторинг

### Перевірка здоров'я

```bash
# Статус сервісів
docker-compose ps

# Використання ресурсів
docker stats

# Логи в реальному часі
docker-compose logs -f
```

### База даних

```bash
# Підключення до PostgreSQL
docker-compose exec postgres psql -U postgres -d csm_clinic_dashboard

# Створення бекапу
docker-compose exec postgres pg_dump -U postgres csm_clinic_dashboard > backup.sql

# Відновлення з бекапу
docker-compose exec -T postgres psql -U postgres csm_clinic_dashboard < backup.sql
```

## 🔒 Безпека

### Продакшен

1. **Змініть всі паролі та секрети**
2. **Налаштуйте SSL сертифікати**
3. **Обмежте доступ до бази даних**
4. **Використовуйте Docker secrets**

## 🐛 Налагодження

### Часті проблеми

1. **Порт 3000 зайнятий**

   ```bash
   # Змініть порт в docker-compose.yml
   ports:
     - "3001:3000"
   ```

2. **База даних не підключається**

   ```bash
   # Перевірте логи
   docker-compose logs postgres

   # Перезапустіть
   docker-compose restart postgres
   ```

3. **API помилки**

   ```bash
   # Перевірте .env файл
   cat .env

   # Перевірте логи додатку
   docker-compose logs app
   ```

### Логи

```bash
# Всі сервіси
docker-compose logs

# Конкретний сервіс
docker-compose logs app
docker-compose logs postgres
docker-compose logs nginx

# Останні 100 рядків
docker-compose logs --tail=100 app
```

## 📈 Масштабування

### Горизонтальне масштабування

```yaml
# В docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
```

### Вертикальне масштабування

```yaml
# Обмеження ресурсів
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "0.5"
```

## 🔄 Оновлення

```bash
# Отримайте останні зміни
git pull

# Перебудуйте та перезапустіть
docker-compose up --build -d

# Запустіть міграції (якщо потрібно)
docker-compose exec app npm run db:migrate
```

## 📞 Підтримка

При проблемах:

1. Перевірте логи: `docker-compose logs`
2. Перевірте статус: `docker-compose ps`
3. Перевірте конфігурацію: `cat .env`
4. Створіть issue в репозиторії
