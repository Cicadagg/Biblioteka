const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');

menuToggle.addEventListener('click', () => {
    sidebar.style.display = sidebar.style.display === 'block' ? 'none' : 'block';
});
