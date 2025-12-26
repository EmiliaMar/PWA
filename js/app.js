"use strict";

let db;
// db init

const DB_NAME = 'BookTrackerDB';
const DB_VERSION = 1;

function initDB() {
    return new Promise((resolve, reject) => {
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('db open error:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('db ok');
            console.log('Stores:', db.objectStoreNames);
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            console.log('db create / update');
            console.log('version:', event.oldVersion, '→', event.newVersion);
            
            // store 1: books
            if (!db.objectStoreNames.contains('books')) {
                const bookStore = db.createObjectStore('books', { 
                    keyPath: 'id',        
                    autoIncrement: true   
                });
                
                // indeksy
                bookStore.createIndex('status', 'status', { unique: false });
                bookStore.createIndex('genre', 'genre', { unique: false });
                bookStore.createIndex('dateAdded', 'dateAdded', { unique: false });
                
                // console.log('store books');
            }
            
            // store 2: quotes
            if (!db.objectStoreNames.contains('quotes')) {
                const quoteStore = db.createObjectStore('quotes', { 
                    keyPath: 'id',
                    autoIncrement: true
                });
                
                // indeksy
                quoteStore.createIndex('bookId', 'bookId', { unique: false });
                quoteStore.createIndex('date', 'date', { unique: false });
                
                console.log('store quotes ok');
            }
            
            // store 3: settigns
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { 
                    keyPath: 'key'  
                });
                
                console.log('store settings ok');
            }
            
            console.log('db structure ok');
        };
    });
}

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

function showPage(pageName) {
  console.log(`Showing page: ${pageName}`);

  pages.forEach((page) => {
    page.classList.remove("active");
  });

  const targetPage = document.getElementById(pageName);
  if (targetPage) {
    targetPage.classList.add("active");
  } else {
    console.error(`Page not found: ${pageName}`);
    return;
  }

  navButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.page === pageName) {
      btn.classList.add("active");
    }
  });

  loadPageData(pageName);
}

function loadPageData(pageName) {
  console.log(`Loading data for: ${pageName}`);

  switch (pageName) {
    case "library":
      console.log("Library loaded");
      break;
    case "add":
      console.log("Form ready");
      break;
    case "quotes":
      console.log("Quotes loaded");
      break;
    case "stats":
      console.log("Statistics loaded");
      break;
    default:
      console.log("Unknown page");
  }
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetPage = button.dataset.page;
    showPage(targetPage);
  });
});

// sw register - todo
document.addEventListener("DOMContentLoaded", async () => {
  console.log("PWA - Start");
  console.log("Version: 1.0.0");
  
  // db init
  try {
    await initDB();
    console.log('db init ok');
  } catch (error) {
    console.error('db init error', error);
    alert('Error db init');
    return; 
  }
  
  showPage("library");
  
  console.log("App loaded");
});

window.showPage = showPage;
