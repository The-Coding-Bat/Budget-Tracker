let dataBase;

// establish a connection to "budget-tracker" database.
const request = indexedDB.open('budget_tracker', 1);

// this event will emit if the database version changes
request.onupgradeneeded = function(event) {

    // save a reference to the database
    const db = event.target.result;

    // create an object store (table) called `new_transaction`, set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon a successful
request.onsuccess = function(event) {

    // when db is successfully created with its object store or simply established a connection, save reference to db in global variable
    dataBase = event.target.result;

    // Executes transactionUpload funcion if online.
    if (navigator.onLine) {
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

function transactionUpload() {

    // Open a transaction on your database.
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // Gain access to object store.
    const budgetObjectStore = transaction.objectStore('new_transaction');

    // Sets all store reords to a varable.
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {

        // If there was data in the store, send it over to the api server.
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    // open one more transaction
                    const transaction = db.transaction(['new_transaction'], 'readwrite');

                    // access the new_transaction object store
                    const budgetObjectStore = transaction.objectStore('new_transaction');

                    // clear all items in your store
                    budgetObjectStore.clear();

                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {

    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the object store for `new_transaction`
    const  budgetObjectStore = transaction.objectStore('new_transaction');

    // add record to your store with add method
    budgetObjectStore.add(record);
}

// Will execute if there is no internet connection.
function transactionSave(record) {

    // open a new transaction with the database with read and write permissions
    const transaction = dataBase.transaction(['new_transaction'], 'readwrite');

    // Access the object store for "new transaction".
    const budget = transaction.objectStore('new_transaction');

    // Adds record to score.
    budget.add(record);
}; 

// listen for app coming back online
window.addEventListener('online', transactionUpload);