let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_Transaction', { autoIncrement: true });
};


request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
      uploadTransaction();
    }
  };
  
  request.onerror = function(event) {
    //log error here
    console.log("Somethings not quite right" + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_Transaction'], 'readwrite');
    const  budgetStore = transaction.objectStore('new_Transaction');
  
    budgetStore.add(record);
};

function uploadTransaction() {
// open a transaction on your db
    const transaction = db.transaction(['new_Transaction'], 'readwrite');
// access your object store    
    const budgetStore = transaction.objectStore('new_Transaction');
// get all records from store and set to a variable
    const getAll = budgetStore.getAll();
  
    getAll.onsuccess = function() {
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
          const transaction = db.transaction(['new_Transaction'], 'readwrite');

          const budgetStore = transaction.objectStore('new_Transaction');
          
          // clear all items in your store
          budgetStore.clear();

          alert('All saved transactions have been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
// listen for app coming back online
window.addEventListener('online', uploadTransaction);