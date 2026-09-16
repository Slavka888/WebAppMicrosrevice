document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('authorizationForm');
    if (!form) return;

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async event => {
        event.preventDefault();
        clearErrors();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showError('emailError', 'Пожалуйста, заполните все поля.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('emailError', 'Введите корректный email.');
            return;
        }

        submitButton.disabled = true;
        try {
            const data = await apiRequest('/api/users/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (data?.role === 'ADMIN') {
                localStorage.setItem('adminEmail', email);
                localStorage.removeItem('userEmail');
                window.location.href = 'admin.html';
                return;
            }

            if (data?.role === 'USER') {
                localStorage.setItem('userEmail', email);
                localStorage.removeItem('adminEmail');
                window.location.href = 'worker.html';
                return;
            }

            showError('emailError', data?.message || 'Пользователь не найден. Зарегистрируйтесь.');
        } catch (error) {
            showError('emailError', error.message || 'Не удалось выполнить вход.');
        } finally {
            submitButton.disabled = false;
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
