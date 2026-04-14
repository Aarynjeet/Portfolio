const form = document.getElementById('tipForm');
const email = document.getElementById('email');
const emailConfirm = document.getElementById('emailConfirm');
const emailError = document.getElementById('emailError');
const creditCard = document.getElementById('creditCard');
const ccError = document.getElementById('ccError');

function checkEmailMatch() {
    if (emailConfirm.value.length > 0 && email.value !== emailConfirm.value) {
        emailError.style.display = 'block';
    } else {
        emailError.style.display = 'none';
    }
}

email.addEventListener('input', checkEmailMatch);
emailConfirm.addEventListener('input', checkEmailMatch);

creditCard.addEventListener('input', function () {
    this.value = this.value.replace(/\D/g, '');
    if (this.value.length > 0 && !/^\d{16}$/.test(this.value)) {
        ccError.style.display = 'block';
    } else {
        ccError.style.display = 'none';
    }
});

form.addEventListener('submit', function (e) {
    let valid = true;
    let messages = [];

    const fields = form.querySelectorAll('input[required]');
    fields.forEach(function (field) {
        if (!field.value.trim()) {
            valid = false;
            messages.push(field.previousElementSibling.textContent + ' is required.');
        }
    });

    if (email.value !== emailConfirm.value) {
        valid = false;
        emailError.style.display = 'block';
        messages.push('Email addresses do not match.');
    }

    if (parseFloat(document.getElementById('billAmount').value) <= 0) {
        valid = false;
        messages.push('Bill amount must be greater than zero.');
    }

    if (parseInt(document.getElementById('tipPercent').value) < 0) {
        valid = false;
        messages.push('Tip percentage cannot be negative.');
    }

    if (!/^\d{16}$/.test(creditCard.value)) {
        valid = false;
        ccError.style.display = 'block';
        messages.push('Credit card must be exactly 16 digits.');
    }

    if (!valid) {
        e.preventDefault();
        alert('Please fix the following errors:\n\n• ' + messages.join('\n• '));
    }
});