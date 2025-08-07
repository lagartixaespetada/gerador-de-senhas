// Configurações de caracteres
const characterSets = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Caracteres similares para exclusão
const similarCharacters = 'il1Lo0O';

// Elementos DOM
const elements = {
    passwordField: document.getElementById('password'),
    togglePassword: document.getElementById('togglePassword'),
    copyPassword: document.getElementById('copyPassword'),
    generateBtn: document.getElementById('generate'),
    lengthSlider: document.getElementById('length'),
    lengthValue: document.getElementById('lengthValue'),
    uppercaseCheck: document.getElementById('uppercase'),
    lowercaseCheck: document.getElementById('lowercase'),
    numbersCheck: document.getElementById('numbers'),
    symbolsCheck: document.getElementById('symbols'),
    excludeSimilarCheck: document.getElementById('excludeSimilar'),
    strengthBar: document.getElementById('strengthBar'),
    strengthText: document.getElementById('strengthText'),
    notification: document.getElementById('notification')
};

// Estado da aplicação
let isPasswordVisible = false;

// Inicialização
function init() {
    // Gerar senha inicial
    generatePassword();
    
    // Event listeners
    elements.generateBtn.addEventListener('click', generatePassword);
    elements.togglePassword.addEventListener('click', togglePasswordVisibility);
    elements.copyPassword.addEventListener('click', copyToClipboard);
    
    // Atualizar senha quando qualquer configuração mudar
    const inputs = [
        elements.lengthSlider,
        elements.uppercaseCheck,
        elements.lowercaseCheck,
        elements.numbersCheck,
        elements.symbolsCheck,
        elements.excludeSimilarCheck
    ];
    
    inputs.forEach(input => {
        input.addEventListener('change', generatePassword);
        input.addEventListener('input', function() {
            if (this === elements.lengthSlider) {
                elements.lengthValue.textContent = this.value;
            }
            generatePassword();
        });
    });
}

// Gerar senha
function generatePassword() {
    const length = parseInt(elements.lengthSlider.value);
    const includeUppercase = elements.uppercaseCheck.checked;
    const includeLowercase = elements.lowercaseCheck.checked;
    const includeNumbers = elements.numbersCheck.checked;
    const includeSymbols = elements.symbolsCheck.checked;
    const excludeSimilar = elements.excludeSimilarCheck.checked;
    
    // Validar pelo menos um conjunto de caracteres selecionado
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        elements.passwordField.value = 'Selecione pelo menos um tipo';
        updateStrengthMeter(0);
        return;
    }
    
    // Criar pool de caracteres baseado nas seleções
    let charset = '';
    
    if (includeUppercase) {
        charset += excludeSimilar 
            ? characterSets.uppercase.replace(/[ILO]/g, '') 
            : characterSets.uppercase;
    }
    
    if (includeLowercase) {
        charset += excludeSimilar 
            ? characterSets.lowercase.replace(/[ilo]/g, '') 
            : characterSets.lowercase;
    }
    
    if (includeNumbers) {
        charset += excludeSimilar 
            ? characterSets.numbers.replace(/[01]/g, '') 
            : characterSets.numbers;
    }
    
    if (includeSymbols) {
        charset += characterSets.symbols;
    }
    
    // Gerar senha aleatória
    let password = '';
    const charsetLength = charset.length;
    const crypto = window.crypto || window.msCrypto;
    
    if (crypto && crypto.getRandomValues) {
        // Usar API Web Crypto se disponível para melhor aleatoriedade
        const values = new Uint32Array(length);
        crypto.getRandomValues(values);
        
        for (let i = 0; i < length; i++) {
            password += charset[values[i] % charsetLength];
        }
    } else {
        // Fallback para Math.random() se Web Crypto não estiver disponível
        for (let i = 0; i < length; i++) {
            password += charset[Math.floor(Math.random() * charsetLength)];
        }
    }
    
    elements.passwordField.value = password;
    updateStrengthMeter(calculatePasswordStrength(password));
}

// Alternar visibilidade da senha
function togglePasswordVisibility() {
    isPasswordVisible = !isPasswordVisible;
    elements.passwordField.type = isPasswordVisible ? 'text' : 'password';
    elements.togglePassword.innerHTML = isPasswordVisible 
        ? '<i class="fas fa-eye-slash"></i>' 
        : '<i class="fas fa-eye"></i>';
}

// Copiar senha para área de transferência
function copyToClipboard() {
    if (!elements.passwordField.value || elements.passwordField.value === 'Selecione pelo menos um tipo') {
        return;
    }
    
    elements.passwordField.select();
    document.execCommand('copy');
    
    // Mostrar notificação
    showNotification();
}

// Mostrar notificação
function showNotification() {
    elements.notification.classList.add('show');
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// Calcular força da senha
function calculatePasswordStrength(password) {
    let strength = 0;
    const length = password.length;
    
    // Critérios de força
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSymbols = /[^A-Za-z0-9]/.test(password);
    const hasUniqueChars = new Set(password).size;
    
    // Pontuação baseada no comprimento
    strength += Math.min(length * 4, 40); // Máximo 40 pontos para comprimento
    
    // Pontuação por tipos de caracteres
    if (hasUppercase) strength += 10;
    if (hasLowercase) strength += 10;
    if (hasNumbers) strength += 10;
    if (hasSymbols) strength += 15;
    
    // Bônus por caracteres únicos
    strength += (hasUniqueChars / length) * 15;
    
    // Normalizar para escala de 0-100
    strength = Math.min(Math.max(Math.round(strength), 100);
    
    return strength;
}

// Atualizar medidor de força
function updateStrengthMeter(strength) {
    let color, text;
    
    if (strength === 0) {
        color = 'transparent';
        text = 'Nenhuma senha gerada';
    } else if (strength < 30) {
        color = '#dc3545'; // Vermelho
        text = 'Muito fraca';
    } else if (strength < 60) {
        color = '#fd7e14'; // Laranja
        text = 'Fraca';
    } else if (strength < 80) {
        color = '#ffc107'; // Amarelo
        text = 'Boa';
    } else {
        color = '#28a745'; // Verde
        text = 'Forte';
    }
    
    elements.strengthBar.style.width = `${strength}%`;
    elements.strengthBar.style.backgroundColor = color;
    elements.strengthText.textContent = `Força da senha: ${text} (${strength}%)`;
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);