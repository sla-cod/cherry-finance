// ==========================================
// CHERRY FINANCE 🍒
// PERSONAL FINANCE DASHBOARD
// ==========================================


// ==========================================
// DATA
// ==========================================

let transactions =
    JSON.parse(
        localStorage.getItem("cherryTransactions")
    ) || [];


let bills =
    JSON.parse(
        localStorage.getItem("cherryBills")
    ) || [];


let savingsGoals =
    JSON.parse(
        localStorage.getItem("cherrySavingsGoals")
    ) || [];


// MIGRASI DATA LAMA (satu target tunggal) KE FORMAT ARRAY BARU

if (savingsGoals.length === 0) {

    const oldGoal =
        JSON.parse(
            localStorage.getItem("cherrySavingsGoal")
        );


    if (oldGoal && oldGoal.name) {

        savingsGoals = [
            {
                id: Date.now(),
                name: oldGoal.name,
                amount: oldGoal.amount || 0,
                saved: oldGoal.saved || 0
            }
        ];


        localStorage.setItem(
            "cherrySavingsGoals",
            JSON.stringify(savingsGoals)
        );

        localStorage.removeItem(
            "cherrySavingsGoal"
        );

    }

}


let financeChart = null;

let categoryChart = null;


// ==========================================
// FORMAT RUPIAH
// ==========================================

function formatRupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }
    ).format(number);

}


// ==========================================
// FORMAT TANGGAL
// ==========================================

function formatDate(dateString) {

    if (!dateString) return "-";


    const date =
        new Date(dateString + "T00:00:00");


    return date.toLocaleDateString(
        "id-ID",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// ==========================================
// BULAN SAAT INI
// ==========================================

function getCurrentMonth() {

    const today = new Date();

    return today
        .toISOString()
        .slice(0, 7);

}


// ==========================================
// FILTER TRANSAKSI BERDASARKAN BULAN
// ==========================================

function getMonthTransactions() {

    const selectedMonth =
        document.getElementById("monthFilter").value;


    return transactions.filter(transaction => {

        return transaction.date.startsWith(
            selectedMonth
        );

    });

}


// ==========================================
// UPDATE SUMMARY
// ==========================================

function updateSummary() {

    const monthTransactions =
        getMonthTransactions();


    let totalIncome = 0;

    let totalExpense = 0;


    monthTransactions.forEach(transaction => {

        if (
            transaction.type === "income"
        ) {

            totalIncome += transaction.amount;

        } else {

            totalExpense += transaction.amount;

        }

    });


    const balance =
        totalIncome - totalExpense;


    document.getElementById(
        "totalIncome"
    ).textContent =
        formatRupiah(totalIncome);


    document.getElementById(
        "totalExpense"
    ).textContent =
        formatRupiah(totalExpense);


    document.getElementById(
        "balance"
    ).textContent =
        formatRupiah(balance);

}


// ==========================================
// TAMBAH TRANSAKSI
// ==========================================

document
    .getElementById("transactionForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const type =
                document.getElementById(
                    "transactionType"
                ).value;


            const category =
                document.getElementById(
                    "transactionCategory"
                ).value;


            const name =
                document.getElementById(
                    "transactionName"
                ).value;


            const amount =
                Number(
                    document.getElementById(
                        "transactionAmount"
                    ).value
                );


            const date =
                document.getElementById(
                    "transactionDate"
                ).value;


            const newTransaction = {

                id: Date.now(),

                type: type,

                category: category,

                name: name,

                amount: amount,

                date: date

            };


            transactions.push(
                newTransaction
            );


            saveTransactions();


            renderAll();


            this.reset();


            setToday();

        }
    );


// ==========================================
// SIMPAN TRANSAKSI
// ==========================================

function saveTransactions() {

    localStorage.setItem(
        "cherryTransactions",
        JSON.stringify(transactions)
    );

}


// ==========================================
// RENDER TRANSAKSI
// ==========================================

function renderTransactions() {

    const transactionList =
        document.getElementById(
            "transactionList"
        );


    const emptyTransaction =
        document.getElementById(
            "emptyTransaction"
        );


    const search =
        document
            .getElementById(
                "searchTransaction"
            )
            .value
            .toLowerCase();


    const typeFilter =
        document.getElementById(
            "typeFilter"
        ).value;


    const selectedMonth =
        document.getElementById(
            "monthFilter"
        ).value;


    transactionList.innerHTML = "";


    let filteredTransactions =
        transactions.filter(transaction => {

            const matchMonth =
                transaction.date.startsWith(
                    selectedMonth
                );


            const matchSearch =
                transaction.name
                    .toLowerCase()
                    .includes(search) ||

                transaction.category
                    .toLowerCase()
                    .includes(search);


            const matchType =
                typeFilter === "all" ||

                transaction.type === typeFilter;


            return (
                matchMonth &&
                matchSearch &&
                matchType
            );

        });


    filteredTransactions.sort(
        (a, b) => b.id - a.id
    );


    if (
        filteredTransactions.length === 0
    ) {

        emptyTransaction.style.display =
            "block";

        return;

    }


    emptyTransaction.style.display =
        "none";


    filteredTransactions.forEach(
        transaction => {

            const row =
                document.createElement("tr");


            const isIncome =
                transaction.type === "income";


            row.innerHTML = `

                <td>
                    ${formatDate(
                        transaction.date
                    )}
                </td>

                <td>
                    ${transaction.name}
                </td>

                <td>
                    ${transaction.category}
                </td>

                <td>

                    <span class="badge ${
                        isIncome
                            ? "badge-income"
                            : "badge-expense"
                    }">

                        ${
                            isIncome
                                ? "💰 Pemasukan"
                                : "💸 Pengeluaran"
                        }

                    </span>

                </td>

                <td class="${
                    isIncome
                        ? "amount-income"
                        : "amount-expense"
                }">

                    ${
                        isIncome ? "+" : "-"
                    }

                    ${formatRupiah(
                        transaction.amount
                    )}

                </td>

                <td>

                    <button
                        class="delete-btn"
                        onclick="
                            deleteTransaction(
                                ${transaction.id}
                            )
                        "
                    >
                        🗑️
                    </button>

                </td>

            `;


            transactionList.appendChild(
                row
            );

        }
    );

}


// ==========================================
// HAPUS TRANSAKSI
// ==========================================

function deleteTransaction(id) {

    const confirmDelete =
        confirm(
            "Yakin ingin menghapus transaksi ini?"
        );


    if (!confirmDelete) return;


    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveTransactions();

    renderAll();

}


// ==========================================
// HAPUS SEMUA TRANSAKSI
// ==========================================

document
    .getElementById(
        "clearTransactions"
    )
    .addEventListener(
        "click",
        function() {

            if (
                transactions.length === 0
            ) return;


            const confirmDelete =
                confirm(
                    "Yakin ingin menghapus SEMUA transaksi?"
                );


            if (!confirmDelete) return;


            transactions = [];


            saveTransactions();


            renderAll();

        }
    );


// ==========================================
// TAMBAH TAGIHAN
// ==========================================

document
    .getElementById("billForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const newBill = {

                id: Date.now(),

                name:
                    document.getElementById(
                        "billName"
                    ).value,

                date:
                    document.getElementById(
                        "billDate"
                    ).value,

                amount:
                    Number(
                        document.getElementById(
                            "billAmount"
                        ).value
                    )

            };


            bills.push(newBill);


            saveBills();


            renderBills();

            checkBillReminders();


            this.reset();

        }
    );


// ==========================================
// SIMPAN TAGIHAN
// ==========================================

function saveBills() {

    localStorage.setItem(
        "cherryBills",
        JSON.stringify(bills)
    );

}


// ==========================================
// HITUNG STATUS TAGIHAN
// ==========================================

function getBillStatus(date) {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const dueDate =
        new Date(
            date + "T00:00:00"
        );


    const difference =
        Math.ceil(
            (
                dueDate - today
            ) /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    if (difference < 0) {

        return {
            text:
                `🚨 Terlambat ${Math.abs(difference)} hari`,
            overdue: true,
            reminder: true
        };

    }


    if (difference === 0) {

        return {
            text: "🔥 Jatuh tempo hari ini!",
            overdue: false,
            reminder: true
        };

    }


    if (difference <= 3) {

        return {
            text:
                `⚠️ ${difference} hari lagi`,
            overdue: false,
            reminder: true
        };

    }


    return {
        text: "🌸 Masih aman",
        overdue: false,
        reminder: false
    };

}


// ==========================================
// RENDER TAGIHAN
// ==========================================

function renderBills() {

    const billList =
        document.getElementById(
            "billList"
        );


    const emptyBill =
        document.getElementById(
            "emptyBill"
        );


    billList.innerHTML = "";


    if (bills.length === 0) {

        emptyBill.style.display =
            "block";

        return;

    }


    emptyBill.style.display =
        "none";


    const sortedBills =
        [...bills].sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


    sortedBills.forEach(bill => {

        const status =
            getBillStatus(
                bill.date
            );


        const billItem =
            document.createElement("div");


        billItem.className =
            `bill-item ${
                status.overdue
                    ? "overdue"
                    : ""
            }`;


        billItem.innerHTML = `

            <button
                class="bill-delete"
                onclick="
                    deleteBill(
                        ${bill.id}
                    )
                "
            >
                🗑️
            </button>


            <h3>
                ${bill.name}
            </h3>


            <p>
                📅 Tenggat:
                <strong>
                    ${formatDate(
                        bill.date
                    )}
                </strong>
            </p>


            <p class="bill-amount">

                ${formatRupiah(
                    bill.amount
                )}

            </p>


            <p class="bill-status">

                ${status.text}

            </p>

        `;


        billList.appendChild(
            billItem
        );

    });

}


// ==========================================
// REMINDER TAGIHAN
// ==========================================

function checkBillReminders() {

    const reminderSection =
        document.getElementById(
            "reminderSection"
        );


    const billReminder =
        document.getElementById(
            "billReminder"
        );


    const reminderBills =
        bills.filter(bill => {

            return getBillStatus(
                bill.date
            ).reminder;

        });


    if (
        reminderBills.length === 0
    ) {

        reminderSection.style.display =
            "none";

        return;

    }


    reminderSection.style.display =
        "block";


    billReminder.innerHTML = "";


    reminderBills.forEach(bill => {

        const status =
            getBillStatus(
                bill.date
            );


        const reminder =
            document.createElement("div");


        reminder.className =
            "reminder-item";


        reminder.innerHTML = `

            <strong>
                ${bill.name}
            </strong>

            — ${status.text}

            • ${formatRupiah(
                bill.amount
            )}

        `;


        billReminder.appendChild(
            reminder
        );

    });

}


// ==========================================
// HAPUS TAGIHAN
// ==========================================

function deleteBill(id) {

    if (
        !confirm(
            "Yakin ingin menghapus tagihan ini?"
        )
    ) return;


    bills =
        bills.filter(
            bill =>
                bill.id !== id
        );


    saveBills();


    renderBills();

    checkBillReminders();

}


// ==========================================
// HAPUS SEMUA TAGIHAN
// ==========================================

document
    .getElementById("clearBills")
    .addEventListener(
        "click",
        function() {

            if (
                bills.length === 0
            ) return;


            if (
                !confirm(
                    "Yakin ingin menghapus semua tagihan?"
                )
            ) return;


            bills = [];


            saveBills();


            renderBills();

            checkBillReminders();

        }
    );


// ==========================================
// TARGET TABUNGAN
// ==========================================

document
    .getElementById("goalForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            const name =
                document.getElementById(
                    "goalName"
                ).value;


            const amount =
                Number(
                    document.getElementById(
                        "goalAmount"
                    ).value
                );


            const saved =
                Number(
                    document.getElementById(
                        "goalSaved"
                    ).value
                );


            if (
                !name ||
                amount <= 0 ||
                saved < 0
            ) {

                alert(
                    "Isi data target tabungan dulu yaa 🍒"
                );

                return;

            }


            savingsGoals.push({

                id: Date.now(),

                name: name,

                amount: amount,

                saved: saved

            });


            saveSavingsGoals();


            renderSavingsGoals();


            this.reset();


            document.getElementById(
                "goalSaved"
            ).value = "0";

        }
    );


// ==========================================
// SIMPAN TARGET TABUNGAN
// ==========================================

function saveSavingsGoals() {

    localStorage.setItem(
        "cherrySavingsGoals",
        JSON.stringify(savingsGoals)
    );

}


// ==========================================
// HAPUS TARGET TABUNGAN
// ==========================================

function deleteSavingsGoal(id) {

    if (
        !confirm(
            "Yakin ingin menghapus target ini?"
        )
    ) return;


    savingsGoals =
        savingsGoals.filter(
            goal => goal.id !== id
        );


    saveSavingsGoals();

    renderSavingsGoals();

}


// ==========================================
// TAMBAH DANA KE TARGET
// ==========================================

function addFundsToGoal(id) {

    const input =
        document.getElementById(
            `addFunds-${id}`
        );


    const amount =
        Number(input.value);


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "Isi nominal dana yang mau ditambah dulu yaa 🍒"
        );

        return;

    }


    const goal =
        savingsGoals.find(
            goal => goal.id === id
        );


    if (!goal) return;


    goal.saved += amount;


    saveSavingsGoals();

    renderSavingsGoals();

}


// ==========================================
// RENDER TARGET TABUNGAN
// ==========================================

function renderSavingsGoals() {

    const goalsList =
        document.getElementById(
            "goalsList"
        );


    const emptyGoals =
        document.getElementById(
            "emptyGoals"
        );


    goalsList.innerHTML = "";


    if (savingsGoals.length === 0) {

        emptyGoals.style.display =
            "block";

        return;

    }


    emptyGoals.style.display =
        "none";


    savingsGoals.forEach(goal => {

        const {
            id,
            name,
            amount,
            saved
        } = goal;


        let percentage = 0;


        if (amount > 0) {

            percentage =
                Math.min(
                    (saved / amount) * 100,
                    100
                );

        }


        const isComplete =
            percentage >= 100;


        const card =
            document.createElement("div");


        card.className =
            "goal-progress";


        card.innerHTML = `

            <button
                class="goal-delete"
                onclick="deleteSavingsGoal(${id})"
            >
                🗑️
            </button>

            <div class="goal-cherry">
                🍒
            </div>

            <h3>
                ${name}
            </h3>

            <div class="progress-bar">

                <div
                    class="progress-fill"
                    style="width: ${percentage}%"
                ></div>

            </div>

            <div class="progress-info">

                <span>
                    ${formatRupiah(saved)}
                </span>

                <span>
                    / ${formatRupiah(amount)}
                </span>

            </div>

            <p class="progress-percent">
                ${Math.round(percentage)}% tercapai
            </p>

            ${
                isComplete
                    ? `<span class="goal-complete-tag">🎉 Target Tercapai!</span>`
                    : `
                        <div class="goal-add-funds">

                            <input
                                type="number"
                                id="addFunds-${id}"
                                placeholder="Tambah dana"
                                min="1"
                            >

                            <button
                                onclick="addFundsToGoal(${id})"
                            >
                                💰 Tambah
                            </button>

                        </div>
                    `
            }

        `;


        goalsList.appendChild(card);

    });

}


// ==========================================
// GRAFIK
// ==========================================

function updateCharts() {

    const monthTransactions =
        getMonthTransactions();


    let income = 0;

    let expense = 0;


    const categories = {};


    monthTransactions.forEach(
        transaction => {

            if (
                transaction.type === "income"
            ) {

                income +=
                    transaction.amount;

            } else {

                expense +=
                    transaction.amount;


                if (
                    !categories[
                        transaction.category
                    ]
                ) {

                    categories[
                        transaction.category
                    ] = 0;

                }


                categories[
                    transaction.category
                ] += transaction.amount;

            }

        }
    );


    // GRAFIK PEMASUKAN VS PENGELUARAN

    if (financeChart) {

        financeChart.destroy();

    }


    const financeContext =
        document
            .getElementById(
                "financeChart"
            )
            .getContext("2d");


    financeChart =
        new Chart(
            financeContext,
            {

                type: "bar",

                data: {

                    labels: [
                        "Pemasukan",
                        "Pengeluaran"
                    ],

                    datasets: [

                        {

                            data: [
                                income,
                                expense
                            ],

                            backgroundColor: [
                                "#70142b",
                                "#d62845"
                            ],

                            borderRadius: 10

                        }

                    ]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true

                        }

                    }

                }

            }
        );


    // GRAFIK KATEGORI

    if (categoryChart) {

        categoryChart.destroy();

    }


    const categoryContext =
        document
            .getElementById(
                "categoryChart"
            )
            .getContext("2d");


    categoryChart =
        new Chart(
            categoryContext,
            {

                type: "doughnut",

                data: {

                    labels:
                        Object.keys(categories),

                    datasets: [

                        {

                            data:
                                Object.values(
                                    categories
                                ),

                            backgroundColor: [

                                "#70142b",
                                "#d62845",
                                "#e76f8a",
                                "#ff8fa3",
                                "#9b2c45",
                                "#f3a4b5",
                                "#b24a62"

                            ]

                        }

                    ]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            position: "bottom"

                        }

                    }

                }

            }
        );

}


// ==========================================
// SEARCH & FILTER
// ==========================================

document
    .getElementById(
        "searchTransaction"
    )
    .addEventListener(
        "input",
        renderTransactions
    );


document
    .getElementById(
        "typeFilter"
    )
    .addEventListener(
        "change",
        renderTransactions
    );


document
    .getElementById(
        "monthFilter"
    )
    .addEventListener(
        "change",
        function() {

            updateSummary();

            renderTransactions();

            updateCharts();

        }
    );


// ==========================================
// DARK MODE
// ==========================================

const themeToggle =
    document.getElementById(
        "themeToggle"
    );


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "cherryTheme"
        );


    if (
        savedTheme === "dark"
    ) {

        document.body.classList.add(
            "dark"
        );

        themeToggle.textContent = "☀️";

    }

}


themeToggle.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark"
        );


        const isDark =
            document.body.classList.contains(
                "dark"
            );


        themeToggle.textContent =
            isDark
                ? "☀️"
                : "🌙";


        localStorage.setItem(
            "cherryTheme",
            isDark
                ? "dark"
                : "light"
        );

    }
);


// ==========================================
// PESAN KEUANGAN LUCU
// ==========================================

function showFinancialMessage() {

    const messages = [

        "🍒 Hari ini belum boros kan bestie?",

        "💸 Think before checkout yaa... diskon tetap pengeluaran 😭",

        "🎯 Sedikit demi sedikit, tabunganmu akan jadi gunung!",

        "👑 Financial queen in progress...",

        "🍔 Jajan boleh, lupa catat jangan.",

        "💌 Dompetmu juga butuh kasih sayang.",

        "🛍️ Kamu tidak butuh semua barang yang lucu... mungkin.",

        "🍒 Nabung dulu, flexing nanti.",

        "✨ Masa depanmu sedang berterima kasih karena kamu mencatat uang hari ini.",

        "🥹 Pelan-pelan kaya, yang penting konsisten!"

    ];


    const randomMessage =
        messages[
            Math.floor(
                Math.random() *
                messages.length
            )
        ];


    document.getElementById(
        "financialMessage"
    ).textContent =
        randomMessage;

}


// ==========================================
// TANGGAL HARI INI
// ==========================================

function setToday() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    document.getElementById(
        "transactionDate"
    ).value =
        today;

}


// ==========================================
// EXPORT REKAP KE EXCEL (SATU SHEET)
// ==========================================

function exportToExcel() {

    const selectedMonth =
        document.getElementById(
            "monthFilter"
        ).value;


    const monthTransactions =
        getMonthTransactions().sort(
            (a, b) =>
                new Date(a.date) -
                new Date(b.date)
        );


    let totalIncome = 0;

    let totalExpense = 0;


    monthTransactions.forEach(transaction => {

        if (transaction.type === "income") {

            totalIncome += transaction.amount;

        } else {

            totalExpense += transaction.amount;

        }

    });


    const balance =
        totalIncome - totalExpense;


    const monthLabel =
        selectedMonth
            ? new Date(
                selectedMonth + "-01T00:00:00"
              ).toLocaleDateString(
                "id-ID",
                {
                    month: "long",
                    year: "numeric"
                }
              )
            : "Semua Periode";


    // SUSUN DATA JADI SATU LEMBAR (SHEET)

    const sheetData = [];


    sheetData.push([
        "CHERRY FINANCE 🍒 — REKAP KEUANGAN"
    ]);

    sheetData.push([
        `Periode: ${monthLabel}`
    ]);

    sheetData.push([]);


    sheetData.push([
        "RINGKASAN"
    ]);

    sheetData.push([
        "Total Pemasukan",
        totalIncome
    ]);

    sheetData.push([
        "Total Pengeluaran",
        totalExpense
    ]);

    sheetData.push([
        "Sisa Uang",
        balance
    ]);

    sheetData.push([]);


    sheetData.push([
        "RIWAYAT TRANSAKSI"
    ]);

    sheetData.push([
        "Tanggal",
        "Keterangan",
        "Kategori",
        "Jenis",
        "Nominal"
    ]);


    if (monthTransactions.length === 0) {

        sheetData.push([
            "Belum ada transaksi pada periode ini"
        ]);

    } else {

        monthTransactions.forEach(transaction => {

            sheetData.push([
                formatDate(transaction.date),
                transaction.name,
                transaction.category,
                transaction.type === "income"
                    ? "Pemasukan"
                    : "Pengeluaran",
                transaction.type === "income"
                    ? transaction.amount
                    : -transaction.amount
            ]);

        });

    }


    // BUAT WORKBOOK SATU SHEET

    const worksheet =
        XLSX.utils.aoa_to_sheet(sheetData);


    worksheet["!cols"] = [
        { wch: 22 },
        { wch: 28 },
        { wch: 18 },
        { wch: 14 },
        { wch: 16 }
    ];


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Rekap Keuangan"
    );


    const fileName =
        `Cherry-Finance-Rekap-${
            selectedMonth || "semua"
        }.xlsx`;


    XLSX.writeFile(
        workbook,
        fileName
    );

}


document
    .getElementById("exportExcelBtn")
    .addEventListener(
        "click",
        exportToExcel
    );


// ==========================================
// RENDER SEMUA
// ==========================================

function renderAll() {

    updateSummary();

    renderTransactions();

    renderBills();

    renderSavingsGoals();

    checkBillReminders();

    updateCharts();

}


// ==========================================
// JALANKAN WEBSITE
// ==========================================

document.getElementById(
    "monthFilter"
).value =
    getCurrentMonth();


setToday();

loadTheme();

showFinancialMessage();

renderAll();
