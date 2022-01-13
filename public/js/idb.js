

let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('pending', { autoIncrement: true });
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
    const transaction = db.transaction(['pending'], 'readwrite');
    const  budgetObjectStore = transaction.objectStore('pending');
  
    budgetObjectStore.add(record);
};

function uploadTransaction() {

  // open a transaction on your db
  const transaction = db.transaction(['pending'], 'readwrite');

  // access your object store
  const budgetObjectStore = transaction.objectStore('pending');

  // get all records from store and set to a variable
  const getAll = budgetObjectStore.getAll();

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
          const transaction = db.transaction(['pending'], 'readwrite');

          const budgetObjectStore = transaction.objectStore('pending');
          
          // clear all items in your store
          budgetObjectStore.clear();

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