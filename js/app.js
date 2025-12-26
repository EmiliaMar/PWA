"use strict";

let db;

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

// sw register
document.addEventListener("DOMContentLoaded", () => {
  console.log("PWA start");
  console.log("Version: 1.0.0");

  showPage("library");

  console.log("App loaded");
});

window.showPage = showPage;
