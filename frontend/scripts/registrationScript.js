document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    if (!form) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        clearErrors();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const button = form.querySelector('button[type="submit"]');

        if (!email || !password) {
            showError('emailError', 'Пожалуйста, заполните все поля.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('emailError', 'Введите корректный email.');
            return;
        }
        if (password.length < 5) {
            showError('passwordError', 'Пароль должен содержать минимум 5 символов.');
            return;
        }

        button.disabled = true;
        try {
            const data = await apiRequest('/api/users/register', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (data?.message && !/successfully|успеш/i.test(data.message)) {
                throw new Error(data.message);
            }

            alert('Регистрация выполнена успешно. Теперь войдите в систему.');
            window.location.href = 'index.html';
        } catch (error) {
            showError('emailError', error.message || 'Не удалось зарегистрировать пользователя.');
        } finally {
            button.disabled = false;
        }
    });

    function showError(id, message) {
        const element = document.getElementById(id);
        if (element) element.textContent = message;
    }

    function clearErrors() {
        document.getElementById('emailError').textContent = '';
        document.getElementById('passwordError').textContent = '';
    }
});
