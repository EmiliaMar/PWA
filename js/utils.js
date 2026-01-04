"use strict";
// helper functions

// escape html to prevent xss
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// get readable status text
function getStatusText(status) {
  const statusMap = {
    reading: "Reading",
    finished: "Finished",
    wishlist: "To Read",
  };
  return statusMap[status] || status;
}
