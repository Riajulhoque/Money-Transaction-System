tailwind.config = {
  theme: {
    extend: {
      colors: {
        'primary': '#1a2a6c',
        'secondary': '#b21f1f',
        'accent': '#fdbb2d',
      }
    }
  }
}

const transactionType = document.getElementById('transaction-type');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const processBtn = document.getElementById('process-btn');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const balanceAmount = document.getElementById('balance-amount');

// Store transactions
let transactions = [];
let balance = 5250.75;

// Format currency
function formatCurrency(amount) {
  return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Get current date and time
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Update balance display
function updateBalance() {
  balanceAmount.textContent = formatCurrency(balance);
}

// Add transaction to history
function addTransaction(type, amount, description) {
  const transaction = {
    id: Date.now(),
    type: type,
    amount: amount,
    description: description || 'No description',
    time: getCurrentDateTime()
  };

  transactions.push(transaction);
  renderTransactions();

  // Update balance
  if (type === 'deposit') {
    balance += amount;
  } else {
    balance -= amount;
  }

  updateBalance();
}

// Delete transaction
function deleteTransaction(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  // Adjust balance
  if (transaction.type === 'deposit') {
    balance -= transaction.amount;
  } else {
    balance += transaction.amount;
  }

  // Remove transaction
  transactions = transactions.filter(t => t.id !== id);

  updateBalance();
  renderTransactions();
}

// Edit transaction
function editTransaction(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  // Store old values for balance adjustment
  const oldType = transaction.type;
  const oldAmount = transaction.amount;

  // Prompt for new values
  const newType = prompt('Enter transaction type (deposit/withdraw):', transaction.type) || transaction.type;
  const newAmount = parseFloat(prompt('Enter new amount:', transaction.amount)) || transaction.amount;
  const newDescription = prompt('Enter new description:', transaction.description) || transaction.description;

  // Validate type
  if (newType !== 'deposit' && newType !== 'withdraw') {
    alert('Transaction type must be either "deposit" or "withdraw"');
    return;
  }

  // Adjust balance for old transaction
  if (oldType === 'deposit') {
    balance -= oldAmount;
  } else {
    balance += oldAmount;
  }

  // Update transaction
  transaction.type = newType;
  transaction.amount = newAmount;
  transaction.description = newDescription;
  transaction.time = getCurrentDateTime() + ' (edited)';

  // Adjust balance for new transaction
  if (newType === 'deposit') {
    balance += newAmount;
  } else {
    balance -= newAmount;
  }

  updateBalance();
  renderTransactions();
}

// Render all transactions
function renderTransactions() {
  if (transactions.length === 0) {
    historyList.innerHTML = '<div class="text-center py-8 opacity-70">No transactions yet</div>';
    return;
  }

  historyList.innerHTML = '';

  transactions.forEach(transaction => {
    const transactionItem = document.createElement('div');
    transactionItem.className = 'card bg-base-200 mb-4 p-4 border border-white/10';
    transactionItem.setAttribute('data-id', transaction.id);

    const sign = transaction.type === 'deposit' ? '+' : '-';
    const typeClass = transaction.type === 'deposit' ? 'badge-success' : 'badge-error';

    transactionItem.innerHTML = `
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="badge ${typeClass}">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
                <span class="font-bold text-lg">${sign} ${formatCurrency(transaction.amount)}</span>
              </div>
              <div class="text-sm opacity-70 mb-1">${transaction.description}</div>
              <div class="text-xs opacity-50">${transaction.time}</div>
            </div>
            <div class="flex gap-2">
              <button class="btn btn-outline btn-sm btn-info" onclick="editTransaction(${transaction.id})">Edit</button>
              <button class="btn btn-outline btn-sm btn-error" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </div>
          </div>
        `;

    historyList.appendChild(transactionItem);
  });
}

// Process transaction
processBtn.addEventListener('click', function () {
  const type = transactionType.value;
  const amount = parseFloat(amountInput.value);
  const description = descriptionInput.value;

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  if (type === 'withdraw' && amount > balance) {
    alert('Insufficient funds');
    return;
  }

  addTransaction(type, amount, description);

  // Reset form
  amountInput.value = '';
  descriptionInput.value = '';
});

// Clear history
clearHistoryBtn.addEventListener('click', function () {
  if (confirm('Are you sure you want to clear all transaction history?')) {
    transactions = [];
    renderTransactions();
  }
});

// Add some sample transactions
function addSampleTransactions() {
  addTransaction('deposit', 500, 'Salary deposit');
  addTransaction('withdraw', 120.50, 'Grocery shopping');
  addTransaction('deposit', 300, 'Freelance payment');
}

// Initialize the app
function init() {
  updateBalance();
  addSampleTransactions();
}

// Start the application
init();

// Make functions available globally for onclick handlers
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
