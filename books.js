const API_KEY = 'AIzaSyCnwJ-PEA3yroXeiXL6rV_Ib0N1meHad70'; // Ваш API Key
const SHEET_ID = '1aEXTCJLgTJAXx-jlmifkOYhDxhOfyEsIJDLJCNlFBi4'; // ID вашей таблицы
const RANGE_BOOKS = 'Books!A2:H'; // Укажите диапазон данных для книг
const RANGE_CATEGORIES = 'Books!B2:B'; // Укажите диапазон данных для категорий

async function fetchCategories() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_CATEGORIES}?key=${API_KEY}`);
        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            console.error("Нет данных в таблице.");
            return;
        }

        const categoriesCount = {};
        data.values.forEach(row => {
            const category = row[0];
            if (category) {
                categoriesCount[category] = (categoriesCount[category] || 0) + 1;
            }
        });

        // Определяем приоритетные категории
        const priorityCategories = [
            "Общеобразовательные дисциплины",
            "Социально-гуманитарный цикл",
            "Общепрофессиональный цикл"
        ];

        // Разделяем категории на приоритетные и остальные
        const prioritySorted = priorityCategories.filter(cat => categoriesCount[cat]); // Сохраняем только те, которые есть в данных
        const otherCategories = Object.keys(categoriesCount).filter(cat => !priorityCategories.includes(cat));

        // Объединяем приоритетные категории с остальными
        const sortedCategories = [...prioritySorted, ...otherCategories];

        const categoryButtons = document.getElementById('categoryButtons');
        sortedCategories.forEach(category => {
            const count = categoriesCount[category];
            const button = document.createElement('button');
            button.className = 'category-button';
            button.textContent = `${category} (${count})`;
            button.onclick = () => {
                window.location.href = `category.html?category=${encodeURIComponent(category)}`;
            };
            categoryButtons.appendChild(button);
        });
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
                if (row.length < 7) { // Изменено на 8
                    console.warn("Недостаточно данных в строке:", row);
                    continue; 
                }
        
                const imgId = row[0]; 
                const category = row[1]; 
                const predmet = row[2]; 
                const name = row[3]; 
                const year = row[4]; 
                const description = row[5]; 
                const author = row[6]; 
                const content = row[7]; // Теперь вы можете использовать content
                
                const imgUrl = `https://cicadagg.github.io/Biblioteka/images/${imgId}.webp`;
                const defaultImgUrl = `https://cicadagg.github.io/Biblioteka/images/not_book.webp`; 
                
                const imgExists = await checkImageExists(imgUrl);
        
                const bookItem = document.createElement('div');
                bookItem.className = 'book-item';
                bookItem.innerHTML = `
                    <a href="book.html?imgId=${imgId}&name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}&author=${encodeURIComponent(author)}&year=${encodeURIComponent(year)}&predmet=${encodeURIComponent(predmet)}&content=${encodeURIComponent(content)}">
                        <div class="book-image">
                            <img src="${imgExists ? imgUrl : defaultImgUrl}" alt="${name}">
                            <div class="book-year">${year}</div> 
                        </div>
                        <div class="book-name">${name}</div>
                    </a>
                `;

                
                grid.appendChild(bookItem);
        
                // Установите высоту book-item в зависимости от высоты book-name
                const bookNameElement = bookItem.querySelector('.book-name');
                const computedStyle = window.getComputedStyle(bookNameElement);
                const height = parseFloat(computedStyle.lineHeight) * Math.ceil(bookNameElement.scrollHeight / parseFloat(computedStyle.lineHeight));
                
                bookItem.style.height = `${height + 70}px`; // Добавьте дополнительное пространство
            }
        
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
