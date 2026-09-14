document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');
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
        sendRegistrationRequest(email, password);
    });

    function sendRegistrationRequest(email, password) {
        fetch(`${backendUrl}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errData => {
                        throw new Error(errData.message || 'Ошибка при регистрации');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Успешная регистрация:', data);
                showSuccess('Регистрация выполнена успешно! Перенаправление на страницу входа...');

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            })
            .catch(error => {
                console.error('Ошибка:', error);
                showError('emailError', error.message || 'Произошла ошибка при регистрации');
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