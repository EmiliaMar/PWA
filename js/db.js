"use strict";

// indexeddb configuration
const DB_NAME = "BookTrackerDB";
const DB_VERSION = 1;
let db;

// database initialization
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("db open error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log("db ok");
      console.log("Stores:", db.objectStoreNames);
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      console.log("db create / update");
      console.log("version:", event.oldVersion, "→", event.newVersion);

      // store 1: books
      if (!db.objectStoreNames.contains("books")) {
        const bookStore = db.createObjectStore("books", {
          keyPath: "id",
          autoIncrement: true,
        });
        bookStore.createIndex("status", "status", { unique: false });
        bookStore.createIndex("genre", "genre", { unique: false });
        bookStore.createIndex("dateAdded", "dateAdded", { unique: false });
      }

      // store 2: quotes
      if (!db.objectStoreNames.contains("quotes")) {
        const quoteStore = db.createObjectStore("quotes", {
          keyPath: "id",
          autoIncrement: true,
        });
        quoteStore.createIndex("bookId", "bookId", { unique: false });
        quoteStore.createIndex("date", "date", { unique: false });
        console.log("store quotes ok");
      }

      // store 3: settings
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", {
          keyPath: "key",
        });
        console.log("store settings ok");
      }

      console.log("db structure ok");
    };
  });
}

// books operations
function addBook(book) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["books"], "readwrite");
    const store = transaction.objectStore("books");

    const bookData = {
      ...book,
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    const request = store.add(bookData);

    request.onsuccess = () => {
      console.log("book added, ID:", request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("add book error:", request.error);
      reject(request.error);
    };
  });
}

function getAllBooks() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["books"], "readonly");
    const store = transaction.objectStore("books");
    const request = store.getAll();

    request.onsuccess = () => {
      console.log("loaded", request.result.length, "books");
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("get books error:", request.error);
      reject(request.error);
    };
  });
}

function getBookById(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["books"], "readonly");
    const store = transaction.objectStore("books");
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("get book error:", request.error);
      reject(request.error);
    };
  });
}

function updateBook(id, updates) {
  return new Promise(async (resolve, reject) => {
    try {
      const book = await getBookById(id);

      if (!book) {
        reject(new Error("Book not found"));
        return;
      }

      const transaction = db.transaction(["books"], "readwrite");
      const store = transaction.objectStore("books");

      const updatedBook = {
        ...book,
        ...updates,
        lastUpdated: new Date().toISOString(),
      };

      const request = store.put(updatedBook);

      request.onsuccess = () => {
        console.log("book updated, ID:", request.result);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error("update book error:", request.error);
        reject(request.error);
      };
    } catch (error) {
      reject(error);
    }
  });
}

function deleteBook(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["books"], "readwrite");
    const store = transaction.objectStore("books");
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log("book deleted, ID:", id);
      resolve();
    };

    request.onerror = () => {
      console.error("delete book error:", request.error);
      reject(request.error);
    };
  });
}

// quotes crud operations

function addQuote(quote) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["quotes"], "readwrite");
    const store = transaction.objectStore("quotes");

    const quoteData = {
      ...quote,
      date: new Date().toISOString(),
    };

    const request = store.add(quoteData);

    request.onsuccess = () => {
      console.log("quote added, ID:", request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("add quote error:", request.error);
      reject(request.error);
    };
  });
}

function getAllQuotes() {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["quotes"], "readonly");
    const store = transaction.objectStore("quotes");
    const request = store.getAll();

    request.onsuccess = () => {
      console.log("loaded", request.result.length, "quotes");
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("get quotes error:", request.error);
      reject(request.error);
    };
  });
}

function getQuotesByBook(bookId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["quotes"], "readonly");
    const store = transaction.objectStore("quotes");
    const index = store.index("bookId");
    const request = index.getAll(bookId);

    request.onsuccess = () => {
      console.log("loaded", request.result.length, "quotes for book", bookId);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error("get quotes by book error:", request.error);
      reject(request.error);
    };
  });
}

function deleteQuote(id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["quotes"], "readwrite");
    const store = transaction.objectStore("quotes");
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log("quote deleted, ID:", id);
      resolve();
    };

    request.onerror = () => {
      console.error("delete quote error:", request.error);
      reject(request.error);
    };
  });
}
