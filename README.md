# KINGOFJAVA777 — Official Website

Брендированный сайт для стримера Lineage 2 — KINGOFJAVA777 (Степан, Армения).

## 🎨 Дизайн

**Стиль:** Dark cinematic + medieval gaming  
**Цветовая палитра:** Obsidian blacks (#08090C) + Champagne gold (#D4AF37, #E8C582)  
**Типографика:** Russo One (заголовки) + Inter (основной текст) + JetBrains Mono (статистика)

### Особенности

- ✨ Анимированные частицы (canvas-based, GPU-accelerated)
- 🌟 Glow эффекты на hover
- 📱 Полностью адаптивный дизайн (375px → 1440px)
- 🌍 Мультиязычность (RU/EN/AM)
- ♿ Accessibility (WCAG AA, keyboard navigation, screen readers)
- ⚡ Performance optimized (lazy loading, minimal dependencies)
- 🎬 Интеграция видео (YouTube, TikTok, Kick)

## 🚀 Технологии

- **HTML5** — семантическая разметка
- **CSS3** — custom properties, grid, flexbox, animations
- **Vanilla JavaScript** — без фреймворков, модульная архитектура
- **Canvas API** — система частиц
- **Intersection Observer** — scroll animations
- **localStorage** — сохранение языка

## 📦 Структура проекта

```
kingofjava777/
├── site/
│   ├── assets/
│   │   ├── styles.css          # Все стили + дизайн-токены
│   │   ├── app.js              # JavaScript (частицы, i18n, анимации)
│   │   └── favicon.svg         # Иконка сайта
│   ├── locales/
│   │   ├── ru.json             # Русский (основной)
│   │   ├── en.json             # English
│   │   └── am.json             # Հայերեն (Armenian)
│   ├── templates/
│   │   └── index.html          # HTML шаблон
│   ├── index.html              # Сгенерированная RU версия
│   ├── en.html                 # Сгенерированная EN версия
│   └── am.html                 # Сгенерированная AM версия
├── scripts/
│   └── build-site-locales.py   # Скрипт сборки мультиязычных страниц
├── design-system/
│   └── MASTER.md               # Дизайн-система (цвета, типографика, эффекты)
└── README.md                   # Этот файл
```

## 🛠 Установка и запуск

### Требования

- Python 3.7+ (для скрипта сборки)
- Любой HTTP-сервер (для локального просмотра)

### Сборка сайта

```bash
# Перейти в директорию проекта
cd /Users/se1dhe/projects/kingofjava777

# Запустить скрипт сборки
python3 scripts/build-site-locales.py
```

Это сгенерирует:
- `site/index.html` (русская версия)
- `site/en.html` (английская версия)
- `site/am.html` (армянская версия)

### Локальный сервер

```bash
# Python 3
cd site && python3 -m http.server 8000

# Или Node.js
cd site && npx serve
```

Открыть в браузере: `http://localhost:8000`

## 🌍 Мультиязычность

### Добавление нового языка

1. Создать файл `site/locales/{code}.json` по образцу `ru.json`
2. Добавить язык в `scripts/build-site-locales.py`:

```python
LANGUAGES = {
    "ru": {"file": "index.html", "lang": "ru", "dir": "ltr", "default": True},
    "en": {"file": "en.html", "lang": "en", "dir": "ltr", "default": False},
    "am": {"file": "am.html", "lang": "am", "dir": "ltr", "default": False},
    "xx": {"file": "xx.html", "lang": "xx", "dir": "ltr", "default": False},  # Новый язык
}
```

3. Пересобрать сайт: `python3 scripts/build-site-locales.py`

### Структура переводов

```json
{
  "nav": {
    "home": "Главная",
    "videos": "Видео",
    "about": "О стримере",
    "social": "Соцсети",
    "live": "СТРИМ"
  },
  "hero": {
    "title": "KINGOFJAVA777",
    "subtitle": "Легенда Lineage 2",
    "description": "...",
    "watch_now": "Смотреть стрим"
  }
}
```

## 🎨 Дизайн-система

Полная дизайн-система в `design-system/MASTER.md` включает:

- **Цвета:** все токены (background, accent, text, borders)
- **Типографика:** шрифты, размеры, веса
- **Отступы:** 8px grid system
- **Эффекты:** glow, shadows, animations
- **Компоненты:** buttons, cards, navigation
- **Accessibility:** контраст, focus states, keyboard nav

## 📱 Социальные сети KINGOFJAVA777

- **YouTube:** [@KINGOFJAVA777](https://www.youtube.com/@KINGOFJAVA777) (64.6K)
- **Telegram:** [@kingofjava777](https://t.me/kingofjava777) (40K)
- **TikTok:** [@kingofjava7777](https://www.tiktok.com/@kingofjava7777) (7K)
- **Instagram:** [@kingofjava777](https://www.instagram.com/kingofjava777/) (3K+)
- **Kick:** [kingofjava](https://kick.com/kingofjava) (10.2K)
- **VK:** [tophachside](https://vk.com/tophachside) (7.1K)

## 🎯 Особенности реализации

### Система частиц

- Canvas-based для производительности
- 50-80 золотых частиц
- Плавное движение вверх с горизонтальным sway
- Respect `prefers-reduced-motion`

### Scroll анимации

- Intersection Observer (не scroll events)
- Fade-in + slide-up
- Staggered entrance (100ms delay между элементами)
- Duration: 600ms, easing: cubic-bezier(0.16, 1, 0.3, 1)

### Видео плееры

- Lazy loading iframe'ов
- YouTube: автоматическая конвертация URL в embed
- TikTok: официальная embed библиотека
- Stream: проверка статуса (LIVE/OFFLINE)

### Language picker

- Dropdown с флагами
- Сохранение в localStorage
- Мгновенное переключение без перезагрузки
- Обновление `document.lang` атрибута

## 🚀 Деплой на GitHub Pages

### Настройка

1. Создать репозиторий на GitHub
2. Инициализировать git:

```bash
git init
git add .
git commit -m "Initial commit: KINGOFJAVA777 website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kingofjava777.git
git push -u origin main
```

3. Включить GitHub Pages в Settings → Pages → Source: `main` branch, folder: `/site`

### Автоматический деплой

Создать `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Build site
        run: python3 scripts/build-site-locales.py
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./site
```

## 📄 Лицензия

© 2024 KINGOFJAVA777. Все права защищены.

Дизайн разработан для стримера Lineage 2 — KINGOFJAVA777 (Степан, Армения).

---

**Разработано с** ❤️ **для сообщества Lineage 2**
