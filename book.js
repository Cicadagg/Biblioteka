const params = new URLSearchParams(window.location.search);
const imgId = params.get('imgId');
const name = params.get('name');
const description = decodeURIComponent(params.get('description'));
const author = params.get('author'); 
const year = params.get('year'); 
const predmet = params.get('predmet'); 
const content = decodeURIComponent(params.get('content')); // Получаем content

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
console.log('Content:', content); // Логируем content

// Устанавливаем данные книги
document.getElementById('bookTitle').innerText = name;

// Формируем URL для изображения
const imgUrl = `https://cicadagg.github.io/Biblioteka/images/${imgId}.webp`;
const defaultImgUrl = `https://cicadagg.github.io/Biblioteka/images/not_book.webp`;

// Устанавливаем изображение с обработчиком ошибок
const bookImgElement = document.getElementById('bookImg');
bookImgElement.src = imgUrl; 
bookImgElement.onerror = () => {
    bookImgElement.src = defaultImgUrl; 
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

// Устанавливаем контент книги (если необходимо)
document.getElementById('bookContent').innerText = content || 'Контент отсутствует.'; // Добавьте элемент с id 'bookContent' в HTML
