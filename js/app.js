"use strict";

let db;
// db init

const DB_NAME = "BookTrackerDB";
const DB_VERSION = 1;

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

        // indeksy
        bookStore.createIndex("status", "status", { unique: false });
        bookStore.createIndex("genre", "genre", { unique: false });
        bookStore.createIndex("dateAdded", "dateAdded", { unique: false });

        // console.log('store books');
      }

      // store 2: quotes
      if (!db.objectStoreNames.contains("quotes")) {
        const quoteStore = db.createObjectStore("quotes", {
          keyPath: "id",
          autoIncrement: true,
        });

        // indeksy
        quoteStore.createIndex("bookId", "bookId", { unique: false });
        quoteStore.createIndex("date", "date", { unique: false });

        console.log("store quotes ok");
      }

      // store 3: settigns
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

const bookForm = document.getElementById("book-form");

bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  console.log("form submitted");

  const title = document.getElementById("book-title").value.trim();
  const author = document.getElementById("book-author").value.trim();
  const genre = document.getElementById("book-genre").value;
  const status = document.getElementById("book-status").value;

  if (!title || !author || !genre || !status) {
    alert("Fill in all required fields!");
    return;
  }

  console.log("Book data:", { title, author, genre, status });

  try {
    const bookId = await addBook({
      title: title,
      author: author,
      genre: genre,
      status: status,
      cover: null, //todo
      dateStarted: status === "reading" ? new Date().toISOString() : null,
      dateFinished: status === "finished" ? new Date().toISOString() : null,
    });

    console.log("Book saved with ID:", bookId);

    alert("Book added successfully!");
    bookForm.reset();

    showPage("library");
  } catch (error) {
    console.error("Error saving book:", error);
    alert("Failed to save book");
  }
});

// sw register - todo
document.addEventListener("DOMContentLoaded", async () => {
  console.log("PWA - Start");
  console.log("Version: 1.0.0");

  // db init
  try {
    await initDB();
    console.log("db init ok");
  } catch (error) {
    console.error("db init error", error);
    alert("Error db init");
    return;
  }

  showPage("library");

  console.log("App loaded");
});

window.showPage = showPage;
