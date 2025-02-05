const API_KEY = 'AIzaSyCnwJ-PEA3yroXeiXL6rV_Ib0N1meHad70';
const SHEET_ID = '1aEXTCJLgTJAXx-jlmifkOYhDxhOfyEsIJDLJCNlFBi4';
const RANGE_ANNOUNCEMENTS = 'News!A2:E'; // Update with your actual range

async function fetchAnnouncements() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE_ANNOUNCEMENTS}?key=${API_KEY}`);
        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            console.error("Нет данных в таблице.");
            return;
        }

        const rows = data.values;
        const announcementGrid = document.getElementById('announcementGrid');

        rows.forEach(([id, title, startTime, endTime, link]) => {
            const imgUrl = `https://cicadagg.github.io/Biblioteka/images/${id}.webp`;
            const now = new Date();
            const start = new Date(startTime);
            const end = new Date(endTime);
            const timeRemaining = now < start ? `До начала: ${Math.ceil((start - now) / (1000 * 60 * 60 * 24))} дней` : `До конца: ${Math.ceil((end - now) / (1000 * 60 * 60 * 24))} дней`;
        
            const announcementItem = document.createElement('div');
            announcementItem.className = 'announcement-item';
            announcementItem.innerHTML = `
                <a href="${link}" target="_blank">
                    <img src="${imgUrl}" alt="${title}">
                </a>
                <div>${timeRemaining}</div>
            `;
        
            announcementGrid.appendChild(announcementItem);
        });
        
    } catch (error) {
        console.error("Ошибка при получении данных:", error);
    }
}

document.addEventListener('DOMContentLoaded', fetchAnnouncements);
