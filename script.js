
// SpendWise Budget Tracker

const STORAGE_KEY = "spendwise-budget-tracker";

let budget = 0;
let expenses = [];

const budgetForm = document.getElementById("budget-form");
const expenseForm = document.getElementById("expense-form");

const budgetDisplay = document.getElementById("budget");
const expensesDisplay = document.getElementById("total-expenses");
const balanceDisplay = document.getElementById("balance");
const expenseList = document.getElementById("expense-list");

function loadState() {
    const savedState = localStorage.getItem(STORAGE_KEY);

    if (!savedState) {
        return { budget: 0, expenses: [] };
    }

    try {
        const parsedState = JSON.parse(savedState);

        return {
            budget: Number.isFinite(parsedState.budget) ? parsedState.budget : 0,
            expenses: Array.isArray(parsedState.expenses) ? parsedState.expenses : []
        };
    } catch (error) {
        console.warn("Could not parse saved budget state.", error);
        return { budget: 0, expenses: [] };
    }
}

function saveState() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ budget: budget, expenses: expenses })
    );
}

function formatMoney(amount) {
    return "KSh " + Number(amount).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

budgetForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const amount = Number(document.getElementById("budget-amount").value);

    if (!Number.isFinite(amount) || amount < 0) {
        alert("Please enter a valid budget.");
        return;
    }

    budget = amount;
    saveState();
    updateDashboard();
    budgetForm.reset();
    alert("Budget set successfully!");
});

expenseForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("expense-name").value.trim();
    const amount = Number(document.getElementById("expense-amount").value);
    const category = document.getElementById("expense-category").value;

    if (!name || !Number.isFinite(amount) || amount <= 0 || !category) {
        alert("Please enter valid expense details.");
        return;
    }

    expenses.push({
        id: Date.now() + Math.random(),
        name: name,
        amount: amount,
        category: category
    });

    saveState();
    updateDashboard();
    expenseForm.reset();
});

function updateDashboard() {
    const totalExpenses = expenses.reduce(function(total, expense) {
        return total + Number(expense.amount);
    }, 0);

    const remainingBalance = budget - totalExpenses;

    budgetDisplay.textContent = formatMoney(budget);
    expensesDisplay.textContent = formatMoney(totalExpenses);
    balanceDisplay.textContent = formatMoney(remainingBalance);
    balanceDisplay.classList.toggle("negative", remainingBalance < 0);
    balanceDisplay.classList.toggle("positive", remainingBalance >= 0);

    displayExpenses();
}

function displayExpenses() {
    expenseList.replaceChildren();

    if (expenses.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 4;
        cell.textContent = "No expenses yet.";

        row.appendChild(cell);
        expenseList.appendChild(row);
        return;
    }

    expenses.forEach(function(expense) {
        const row = document.createElement("tr");

        const nameCell = document.createElement("td");
        nameCell.textContent = expense.name;

        const categoryCell = document.createElement("td");
        categoryCell.textContent = expense.category;

        const amountCell = document.createElement("td");
        amountCell.textContent = formatMoney(expense.amount);

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() {
            deleteExpense(expense.id);
        });

        actionCell.appendChild(deleteButton);

        row.appendChild(nameCell);
        row.appendChild(categoryCell);
        row.appendChild(amountCell);
        row.appendChild(actionCell);

        expenseList.appendChild(row);
    });
}

function deleteExpense(id) {
    expenses = expenses.filter(function(expense) {
        return expense.id !== id;
    });

    saveState();
    updateDashboard();
}

const savedState = loadState();
budget = savedState.budget;
expenses = savedState.expenses;

updateDashboard();

