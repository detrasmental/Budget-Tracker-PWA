

let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('pending', { autoIncrement: true });
};


request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
      uploadBudget();
    }
  };
  
  request.onerror = function(event) {
    //log error here
    console.log("Somethings not quite right" + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['pending'], 'readwrite');
    const  store = transaction.objectStore('pending');
  
    store.add(record);
};

function uploadBudget() {
  const transaction = db.transaction(['pending'], 'readwrite');
  const store = transaction.objectStore('pending');
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(['pending'], 'readwrite');
          const store = transaction.objectStore('pending');
          // clear all items in your store
          store.clear();
        });
    }
  }
};
// listen for app coming back online
window.addEventListener('online', uploadBudget);