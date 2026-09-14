const backendUrl = 'http://localhost:8080';
const tasksList = document.getElementById('tasksList');
const finishTaskButton = document.getElementById('finishTaskButton');
const logoutButton = document.getElementById('logoutButton');

let tasks = [];
let selectedTaskIndex = -1;

// Загрузка задач при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const userEmail = localStorage.getItem('userEmail');

    if (!userEmail) {
        window.location.href = 'index.html';
        return;
    }

    loadTasks(userEmail);
    setupLogout();

    // Обновляем задачи каждые 5 секунд
    setInterval(() => loadTasks(userEmail), 5000);
});

async function loadTasks(userEmail) {
    try {
        const response = await fetch(`${backendUrl}/getTasks?email=${userEmail}`);

        if (!response.ok) {
            throw new Error('Ошибка при загрузке задач');
        }

        let data = await response.json();
        tasks = [data.task];
        renderTasks();
        selectedTaskIndex = -1;
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        showTasksEmpty();
    }
}

function renderTasks() {
    tasksList.innerHTML = '';

    if (tasks.length === 0) {
        showTasksEmpty();
        return;
    }

    tasks.forEach((task, index) => {
        const taskCard = createTaskCard(task, index);
        tasksList.appendChild(taskCard);
    });
}

function createTaskCard(task, index) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.innerHTML = `<p class="task-card__text">${escapeHtml(task)}</p>`;

    card.addEventListener('click', () => {
        // Убираем выделение со всех карточек
        document.querySelectorAll('.task-card').forEach(c => {
            c.classList.remove('task-card--selected');
        });

        // Добавляем выделение текущей карточке
        card.classList.add('task-card--selected');
        selectedTaskIndex = index;
    });

    return card;
}

function showTasksEmpty() {
    tasksList.innerHTML = '<div class="tasks-section__empty">Нет активных задач</div>';
}

finishTaskButton.addEventListener('click', async () => {
    if (selectedTaskIndex === -1) {
        showError('Пожалуйста, выберите задачу для выполнения');
        return;
    }

    const userEmail = localStorage.getItem('userEmail');
    const taskText = tasks[selectedTaskIndex];

    try {
        const response = await fetch(`${backendUrl}/deleteTasks?email=${userEmail}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                taskText: taskText
            })
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        showSuccess('Задача отмечена как выполненная!');
        await loadTasks(userEmail);
    } catch (error) {
        console.error('Ошибка при завершении задачи:', error);
        showError('Ошибка при завершении задачи');
    }
});

function setupLogout() {
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите выйти?')) {
                localStorage.removeItem('userEmail');
                window.location.href = 'index.html';
            }
        });
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showError(message) {
    alert(`${message}`);
}

function showSuccess(message) {
    alert(`${message}`);
}