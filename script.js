/***********************
 * State management
 ***********************/
let paymentData = {
    amount: 0,
    paymentMethod: 'bkash',
    transactionId: ''
};

/***********************
 * Page navigation
 ***********************/
function showPage(pageNumber) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`page${pageNumber}`).classList.add('active');
}

/***********************
 * Page 1: Amount Input
 ***********************/
document.getElementById('nextToPage2').addEventListener('click', () => {
    const amountInput = document.getElementById('amount');
    const amount = parseFloat(amountInput.value);

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    paymentData.amount = amount;
    showPage(2);
});

/***********************
 * Page 2: Payment Method
 ***********************/
document.getElementById('nextToPage3').addEventListener('click', () => {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!selectedMethod) {
        alert('Please select a payment method');
        return;
    }

    paymentData.paymentMethod = selectedMethod.value;

    document.getElementById('summaryAmount').textContent =
        `৳${paymentData.amount.toFixed(2)}`;
    document.getElementById('summaryMethod').textContent =
        paymentData.paymentMethod;

    showPage(3);
});

document.getElementById('backToPage1').addEventListener('click', () => {
    showPage(1);
});

/***********************
 * Page 3: Transaction Verify
 ***********************/
document.getElementById('backToPage2').addEventListener('click', () => {
    showPage(2);
});

document.getElementById('verifyPayment').addEventListener('click', async () => {
    const transactionIdInput = document.getElementById('transactionId');
    const transactionId = transactionIdInput.value.trim();

    if (!transactionId) {
        showMessage('Please enter a transaction ID', 'error');
        return;
    }

    paymentData.transactionId = transactionId;
    await verifyTransaction();
});

/***********************
 * API Integration
 ***********************/
async function verifyTransaction() {
    const verifyButton = document.getElementById('verifyPayment');
    const resultMessage = document.getElementById('resultMessage');

    verifyButton.disabled = true;
    verifyButton.classList.add('loading');
    resultMessage.classList.remove('show');

    const apiUrl =
        'https://script.google.com/macros/s/AKfycbziOncqXmDoevxNjh4eN3xk8y7wHSfZ01F7HE_5Tgh_NfzC0-lqK6Xw7QIPXNSMsJreFg/exec';

    const requestBody = {
        action: 'verify_transaction',
        transaction_id: paymentData.transactionId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const rawText = await response.text();
        console.log('API raw response:', rawText);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
            throw new Error('Invalid JSON response from server');
        }

        if (data.success) {
            showMessage('✅ Payment Verified', 'success');
        } else {
            showMessage(data.message || 'Transaction not found', 'error');
        }

    } catch (error) {
        console.error('API Error:', error);
        showMessage('Failed to verify payment. Please try again.', 'error');
    } finally {
        verifyButton.disabled = false;
        verifyButton.classList.remove('loading');
    }
}

/***********************
 * Helper: Show message
 ***********************/
function showMessage(text, type) {
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.textContent = text;
    resultMessage.className = `message ${type} show`;
}

/***********************
 * Enter key support
 ***********************/
document.getElementById('amount').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('nextToPage2').click();
    }
});

document.getElementById('transactionId').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('verifyPayment').click();
    }
});