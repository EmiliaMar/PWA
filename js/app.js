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

// service worker registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/PWA/service-worker.js")
      .then((registration) => {
        console.log("service worker registered:", registration.scope);

        // check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          console.log("service worker update found");

          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              console.log("new version available - reload to update");

              // optionally show update notification
              if (confirm("New version of the application is available! Reload to update?")) {
                newWorker.postMessage({ action: "skipWaiting" });
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error("service worker registration failed:", error);
      });
  });
}

const networkStatus = document.getElementById("network-status");
const networkStatusText = document.getElementById("network-status-text");

function updateNetworkStatus() {
  if (navigator.onLine) {
    networkStatusText.textContent = "Back online!";
    networkStatus.classList.add("online");
    networkStatus.style.display = "block";

    // hide after 3 seconds
    setTimeout(() => {
      networkStatus.style.display = "none";
      networkStatus.classList.remove("online");
      document.body.classList.remove("has-network-status");
    }, 3000);
  } else {
    networkStatusText.textContent = "You are offline - App is working in offline mode";
    networkStatus.style.display = "block";
    document.body.classList.add("has-network-status");
  }
}

window.addEventListener("online", () => {
  console.log("network: online");
  updateNetworkStatus();
});

window.addEventListener("offline", () => {
  console.log("network: offline");
  updateNetworkStatus();
});

// check initial status
if (!navigator.onLine) {
  updateNetworkStatus();
}
