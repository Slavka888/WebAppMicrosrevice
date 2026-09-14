const backendUrl = 'http://localhost:8080';
const workerSelect = document.getElementById('workerSelect');
const workerSelectDelete = document.getElementById('workerSelectDelete');
const taskInput = document.getElementById('taskInput');
const sendTaskButton = document.getElementById('sendTaskButton');
const deleteWorkerButton = document.getElementById('deleteWorkerButton');
const logoutButton = document.getElementById('logoutButton');

// Загрузка списка работников при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadWorkers();
    setupLogout();
});

async function loadWorkers() {
    try {
        const response = await fetch(`${backendUrl}/workers`);

        if (!response.ok) {
            throw new Error('Ошибка при загрузке списка работников');
        }

        const workers = await response.json();
        populateWorkerSelects(workers);
    } catch (error) {
        console.error('Ошибка загрузки списка работников:', error);
        showError('Не удалось загрузить список работников');
    }
}

function populateWorkerSelects(workers) {
    // Очищаем оба select'а
    workerSelect.innerHTML = '<option value="">Выберите работника</option>';
    workerSelectDelete.innerHTML = '<option value="">Выберите работника</option>';

    // Добавляем работников в оба select'а
    workers.forEach(email => {
        // Для отправки задачи
        const option1 = document.createElement('option');
        option1.value = email;
        option1.textContent = email;
        workerSelect.appendChild(option1);

        // Для удаления работника
        const option2 = document.createElement('option');
        option2.value = email;
        option2.textContent = email;
        workerSelectDelete.appendChild(option2);
    });
}

sendTaskButton.addEventListener('click', async () => {
    const selectedWorkerEmail = workerSelect.value;
    const taskText = taskInput.value.trim();

    // Валидация
    if (!selectedWorkerEmail) {
        showError('Пожалуйста, выберите работника');
        return;
    }

    if (!taskText) {
        showError('Пожалуйста, введите текст задачи');
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                workerEmail: selectedWorkerEmail,
                taskText: taskText
            })
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        showSuccess('Задача успешно отправлена!');
        taskInput.value = '';
    } catch (error) {
        console.error('Ошибка при отправке задачи:', error);
        showError('Ошибка при отправке задачи');
    }
});

deleteWorkerButton.addEventListener('click', async () => {
    const selectedWorkerEmail = workerSelectDelete.value;

    // Валидация
    if (!selectedWorkerEmail) {
        showError('Пожалуйста, выберите работника для удаления');
        return;
    }

    // Подтверждение удаления
    if (!confirm(`Вы уверены, что хотите удалить работника ${selectedWorkerEmail}?`)) {
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/delete`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                workerEmail: selectedWorkerEmail
            })
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }

        showSuccess('Работник успешно удален!');
        await loadWorkers(); // Обновляем список работников
    } catch (error) {
        console.error('Ошибка при удалении работника:', error);
        showError('Ошибка при удалении работника');
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

function showError(message) {
    alert(`${message}`);
}

function showSuccess(message) {
    alert(`${message}`);
}