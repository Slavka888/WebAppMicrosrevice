const tasksList = document.getElementById('tasksList');
const finishTaskButton = document.getElementById('finishTaskButton');
const logoutButton = document.getElementById('logoutButton');
const refreshButton = document.getElementById('refreshButton');
const selectionInfo = document.getElementById('selectionInfo');
const workerEmailElement = document.getElementById('workerEmail');

let tasks = [];
let selectedTaskId = null;
let currentTab = 'active';

document.addEventListener('DOMContentLoaded', () => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
        window.location.href = 'index.html';
        return;
    }

    workerEmailElement.textContent = email;
    logoutButton.addEventListener('click', () => {
        if (confirm('Выйти из аккаунта?')) logout();
    });
    refreshButton.addEventListener('click', loadCurrentTasks);

    document.querySelectorAll('.tasks-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentTab = tab.dataset.tab;
            document.querySelectorAll('.tasks-tab').forEach(item => item.classList.remove('tasks-tab--active'));
            tab.classList.add('tasks-tab--active');
            selectedTaskId = null;
            updateSelection();
            loadCurrentTasks();
        });
    });

    finishTaskButton.addEventListener('click', completeSelectedTask);
    loadCurrentTasks();

    setInterval(() => {
        if (document.visibilityState === 'visible') loadCurrentTasks();
    }, 10000);
});

async function loadCurrentTasks() {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    tasksList.innerHTML = '<div class="tasks-section__empty">Загрузка...</div>';

    try {
        const endpoint = currentTab === 'completed'
            ? `/api/tasks/completed?email=${encodeURIComponent(email)}`
            : `/api/tasks?email=${encodeURIComponent(email)}`;

        tasks = await apiRequest(endpoint) || [];
        selectedTaskId = null;
        renderTasks();
        updateSelection();
    } catch (error) {
        console.error(error);
        tasksList.innerHTML = `<div class="tasks-section__empty">${escapeHtml(error.message || 'Не удалось загрузить задачи.')}</div>`;
    }
}

function renderTasks() {
    tasksList.innerHTML = '';

    if (!tasks.length) {
        tasksList.innerHTML = `<div class="tasks-section__empty">${
            currentTab === 'completed' ? 'Выполненных задач пока нет.' : 'Активных задач нет.'
        }</div>`;
        return;
    }

    tasks.forEach(task => {
        const card = document.createElement('article');
        card.className = 'task-card';
        card.dataset.id = task.id;
        card.innerHTML = `
            <div class="task-card__top">
                <span class="task-card__status">${escapeHtml(task.status || currentTab.toUpperCase())}</span>
                <span class="task-card__date">${escapeHtml(formatDate(task.createdAt))}</span>
            </div>
            <p class="task-card__text">${escapeHtml(task.text)}</p>
            ${task.id != null ? `<span class="task-card__id">#${escapeHtml(task.id)}</span>` : ''}
        `;

        if (task.id === selectedTaskId) card.classList.add('task-card--selected');

        if (currentTab === 'active') {
            card.addEventListener('click', () => {
                selectedTaskId = task.id;
                document.querySelectorAll('.task-card').forEach(item => item.classList.remove('task-card--selected'));
                card.classList.add('task-card--selected');
                updateSelection();
            });
        }

        tasksList.appendChild(card);
    });
}

function updateSelection() {
    const selected = tasks.find(task => task.id === selectedTaskId);
    finishTaskButton.disabled = !selected || currentTab !== 'active';
    selectionInfo.textContent = selected ? `Выбрана задача #${selected.id}` : 'Задача не выбрана';
}

async function completeSelectedTask() {
    if (selectedTaskId == null) return;

    finishTaskButton.disabled = true;
    try {
        await apiRequest(`/api/tasks/${encodeURIComponent(selectedTaskId)}/complete`, { method: 'PUT' });
        alert('Задача отмечена как выполненная.');
        await loadCurrentTasks();
    } catch (error) {
        alert(error.message || 'Не удалось завершить задачу.');
        updateSelection();
    }
}
