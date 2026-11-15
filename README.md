[![Build and Deploy](https://github.com/Ayaz-hipe/ahj-http-helpdesk/actions/workflows/web.yml/badge.svg)](https://github.com/Ayaz-hipe/ahj-http-helpdesk/actions/workflows/web.yml)

# HelpDesk — frontend

Домашнее задание «7. Работа с HTTP» (курс AHJ, Нетология).

**GitHub Pages:** https://ayaz-hipe.github.io/ahj-http-helpdesk/

**Backend:** https://github.com/Ayaz-hipe/ahj-http-helpdesk-backend

## Возможности

- отображение всех тикетов (загружаются с сервера в JSON);
- создание, редактирование и удаление тикета через модальные окна (удаление — с подтверждением);
- отметка о выполнении (кнопка-кружок слева);
- подробное описание по клику на тело тикета — загружается отдельным запросом `ticketById`;
- индикатор загрузки на время запросов, вывод ошибок сервера.

После каждого изменения список тикетов заново подтягивается с сервера.

## Структура

```
src/js/api/createRequest.js  — обёртка над fetch (JSON, query-параметры, обработка ошибок)
src/js/TicketService.js      — методы API: list / get / create / update / delete
src/js/TicketView.js         — разметка тикета
src/js/TicketForm.js         — модальные окна (форма и подтверждение)
src/js/HelpDesk.js           — основной класс приложения
```

## Запуск локально

```bash
# в репозитории backend
npm install && npm start        # http://localhost:7070

# здесь
npm install
npm start                       # http://localhost:8080
```

## Адрес backend'а

По умолчанию используется `http://localhost:7070`. При сборке адрес задаётся переменной окружения `API_URL`:

```bash
API_URL=https://<имя>.herokuapp.com npm run build
```

В GitHub Actions значение берётся из переменной репозитория **Settings → Secrets and variables → Actions → Variables → `API_URL`**.

## Деплой на GitHub Pages

1. **Settings → Pages → Source: GitHub Actions**.
2. Добавьте переменную `API_URL` (см. выше).
3. Сделайте push в `main` — workflow `.github/workflows/web.yml` соберёт проект и выложит его на Pages.
