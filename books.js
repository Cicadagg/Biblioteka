const API_KEY = 'AIzaSyCnwJ-PEA3yroXeiXL6rV_Ib0N1meHad70'; // Ваш API Key
const SHEET_ID = '1aEXTCJLgTJAXx-jlmifkOYhDxhOfyEsIJDLJCNlFBi4'; // ID вашей таблицы
const RANGE = 'Books!A2:C'; // Укажите диапазон данных

async function fetchBooks() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`);
        
        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            console.error("Нет данных в таблице.");
            return;
        }

        const rows = data.values;
        const grid = document.getElementById('bookGrid');

        rows.forEach(row => {
            if (row.length < 3) {
                console.warn("Недостаточно данных в строке:", row);
                return; // Проверка на наличие всех данных
            }

            const imgId = row[0]; // Получаем идентификатор изображения
            const name = row[1];   // Получаем название книги
            const description = row[2]; // Получаем описание книги

            // Формируем URL для изображения
            const imgUrl = `C:/bibliotekakgtk/images/${imgId}.webp`; // Предполагаем, что изображения имеют формат .webp

            const bookItem = document.createElement('div');
            bookItem.className = 'book-item';
            bookItem.innerHTML = `
                <a href="book.html?imgId=${imgId}&name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}">
                    <div class="book-image">
                        <img src="${imgUrl}" alt="${name}">
                    </div>
                    <div class="book-name">${name}</div>
                </a>
            `;
            grid.appendChild(bookItem);
        });
    } catch (error) {
        console.error("Ошибка при получении данных:", error);
    }
}

fetchBooks();
