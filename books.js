const API_KEY = 'AIzaSyCnwJ-PEA3yroXeiXL6rV_Ib0N1meHad70'; // Ваш API Key
const SHEET_ID = '1aEXTCJLgTJAXx-jlmifkOYhDxhOfyEsIJDLJCNlFBi4'; // ID вашей таблицы
const RANGE_BOOKS = 'Books!A2:I'; // Укажите диапазон данных для книг
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
            // Проверяем, что название категории существует и содержит 3 или более букв
            if (category && category.length >= 3) {
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
        const prioritySorted = priorityCategories.filter(cat => categoriesCount[cat]);
        const otherCategories = Object.keys(categoriesCount).filter(cat => !priorityCategories.includes(cat));

        // Объединяем приоритетные категории с остальными
        const sortedCategories = [...prioritySorted, ...otherCategories];

        const categoryButtons = document.getElementById('categoryButtons');
        
        if (categoryButtons) {
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
        } else {
            console.error("Элемент для кнопок категорий не найден.");
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

        async function checkImageExists(url) {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = url;
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
            });
        }

        async function displayBooks(books) {
            grid.innerHTML = ''; // Очищаем предыдущие элементы
            for (const row of books) {
                if (row.length < 6) { 
                    console.warn("Недостаточно данных в строке:", row);
                    continue; 
                }
        
                const imgId = row[0]; 
                const category = row[1]; 
                const predmet = row[2]; 
                let name = row[3]; 
                const year = row[4]; 
                const description = row[5]; 
                const author = row[6]; 
                const content = row[7]; 
                const sledkniga = row[8];

                // Обрезаем название книги, если оно превышает 30 символов
                if (name.length > 30) {
                    name = name.substring(0, 30) + '...';
                }
                
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

        // Сортируем книги по sledkniga и сохраняем порядок, если sledkniga не указан
        let orderedBooks;
        
        if (filteredRows.some(row => row[8])) { // Если есть хотя бы одна книга с sledkniga
            orderedBooks = [];
            const booksMap = new Map();

            filteredRows.forEach(row => {
                booksMap.set(row[0], { row, sledkniga: row[8] });
            });

            filteredRows.forEach(row => {
                if (!row[8]) { // Книги без sledkniga добавляются сразу
                    orderedBooks.push(row);
                } else if (booksMap.has(row[8])) { // Если есть sledkniga, добавляем после указанной книги
                    orderedBooks.splice(orderedBooks.indexOf(booksMap.get(row[8]).row) + 1, 0, row);
                }
            });
            
            // Добавляем оставшиеся книги, которые не были вставлены
            filteredRows.forEach(row => {
                if (!orderedBooks.includes(row)) {
                    orderedBooks.push(row);
                }
            });
            
        } else { // Если нет sledkniga, сохраняем порядок как есть
            orderedBooks = filteredRows;
        }

        await displayBooks(orderedBooks);

        searchInput.addEventListener('input', async () => {
            const searchTerm = searchInput.value.toLowerCase();
            const searchFilteredRows = orderedBooks.filter(row => row[2].toLowerCase().includes(searchTerm));
            bookCount.textContent = `Всего книг: ${searchFilteredRows.length}`;
            grid.style.opacity = 0; 
            setTimeout(async () => {
                await displayBooks(searchFilteredRows);
            }, 300); 
        });

    } catch (error) {
        console.error("Ошибка при получении данных:", error);
    }
}

fetchCategories(); // Вызываем функцию для загрузки категорий
fetchBooks(); // Вызываем функцию для загрузки книг
