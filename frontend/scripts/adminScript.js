const workerSelect = document.getElementById('workerSelect');
const workerSelectView = document.getElementById('workerSelectView');
const taskInput = document.getElementById('taskInput');
const taskForm = document.getElementById('taskForm');
const deleteWorkerButton = document.getElementById('deleteWorkerButton');
const logoutButton = document.getElementById('logoutButton');
const refreshWorkersButton = document.getElementById('refreshWorkersButton');
const workerTasksList = document.getElementById('workerTasksList');
const workerTaskCount = document.getElementById('workerTaskCount');

document.addEventListener('DOMContentLoaded', () => {
    const adminEmail = localStorage.getItem('adminEmail');
    if (!adminEmail) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('adminEmail').textContent = adminEmail;
    taskForm.addEventListener('submit', createTask);
    workerSelectView.addEventListener('change', loadWorkerTasks);
    refreshWorkersButton.addEventListener('click', loadWorkers);
    deleteWorkerButton.addEventListener('click', deleteWorker);
    logoutButton.addEventListener('click', () => {
        if (confirm('Выйти из аккаунта администратора?')) logout();
    });

    loadWorkers();
});

async function loadWorkers() {
    try {
        setWorkerControlsDisabled(true);
        const workers = await apiRequest('/api/users/workers') || [];
        populateWorkerSelects(workers);

        const selected = workerSelectView.value;
        if (selected) await loadWorkerTasks();
        else showWorkerTasks([]);
    } catch (error) {
        console.error(error);
        alert(error.message || 'Не удалось загрузить список работников.');
    } finally {
        setWorkerControlsDisabled(false);
    }
}

function populateWorkerSelects(workers) {
    [workerSelect, workerSelectView].forEach(select => {
        const oldValue = select.value;
        select.innerHTML = '<option value="">Выберите работника</option>';

        workers.forEach(email => {
            const option = document.createElement('option');
            option.value = email;
            option.textContent = email;
            select.appendChild(option);
        });

        if (workers.includes(oldValue)) select.value = oldValue;
    });
}

async function createTask(event) {
    event.preventDefault();

    const email = workerSelect.value;
    const text = taskInput.value.trim();

    if (!email) {
        alert('Выберите работника.');
        return;
    }
    if (!text) {
        alert('Введите описание задачи.');
        return;
    }

    const button = document.getElementById('sendTaskButton');
    button.disabled = true;

    try {
        await apiRequest('/api/tasks', {
            method: 'POST',
            body: JSON.stringify({ email, text })
        });

        alert('Задача успешно создана.');
        taskInput.value = '';

        if (workerSelectView.value === email) await loadWorkerTasks();
    } catch (error) {
        alert(error.message || 'Не удалось создать задачу.');
    } finally {
        button.disabled = false;
    }
}

async function loadWorkerTasks() {
    const email = workerSelectView.value;
    if (!email) {
        showWorkerTasks([]);
        return;
    }

    workerTasksList.innerHTML = '<div class="worker-tasks__empty">Загрузка...</div>';
    try {
        const tasks = await apiRequest(`/api/tasks/admin?email=${encodeURIComponent(email)}`) || [];
        showWorkerTasks(tasks);
    } catch (error) {
        console.error(error);
        workerTasksList.innerHTML = `<div class="worker-tasks__empty">${escapeHtml(error.message || 'Не удалось загрузить задачи.')}</div>`;
        workerTaskCount.textContent = '—';
    }
}

function showWorkerTasks(tasks) {
    workerTaskCount.textContent = `${tasks.length} ${tasks.length === 1 ? 'задача' : 'задач'}`;

    if (!tasks.length) {
        workerTasksList.innerHTML = '<div class="worker-tasks__empty">У этого работника нет задач.</div>';
        return;
    }

    workerTasksList.innerHTML = '';
    tasks.forEach(task => {
        const item = document.createElement('article');
        item.className = `worker-task worker-task--${String(task.status || '').toLowerCase()}`;
        item.innerHTML = `
            <div class="worker-task__top">
                <strong>#${escapeHtml(task.id)}</strong>
                <span>${escapeHtml(task.status || '—')}</span>
            </div>
            <p>${escapeHtml(task.text)}</p>
            <small>${escapeHtml(formatDate(task.createdAt))}</small>
        `;
        workerTasksList.appendChild(item);
    });
}

async function deleteWorker() {
    const email = workerSelectView.value;
    if (!email) {
        alert('Выберите работника.');
        return;
    }

    if (!confirm(`Удалить работника ${email}? Все его задачи также будут удалены через событие USER_DELETED.`)) {
        return;
    }

    deleteWorkerButton.disabled = true;
    try {
        await apiRequest('/api/users', {
            method: 'DELETE',
            body: JSON.stringify({ email, password: '' })
        });

        alert('Работник удалён.');
        await loadWorkers();
    } catch (error) {
        alert(error.message || 'Не удалось удалить работника.');
    } finally {
        deleteWorkerButton.disabled = false;
    }
}

function setWorkerControlsDisabled(disabled) {
    workerSelect.disabled = disabled;
    workerSelectView.disabled = disabled;
    refreshWorkersButton.disabled = disabled;
}
