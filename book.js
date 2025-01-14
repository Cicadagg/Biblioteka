const params = new URLSearchParams(window.location.search);
const imgId = params.get('imgId');
const name = params.get('name');
const description = decodeURIComponent(params.get('description'));
const author = params.get('author'); // Получаем автора
const year = params.get('year'); // Получаем год
const predmet = params.get('predmet'); // Получаем название предмета

// Проверяем, если year, author или predmet null, выводим предупреждение в консоли
if (!year) {
    console.warn('Year is null. Please check the URL parameters.');
}
if (!author) {
    console.warn('Author is null. Please check the URL parameters.');
}
if (!predmet) {
    console.warn('Predmet is null. Please check the URL parameters.');
}

// Логирование значений для отладки
console.log('Author:', author);
console.log('Year:', year);
console.log('Predmet:', predmet);

// Устанавливаем данные книги
document.getElementById('bookTitle').innerText = name;

// Формируем URL для изображения
const imgUrl = `https://raw.githubusercontent.com/Cicadagg/Biblioteka/main/images/${imgId}.webp`;
const defaultImgUrl = `https://raw.githubusercontent.com/Cicadagg/Biblioteka/main/images/not_book.webp`;


// Устанавливаем изображение с обработчиком ошибок
const bookImgElement = document.getElementById('bookImg');
bookImgElement.src = imgUrl; // Устанавливаем основной URL изображения
bookImgElement.onerror = () => {
    bookImgElement.src = defaultImgUrl; // Устанавливаем изображение по умолчанию, если основное не найдено
};

// Устанавливаем описание книги
document.getElementById('bookDescription').innerHTML = description;

// Устанавливаем автора, год и название предмета в отдельный div
const authorYearPredmetElement = document.getElementById('bookAuthorYear');
if (author && year && predmet) {
    authorYearPredmetElement.innerText = `${author}, ${year}, ${predmet}`;
} else {
    authorYearPredmetElement.innerText = 'Информация о авторе, годе или предмете отсутствует.';
}
