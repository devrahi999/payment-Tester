const API_URL =
"https://script.google.com/macros/s/AKfycbziOncqXmDoevxNjh4eN3xk8y7wHSfZ01F7HE_5Tgh_NfzC0-lqK6Xw7QIPXNSMsJreFg/exec";

let paymentData = {
    amount: 0,
    paymentMethod: "bkash",
    transactionId: ""
};

function showPage(n) {
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    document.getElementById("page" + n).classList.add("active");
}

/* Page 1 */
document.getElementById("nextToPage2").onclick = () => {
    const amt = Number(document.getElementById("amount").value);
    if (!amt || amt <= 0) {
        alert("Enter valid amount");
        return;
    }
    paymentData.amount = amt;
    showPage(2);
};

/* Page 2 */
document.getElementById("nextToPage3").onclick = () => {
    paymentData.paymentMethod =
        document.querySelector("input[name='paymentMethod']:checked").value;

    document.getElementById("summaryAmount").textContent = paymentData.amount;
    document.getElementById("summaryMethod").textContent = paymentData.paymentMethod;

    showPage(3);
};

document.getElementById("backToPage1").onclick = () => showPage(1);

/* Page 3 */
document.getElementById("backToPage2").onclick = () => showPage(2);

document.getElementById("verifyPayment").onclick = async () => {
    const trx = document.getElementById("transactionId").value.trim();
    if (!trx) {
        showMessage("Enter transaction ID", "error");
        return;
    }
    paymentData.transactionId = trx;
    await verifyPayment();
};

async function verifyPayment() {
    const btn = document.getElementById("verifyPayment");
    btn.disabled = true;

    const params = new URLSearchParams({
        action: "verify_transaction",
        transaction_id: paymentData.transactionId,
        amount: paymentData.amount,
        payment_method: paymentData.paymentMethod
    });

    try {
        const res = await fetch(API_URL + "?" + params.toString());
        const data = await res.json();

        if (data.success) {
            showMessage("✅ Payment Verified", "success");
        } else {
            showMessage(data.message, "error");
        }
    } catch (e) {
        console.error(e);
        showMessage("Verification failed", "error");
    } finally {
        btn.disabled = false;
    }
}

function showMessage(msg, type) {
    const box = document.getElementById("resultMessage");
    box.textContent = msg;
    box.className = "message " + type + " show";
}
