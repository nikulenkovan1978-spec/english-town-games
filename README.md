# English Town

Готовый статический сайт с тремя образовательными играми:

**Онлайн-версия:** https://nikulenkovan1978-spec.github.io/english-town-games/

1. English Town: First Meeting — диалоговая визуальная новелла.
2. Penny’s Number Dash — аркада на числа 1–6.
3. Archie’s Color Lab — творческая игра на цвета.

## Запуск через Vite

Требуется Node.js 20.19+ или 22.12+.

```bash
npm install
npm run dev
```

После запуска Vite автоматически откроет сайт по адресу `http://localhost:5173/`.

Для проверки production-сборки:

```bash
npm run build
npm run preview
```

Английская речь воспроизводится встроенным синтезатором браузера. Прогресс ученика, сердца, монеты, значки и история сессий сохраняются в `localStorage` этого браузера.

## Файлы

- `index.html` — точка входа;
- `src/styles.css` — дизайн и адаптивность;
- `src/main.js` — задания, игры, профиль и награды;
- `public/assets/characters/` — изображения Penny, Archie, Leo и Mia;
- `instrtxt`, `GAME_TASKS_SPEC.md`, `VISUAL_DESIGN_SPEC.md` — исходные требования.

## Проверка

Сайт рассчитан на мышь, клавиатуру и сенсорный экран. Для переключения дорожек в Number Dash можно использовать стрелки клавиатуры или свайп.
