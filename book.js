const params = new URLSearchParams(window.location.search);
const imgId = params.get('imgId');
const name = params.get('name');
const description = decodeURIComponent(params.get('description'));

// Устанавливаем данные книги
document.getElementById('bookTitle').innerText = name;
document.getElementById('bookImg').src = `C:/bibliotekakgtk/images/${imgId}.webp`; // Предполагаем, что изображения имеют формат .webp
document.getElementById('bookDescription').innerHTML = description;