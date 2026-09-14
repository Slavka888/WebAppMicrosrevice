document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('authorizationForm');
    const backendUrl = 'http://localhost:8080';

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Очищаем старые ошибки
        clearErrors();

        // Валидация
        if (!email || !password) {
            showError('emailError', 'Пожалуйста, заполните все поля');
            return;
        }

        if (!isValidEmail(email)) {
            showError('emailError', 'Пожалуйста, введите корректный email');
            return;
        }

        if (password.length < 5) {
            showError('passwordError', 'Пароль должен содержать минимум 5 символов');
            return;
        }

        // Отправка на сервер
        sendAuthRequest(email, password);
    });

    function sendAuthRequest(email, password) {
        fetch(`${backendUrl}/authorization`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || 'Ошибка при авторизации');
                    });
                }
                return response.json();
            })
            .then(data => {
                // console.log('Успешная авторизация:', data);
                // localStorage.setItem('userEmail', email);
                // showSuccess('Вход выполнен успешно!');

                setTimeout(() => {
                    if (data.Role === 'IsAdmin') {
                        console.log('Успешная авторизация:', data);
                        localStorage.setItem('adminEmail', email);
                        showSuccess('Вход выполнен успешно!');
                        window.location.href = 'admin.html';
                    } else if (data.Role === 'IsUser') {
                        console.log('Успешная авторизация:', data);
                        localStorage.setItem('userEmail', email);
                        showSuccess('Вход выполнен успешно!');
                        window.location.href = 'worker.html';
                    } else {
                        console.log('Необходима регистрация:', data);
                        showSuccess('Пожалуйста, зарегистрируйтесь!');
                        window.location.href = 'registration.html';
                    }
                }, 500);
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showError('emailError', error.message || 'Произошла ошибка при авторизации');
            });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function clearErrors() {
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
    }

    function showSuccess(message) {
        alert(message);
    }
});