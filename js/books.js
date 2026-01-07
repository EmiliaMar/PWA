"use strict";

// books - global variables

let currentFilter = "all";
let currentBookId = null;
let currentCoverData = null;

// books - library rendering
async function renderLibrary() {
  console.log("rendering library, filter:", currentFilter);

  const booksGrid = document.getElementById("books-grid");
  const emptyState = document.getElementById("empty-state");

  try {
    const allBooks = await getAllBooks();

    // filter books by status
    let books = allBooks;
    if (currentFilter !== "all") {
      books = allBooks.filter((book) => book.status === currentFilter);
    }

    console.log("showing", books.length, "books");

    // show empty state if no books
    if (books.length === 0) {
      booksGrid.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    // render book cards
    booksGrid.innerHTML = books
      .map(
        (book) => `
            <div class="book-card" data-id="${book.id}">
                <div class="book-cover has-image" 
                     style="background-image: url(${book.cover || 'assets/cover.jpg'})">
                </div>
                <div class="book-title" title="${escapeHtml(book.title)}">
                    ${escapeHtml(book.title)}
                </div>
                <div class="book-author" title="${escapeHtml(book.author)}">
                    ${escapeHtml(book.author)}
                </div>
                <span class="book-status status-${book.status}">
                    ${getStatusText(book.status)}
                </span>
            </div>
        `
      )
      .join("");

    // attach click listeners to book cards
    document.querySelectorAll(".book-card").forEach((card) => {
      card.addEventListener("click", () => {
        const bookId = parseInt(card.dataset.id);
        showBookModal(bookId);
      });
    });
  } catch (error) {
    console.error("error rendering library:", error);
    booksGrid.innerHTML = '<p style="color: red;">Error loading books</p>';
  }
}

// books - modal
async function showBookModal(bookId) {
  console.log("showing modal for book:", bookId);

  currentBookId = bookId;

  const book = await getBookById(bookId);
  if (!book) {
    alert("Book not found");
    return;
  }

  const modal = document.getElementById("book-modal");
  const title = document.getElementById("modal-book-title");
  const author = document.getElementById("modal-book-author");
  const genre = document.getElementById("modal-book-genre");
  const statusDiv = document.getElementById("modal-book-status");
  const actionsDiv = document.getElementById("modal-book-actions");

  title.textContent = book.title;
  author.textContent = `by ${book.author}`;
  genre.textContent = `Genre: ${book.genre}`;

  // build status info
  let statusHTML = `<strong>Status:</strong> ${getStatusText(book.status)}<br>`;

  if (book.status === "reading" && book.dateStarted) {
    const days = Math.floor(
      (new Date() - new Date(book.dateStarted)) / (1000 * 60 * 60 * 24)
    );
    statusHTML += `Reading for ${days} day${days !== 1 ? "s" : ""}`;
  }

  if (book.status === "finished" && book.dateFinished) {
    const finishedDate = new Date(book.dateFinished).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    statusHTML += `Finished on ${finishedDate}`;
  }

  statusDiv.innerHTML = statusHTML;

  // build action buttons based on status
  let actionsHTML = "";

  if (book.status === "wishlist") {
    actionsHTML = `
            <button class="btn-primary" onclick="startReading(${bookId})">
                Start reading
            </button>
        `;
  } else if (book.status === "reading") {
    actionsHTML = `
            <button class="btn-primary" onclick="finishReading(${bookId})">
                Mark as finished
            </button>
        `;
  } else if (book.status === "finished") {
    actionsHTML = `
            <button class="btn-secondary" onclick="startReading(${bookId})">
                Re-read
            </button>
        `;
  }

  actionsDiv.innerHTML = actionsHTML;

  modal.classList.add("active");
}

function closeBookModal() {
  const modal = document.getElementById("book-modal");
  modal.classList.remove("active");
}

// books - tracking (start/finish reading)
window.startReading = async function (bookId) {
  console.log("start reading:", bookId);

  try {
    await updateBook(bookId, {
      status: "reading",
      dateStarted: new Date().toISOString(),
      dateFinished: null,
    });

    closeBookModal();
    renderLibrary();

  } catch (error) {
    console.error("error starting reading:", error);
    alert("Failed to update book");
  }
};

window.finishReading = async function (bookId) {
  console.log("finish reading:", bookId);

  try {
    await updateBook(bookId, {
      status: "finished",
      dateFinished: new Date().toISOString(),
    });

    closeBookModal();
    renderLibrary();

  } catch (error) {
    console.error("error finishing reading:", error);
    alert("Failed to update book");
  }
};

// books - filters
function initBookFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderLibrary();
    });
  });
}

// books - form (add new book)
function initBookForm() {
  const bookForm = document.getElementById("book-form");

  bookForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("form submitted");

    const title = document.getElementById("book-title").value.trim();
    const author = document.getElementById("book-author").value.trim();
    const genre = document.getElementById("book-genre").value;
    const status = document.getElementById("book-status").value;

    // validate required fields
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
        cover: currentCoverData,
        dateStarted: status === "reading" ? new Date().toISOString() : null,
        dateFinished: status === "finished" ? new Date().toISOString() : null,
      });

      console.log("Book saved with ID:", bookId);

      bookForm.reset();

  // reset cover
      currentCoverData = null;
      const coverPreview = document.getElementById("cover-preview");
      const cameraBtn = document.getElementById("camera-btn");
      const galleryBtn = document.getElementById("gallery-btn");
      const successMsg = document.querySelector(".cover-success");

      coverPreview.style.display = "none";
      cameraBtn.style.display = "block";
      galleryBtn.style.display = "block";

      if (successMsg) successMsg.remove();

      showPage("library");
    } catch (error) {
      console.error("Error saving book:", error);
      alert("Failed to save book");
    }
  });
}

// books - camera (cover photo)

let cameraStream = null; // track active camera stream

function initBookCamera() {
  const cameraBtn = document.getElementById("camera-btn");
  const galleryBtn = document.getElementById("gallery-btn");
  const fileInput = document.getElementById("file-input");
  const cameraContainer = document.getElementById("camera-container");
  const cameraVideo = document.getElementById("camera-video");
  const captureBtn = document.getElementById("capture-btn");
  const cancelCameraBtn = document.getElementById("cancel-camera-btn");
  const coverPreview = document.getElementById("cover-preview");

  // option 1: take photo with camera
  cameraBtn.addEventListener("click", async () => {
    console.log("opening camera...");

    try {
      // check camera support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("your browser does not support camera access");
        return;
      }

      // request camera access
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      console.log("camera access granted");

      // show camera container
      cameraContainer.style.display = "block";
      coverPreview.style.display = "none";

      // attach stream to video element
      cameraVideo.srcObject = cameraStream;

      // hide buttons
      cameraBtn.style.display = "none";
      galleryBtn.style.display = "none";
    } catch (error) {
      console.error("camera error:", error);

      if (error.name === "NotAllowedError") {
        alert(
          "camera access denied. please allow camera access in browser settings."
        );
      } else if (error.name === "NotFoundError") {
        alert("no camera found on this device.");
      } else {
        alert("cannot access camera: " + error.message);
      }
    }
  });

  // capture button - take photo from video
  captureBtn.addEventListener("click", () => {
    console.log("capturing photo...");

    // set canvas size to match video
    const canvas = coverPreview;
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;

    // draw current video frame to canvas
    const ctx = canvas.getContext("2d");
    ctx.drawImage(cameraVideo, 0, 0, canvas.width, canvas.height);

    // convert to base64 (jpeg, 80% quality)
    currentCoverData = canvas.toDataURL("image/jpeg", 0.8);

    console.log(
      "photo captured, size:",
      (currentCoverData.length / 1024).toFixed(2),
      "kb"
    );

    // show preview
    canvas.style.display = "block";

    // stop camera
    stopCamera();

    // show success message
    showCoverSuccess();
  });

  // cancel button - close camera
  cancelCameraBtn.addEventListener("click", () => {
    console.log("canceling camera...");
    stopCamera();

    // show buttons again
    cameraBtn.style.display = "block";
    galleryBtn.style.display = "block";
  });

  // option 2: choose from gallery

  galleryBtn.addEventListener("click", () => {
    console.log("opening file picker...");
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];

    if (!file) {
      console.log("no file selected");
      return;
    }

    console.log("file selected:", file.name, file.size, "bytes");

    // check if it is an image
    if (!file.type.startsWith("image/")) {
      alert("please select an image file");
      return;
    }

    // read file as data url
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        console.log("image loaded:", img.width, "x", img.height);

        // resize if too large (max 1280px width)
        let width = img.width;
        let height = img.height;
        const maxWidth = 1280;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // draw to canvas
        const canvas = coverPreview;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // convert to base64
        currentCoverData = canvas.toDataURL("image/jpeg", 0.8);

        console.log(
          "image processed, size:",
          (currentCoverData.length / 1024).toFixed(2),
          "kb"
        );

        // show preview
        canvas.style.display = "block";

        // show success message
        showCoverSuccess();
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);

    // reset input so same file can be selected again
    fileInput.value = "";
  });

  // helper: stop camera stream

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => {
        track.stop();
        console.log("camera stopped");
      });
      cameraStream = null;
    }

    // hide camera container
    cameraContainer.style.display = "none";
  }

  // helper: show success message

  function showCoverSuccess() {
    // remove old success message if exists
    const oldMsg = document.querySelector(".cover-success");
    if (oldMsg) oldMsg.remove();

    // create success message
    const successMsg = document.createElement("div");
    successMsg.className = "cover-success";
    successMsg.textContent = "cover added!";

    // insert after preview
    coverPreview.parentNode.insertBefore(
      successMsg,
      coverPreview.nextSibling
    );

    // hide buttons
    cameraBtn.style.display = "none";
    galleryBtn.style.display = "none";
  }
}

// books - modal event listeners
function initBookModalListeners() {
  // close button
  document
    .getElementById("close-book-modal")
    .addEventListener("click", closeBookModal);

  // click outside modal
  document.getElementById("book-modal").addEventListener("click", (e) => {
    if (e.target.id === "book-modal") {
      closeBookModal();
    }
  });

  // delete button
  document
    .getElementById("delete-book-btn")
    .addEventListener("click", async () => {
      // if (!confirm("Are you sure you want to delete this book?")) {
      //   return;
      // }

      try {
        await deleteBook(currentBookId);
        closeBookModal();
        renderLibrary();
      } catch (error) {
        console.error("error deleting book:", error);
        alert("Failed to delete book");
      }
    });
}

// books - init
function initBooks() {
  initBookFilters();
  initBookForm();
  initBookCamera();
  initBookModalListeners();
}