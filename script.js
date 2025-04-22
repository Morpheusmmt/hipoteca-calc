document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mortgageForm');
    const results = document.getElementById('results');
    const resultDetails = document.getElementById('resultDetails');
    const radioOptions = document.querySelectorAll('.radio-option');
    const clearButton = document.querySelector('.clear-button');
    
    // Lidar com seleção de opções de radio
    radioOptions.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        
        option.addEventListener('click', function() {
            radioOptions.forEach(opt => {
                opt.classList.remove('selected');
            });
            
            option.classList.add('selected');
            radio.checked = true;
        });
    });
    
    // Formatar entrada de valores monetários
    const mortgageAmountInput = document.getElementById('mortgageAmount');
    mortgageAmountInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^\d]/g, '');
    });
    
    // Formatar valores em moeda brasileira
    function formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        }).format(value);
    }
    
    // Limpar formulário
    clearButton.addEventListener('click', function(e) {
        e.preventDefault();
        form.reset();
        
        radioOptions.forEach(opt => {
            opt.classList.remove('selected');
        });
        radioOptions[0].classList.add('selected');
        
        resultDetails.classList.add('hidden');
    });
    
    // Calcular hipoteca
    function calculateMortgage(amount, interestRate, years, isRepayment) {
        const principal = parseFloat(amount);
        const monthlyRate = parseFloat(interestRate) / 100 / 12;
        const payments = parseFloat(years) * 12;
        
        let monthlyPayment;
        
        if (isRepayment) {
            monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / 
                            (Math.pow(1 + monthlyRate, payments) - 1);
        } else {
            monthlyPayment = principal * monthlyRate;
        }
        
        const totalPayment = monthlyPayment * payments;
        const totalInterest = totalPayment - (isRepayment ? principal : 0);
        
        return {
            monthlyPayment: monthlyPayment,
            totalInterest: totalInterest,
            totalCost: isRepayment ? totalPayment : totalPayment + principal
        };
    }
    
    // Envio do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const calculateButton = document.querySelector('.calculate-button');
        const originalButtonText = calculateButton.innerHTML;
        calculateButton.innerHTML = '<span class="loading-spinner"></span> Calculando...';
        calculateButton.disabled = true;
        
        setTimeout(() => {
            try {
                const mortgageAmount = document.getElementById('mortgageAmount').value;
                const mortgageTerm = document.getElementById('mortgageTerm').value;
                const interestRate = document.getElementById('interestRate').value;
                const isRepayment = document.querySelector('input[name="mortgageType"]:checked').value === 'repayment';
                
                if (!mortgageAmount || isNaN(mortgageAmount)) {
                    throw new Error('Por favor, insira um valor válido para a hipoteca.');
                }
                
                if (!mortgageTerm || mortgageTerm < 1 || mortgageTerm > 40) {
                    throw new Error('O prazo da hipoteca deve ser entre 1 e 40 anos.');
                }
                
                if (!interestRate || interestRate <= 0 || interestRate > 20) {
                    throw new Error('A taxa de juros deve ser entre 0.1% e 20%.');
                }
                
                const result = calculateMortgage(mortgageAmount, interestRate, mortgageTerm, isRepayment);
                
                document.getElementById('monthlyPayment').textContent = formatCurrency(result.monthlyPayment);
                document.getElementById('totalInterest').textContent = formatCurrency(result.totalInterest);
                document.getElementById('totalCost').textContent = formatCurrency(result.totalCost);
                
                resultDetails.classList.remove('hidden');
                
                const resultsHeading = results.querySelector('h2');
                const resultsParagraph = results.querySelector('p');
                
                resultsHeading.textContent = "Seu resultado";
                resultsParagraph.textContent = "Com base nas informações fornecidas, veja abaixo os detalhes do seu financiamento.";
                
                if (window.innerWidth > 768) {
                    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                
            } catch (error) {
                alert(error.message);
            } finally {
                calculateButton.innerHTML = originalButtonText;
                calculateButton.disabled = false;
            }
        }, 300);
    });
});