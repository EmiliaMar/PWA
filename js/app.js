"use strict";

// page routing
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");

function showPage(pageName) {
  console.log(`showing page: ${pageName}`);

  // hide all pages
  pages.forEach((page) => {
    page.classList.remove("active");
  });

  // show target page
  const targetPage = document.getElementById(pageName);
  if (targetPage) {
    targetPage.classList.add("active");
  } else {
    console.error(`page not found: ${pageName}`);
    return;
  }

  // update active navigation button
  navButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.page === pageName) {
      btn.classList.add("active");
    }
  });

  // load page data
  loadPageData(pageName);
}

function loadPageData(pageName) {
  console.log(`loading data for: ${pageName}`);

  switch (pageName) {
    case "library":
      renderLibrary();
      break;
    case "add":
      console.log("form ready");
      break;
    case "quotes":
      renderQuotes();
      break;
    case "stats":
      renderStats();
      break;

    default:
      console.log("unknown page");
  }
}

// navigation event listeners
navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetPage = button.dataset.page;
    showPage(targetPage);
  });
});

// app initialization
document.addEventListener("DOMContentLoaded", async () => {
  console.log("pwa - start");
  console.log("version: 1.0.0");

  // initialize database
  try {
    await initDB(); // from db.js
    console.log("db init ok");
  } catch (error) {
    console.error("db init error", error);
    alert("error db init");
    return;
  }

  // initialize books module
  initBooks(); // from books.js
  initQuotes(); // from quotes.js
  initStats();

  // show initial page
  showPage("library");

  console.log("app loaded");
});

// export to global scope
window.showPage = showPage;

// sw - todo
