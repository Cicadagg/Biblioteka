const API_KEY = 'AIzaSyCnwJ-PEA3yroXeiXL6rV_Ib0N1meHad70'; // Ваш API Key
const SHEET_ID = '1aEXTCJLgTJAXx-jlmifkOYhDxhOfyEsIJDLJCNlFBi4'; // ID вашей таблицы
const RANGE_BOOKS = 'Books!A2:G'; // Укажите диапазон данных для книг
const RANGE_CATEGORIES = 'Books!B2:B'; // Укажите диапазон данных для категорий

async function fetchCategories() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_CATEGORIES}?key=${API_KEY}`);
        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            console.error("Нет данных в таблице.");
            return;
        }

        const categoriesCount = {}; // Объект для хранения количества книг по категориям
        data.values.forEach(row => {
            const category = row[0];
            if (category) {
                categoriesCount[category] = (categoriesCount[category] || 0) + 1; // Увеличиваем счетчик для категории
            }
        });

        const categoryButtons = document.getElementById('categoryButtons');
        for (const [category, count] of Object.entries(categoriesCount)) {
            const button = document.createElement('button');
            button.className = 'category-button';
            button.textContent = `${category} (${count})`; // Отображаем название категории и количество книг
            button.onclick = () => {
                window.location.href = `category.html?category=${encodeURIComponent(category)}`; // Переход на страницу категории
            };
            categoryButtons.appendChild(button);
        }
    } catch (error) {
        console.error("Ошибка при получении категорий:", error);
    }
}

async function fetchBooks() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_BOOKS}?key=${API_KEY}`);
        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            console.error("Нет данных в таблице.");
            return;
        }

        const rows = data.values;
        const grid = document.getElementById('bookGrid');
        const bookCount = document.getElementById('bookCount');
        const searchInput = document.getElementById('searchInput');
        const categoryTitle = document.getElementById('categoryTitle');

        // Извлекаем категорию из URL
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        
        // Устанавливаем заголовок категории
        if (category) {
            categoryTitle.textContent = `Книги в категории: ${category}`;
        }

        // Фильтруем книги по категории, если категория задана
        const filteredRows = category ? rows.filter(row => row[1] === category) : rows;

        // Отображаем общее количество книг
        bookCount.textContent = `Всего книг: ${filteredRows.length}`;

        // Функция для проверки существования изображения
        async function checkImageExists(url) {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = url;
                img.onload = () => resolve(true); // Если изображение загружено, возвращаем true
                img.onerror = () => resolve(false); // Если ошибка загрузки, возвращаем false
            });
        }

        async function displayBooks(books) {
            grid.innerHTML = ''; // Очищаем предыдущие элементы
            for (const row of books) {
                if (row.length < 7) { // Проверяем, что в строке достаточно данных (7 вместо 6)
                    console.warn("Недостаточно данных в строке:", row);
                    continue; // Проверка на наличие всех данных
                }
        
                const imgId = row[0]; // Получаем идентификатор книги
                const category = row[1]; // Получаем категорию
                const predmet = row[2]; // Получаем название предмета
                const name = row[3]; // Получаем название книги
                const year = row[4]; // Получаем год книги
                const description = row[5]; // Получаем описание книги
                const author = row[6]; // Получаем автора книги
        
                // Формируем URL для изображения
                const imgUrl = `https://cicadagg.github.io/Biblioteka/images/${imgId}.webp`;
                const defaultImgUrl = `https://cicadagg.github.io/Biblioteka/images/not_book.webp`;

        
                // Проверка доступности изображения
                const imgExists = await checkImageExists(imgUrl);
        
                const bookItem = document.createElement('div');
                bookItem.className = 'book-item';
                bookItem.innerHTML = `
                    <a href="book.html?imgId=${imgId}&name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}&author=${encodeURIComponent(author)}&year=${encodeURIComponent(year)}&predmet=${encodeURIComponent(predmet)}">
                        <div class="book-image">
                            <img src="${imgExists ? imgUrl : defaultImgUrl}" alt="${name}">
                            <div class="book-year">${year}</div> <!-- Добавляем год книги -->
                        </div>
                        <div class="book-name">${name}</div>
                    </a>
                `;
                grid.appendChild(bookItem);
            }
        
            // Анимация появления
            grid.style.opacity = 1; // Устанавливаем непрозрачность в 1 для отображения
        }
        
        
        

        // Изначально отображаем отфильтрованные книги
        await displayBooks(filteredRows); // Добавлено await для асинхронного вызова

        // Добавляем обработчик события для фильтрации
        searchInput.addEventListener('input', async () => {
            const searchTerm = searchInput.value.toLowerCase();
            const searchFilteredRows = filteredRows.filter(row => row[2].toLowerCase().includes(searchTerm)); // Изменили индекс на 2 для поиска по названию
            bookCount.textContent = `Всего книг: ${searchFilteredRows.length}`; // Обновляем количество книг
            grid.style.opacity = 0; // Устанавливаем непрозрачность в 0 для скрытия
            setTimeout(async () => {
                await displayBooks(searchFilteredRows); // Отображаем отфильтрованные книги после задержки
            }, 300); // Задержка, чтобы анимация исчезновения сработала
        });

    } catch (error) {
        console.error("Ошибка при получении данных:", error);
    }
}

fetchCategories(); // Вызываем функцию для загрузки категорий
fetchBooks(); // Вызываем функцию для загрузки книг
