"use strict";

let genreChartInstance = null;

async function renderStats() {
  console.log("rendering stats page...");

  try {
    // get data from database
    const allBooks = await getAllBooks();
    const allQuotes = await getAllQuotes();

    // calculate book counts by status
    const finishedCount = countBooksByStatus(allBooks, "finished");
    const readingCount = countBooksByStatus(allBooks, "reading");
    const wishlistCount = countBooksByStatus(allBooks, "wishlist");
    const quotesCount = allQuotes.length;

    // update number displays on page
    updateStatNumber("stat-finished", finishedCount);
    updateStatNumber("stat-reading", readingCount);
    updateStatNumber("stat-wishlist", wishlistCount);
    updateStatNumber("stat-quotes", quotesCount);

    // check if user has any books
    const hasBooks = allBooks.length > 0;

    if (hasBooks) {
      // show stats and chart
      showStatsContent();
      renderGenreChart(allBooks);
    } else {
      // show empty state message
      showEmptyState();
    }
  } catch (error) {
    console.error("error loading stats:", error);
    alert("failed to load statistics");
  }
}

// count how many books have a specific status
function countBooksByStatus(books, status) {
  let count = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    if (book.status === status) {
      count = count + 1;
    }
  }

  return count;
}

// update a stat number on the page
function updateStatNumber(elementId, number) {
  const element = document.getElementById(elementId);
  element.textContent = number;
}

// show stats grid and chart
function showStatsContent() {
  const emptyState = document.getElementById("stats-empty");
  const statsGrid = document.querySelector(".stats-grid");
  const chartSection = document.querySelector(".chart-section");

  emptyState.style.display = "none";
  statsGrid.style.display = "grid";
  chartSection.style.display = "block";
}

// show empty state when no books
function showEmptyState() {
  const emptyState = document.getElementById("stats-empty");
  const statsGrid = document.querySelector(".stats-grid");
  const chartSection = document.querySelector(".chart-section");

  emptyState.style.display = "block";
  statsGrid.style.display = "none";
  chartSection.style.display = "none";
}

// stats - genre chart rendering
function renderGenreChart(books) {
  console.log("creating genre chart...");

  // count books for each genre
  const genreCounts = countBooksByGenre(books);

  // prepare data for chart
  const genreNames = getGenreNames(genreCounts);
  const genreNumbers = getGenreNumbers(genreCounts);

  // destroy old chart if it exists
  if (genreChartInstance !== null) {
    genreChartInstance.destroy();
    genreChartInstance = null;
  }

  // get canvas element
  const canvas = document.getElementById("genre-chart");
  const context = canvas.getContext("2d");

  // create new chart
  genreChartInstance = new Chart(context, {
    type: "doughnut",
    data: {
      labels: genreNames,
      datasets: [
        {
          data: genreNumbers,
          backgroundColor: [
            "#f97316",
            "#fed7aa",
            "#c2410c",
            "#ffedd5",
            "#ea580c",
            "#fdba74",
            "#9a3412",
            "#fff7ed",
            "#fb923c",
            "#fed7aa",
          ],
          borderWidth: 3,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 15,
            font: {
              size: 13,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const genreName = context.label;
              const bookCount = context.parsed;
              const totalBooks = context.dataset.data.reduce(function (a, b) {
                return a + b;
              }, 0);
              const percentage = ((bookCount / totalBooks) * 100).toFixed(1);

              return (
                genreName + ": " + bookCount + " books (" + percentage + "%)"
              );
            },
          },
        },
      },
    },
  });

  console.log("chart created successfully");
}

// count how many books are in each genre
function countBooksByGenre(books) {
  const counts = {};

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const genre = book.genre || "other";

    // if genre exists in counts, add 1 otherwise start at 1
    if (counts[genre]) {
      counts[genre] = counts[genre] + 1;
    } else {
      counts[genre] = 1;
    }
  }

  return counts;
}

// get array of genre names with capital first letter
function getGenreNames(genreCounts) {
  const names = [];
  const genreKeys = Object.keys(genreCounts);

  for (let i = 0; i < genreKeys.length; i++) {
    const genre = genreKeys[i];
    const capitalizedGenre = capitalizeFirstLetter(genre);
    names.push(capitalizedGenre);
  }

  return names;
}

// get array of genre numbers
function getGenreNumbers(genreCounts) {
  const numbers = Object.values(genreCounts);
  return numbers;
}

// make first letter uppercase
function capitalizeFirstLetter(text) {
  const firstLetter = text.charAt(0).toUpperCase();
  const restOfText = text.slice(1);
  return firstLetter + restOfText;
}

// stats - initialization

function initStats() {
  console.log("stats module ini");
}
