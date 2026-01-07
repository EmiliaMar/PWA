"use strict";

// quotes - global variables

let currentQuoteBookId = null;
let currentQuotePhoto = null;

// quotes - render list

async function renderQuotes() {
  console.log("rendering quotes...");

  const quotesList = document.getElementById("quotes-list");
  const quotesEmpty = document.getElementById("quotes-empty");

  try {
    const quotes = await getAllQuotes();

    console.log("loaded", quotes.length, "quotes");

    // show empty state if no quotes
    if (quotes.length === 0) {
      quotesList.innerHTML = "";
      quotesEmpty.style.display = "block";
      return;
    }

    quotesEmpty.style.display = "none";

    // get all books for book titles
    const books = await getAllBooks();
    const booksMap = {};
    books.forEach((book) => {
      booksMap[book.id] = book;
    });

    // render quote cards (newest first)
    quotesList.innerHTML = quotes
      .reverse()
      .map((quote) => {
        const book = booksMap[quote.bookId];
        const bookTitle = book ? book.title : "unknown book";
        const bookAuthor = book ? book.author : "";

        return `
             <div class="quote-card" data-id="${quote.id}">
                <div class="quote-text">"${escapeHtml(quote.text)}"</div>
                <div class="quote-meta">
                    <div class="quote-book">
                        ${escapeHtml(bookTitle)}
                        ${
                          bookAuthor
                            ? `<br><small>by ${escapeHtml(bookAuthor)}</small>`
                            : ""
                        }
                    </div>
                    <div class="quote-date">
                        ${new Date(quote.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                    </div>
                </div>
                <div class="quote-actions">
                    <button class="btn-icon" onclick="shareQuote(${
                      quote.id
                    })" title="share">
                        copy
                    </button>
                    <button class="btn-icon" onclick="deleteQuoteWithConfirm(${
                      quote.id
                    })" title="delete">
                        delete
                    </button>
                </div>
            </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("error rendering quotes:", error);
    quotesList.innerHTML = '<p style="color: red;">error loading quotes</p>';
  }
}

// quotes - modal (add quote)

function showAddQuoteModal() {
  console.log("showing add quote modal");

  const modal = document.getElementById("quote-modal");
  modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeQuoteModal()">&times;</span>
            <h2>add quote</h2>
            
            <div class="form-group">
                <label for="quote-book-select">select book *</label>
                <select id="quote-book-select" required>
                    <option value="">-- select book --</option>
                </select>
            </div>
            
            <div class="quote-input-methods">
                <button type="button" id="manual-quote-btn" class="btn-secondary">
                    type manually
                </button>
                <button type="button" id="ocr-quote-btn" class="btn-secondary">
                    scan with camera (ocr)
                </button>
            </div>
            
            <div id="manual-input" style="display: none; margin-top: 20px;">
                <div class="form-group">
                    <label for="quote-text">quote text *</label>
                    <textarea 
                        id="quote-text" 
                        rows="6" 
                        placeholder="enter your quote here..."
                        required
                    ></textarea>
                </div>
                <button type="button" id="save-manual-quote-btn" class="btn-primary">
                    save quote
                </button>
            </div>
            
            <div id="ocr-input" style="display: none; margin-top: 20px;">
                <div class="form-group">
                    <label>take photo of quote</label>
                    <div id="ocr-camera-container" style="display: none;">
                        <video id="ocr-video" autoplay playsinline></video>
                        <div class="camera-controls">
                            <button type="button" id="ocr-capture-btn" class="btn-primary">
                                capture
                            </button>
                            <button type="button" id="ocr-cancel-btn" class="btn-secondary">
                                ✖ cancel
                            </button>
                        </div>
                    </div>
                    <button type="button" id="start-ocr-camera-btn" class="btn-secondary">
                        open camera
                    </button>
                    <canvas id="ocr-preview" style="display: none;"></canvas>
                </div>
                
                <div id="ocr-processing" style="display: none; text-align: center; padding: 20px;">
                    <div class="spinner"></div>
                    <p>processing image with ocr...</p>
                    <p style="font-size: 12px; color: #666;">this may take a few seconds</p>
                </div>
                
                <div id="ocr-result" style="display: none;">
                    <div class="form-group">
                        <label for="ocr-text">extracted text (edit if needed)</label>
                        <textarea 
                            id="ocr-text" 
                            rows="6"
                        ></textarea>
                    </div>
                    <button type="button" id="save-ocr-quote-btn" class="btn-primary">
                        save quote
                    </button>
                </div>
            </div>
        </div>
    `;

  modal.classList.add("active");

  // load books into select
  loadBooksIntoSelect();

  // attach event listeners
  initQuoteModalListeners();
}

function closeQuoteModal() {
  const modal = document.getElementById("quote-modal");
  modal.classList.remove("active");
  modal.innerHTML = "";

  // stop any active camera
  stopOcrCamera();
}

// quotes - load books into select

async function loadBooksIntoSelect() {
  const select = document.getElementById("quote-book-select");

  try {
    const books = await getAllBooks();

    // filter only reading and finished books
    const relevantBooks = books.filter(
      (b) => b.status === "reading" || b.status === "finished"
    );

    if (relevantBooks.length === 0) {
      select.innerHTML =
        '<option value="">no books available - add a book first</option>';
      select.disabled = true;
      return;
    }

    select.innerHTML =
      '<option value="">-- select book --</option>' +
      relevantBooks
        .map(
          (book) =>
            `<option value="${book.id}">${escapeHtml(
              book.title
            )} - ${escapeHtml(book.author)}</option>`
        )
        .join("");
  } catch (error) {
    console.error("error loading books:", error);
    select.innerHTML = '<option value="">error loading books</option>';
  }
}

// quotes - modal event listeners

let ocrCameraStream = null;

function initQuoteModalListeners() {
  const manualBtn = document.getElementById("manual-quote-btn");
  const ocrBtn = document.getElementById("ocr-quote-btn");
  const manualInput = document.getElementById("manual-input");
  const ocrInput = document.getElementById("ocr-input");

  // show manual input
  manualBtn.addEventListener("click", () => {
    manualInput.style.display = "block";
    ocrInput.style.display = "none";
    manualBtn.classList.add("active");
    ocrBtn.classList.remove("active");
  });

  // show ocr input
  ocrBtn.addEventListener("click", () => {
    ocrInput.style.display = "block";
    manualInput.style.display = "none";
    ocrBtn.classList.add("active");
    manualBtn.classList.remove("active");
  });

  // save manual quote
  document
    .getElementById("save-manual-quote-btn")
    .addEventListener("click", saveManualQuote);

  // ocr camera controls
  document
    .getElementById("start-ocr-camera-btn")
    .addEventListener("click", startOcrCamera);

  document
    .getElementById("ocr-capture-btn")
    .addEventListener("click", captureOcrPhoto);

  document
    .getElementById("ocr-cancel-btn")
    .addEventListener("click", stopOcrCamera);

  // save ocr quote
  document
    .getElementById("save-ocr-quote-btn")
    .addEventListener("click", saveOcrQuote);
}

// quotes - save manual quote

async function saveManualQuote() {
  const bookId = document.getElementById("quote-book-select").value;
  const text = document.getElementById("quote-text").value.trim();

  // validate
  if (!bookId) {
    alert("Please select a book");
    return;
  }

  if (!text) {
    alert("Please enter quote text");
    return;
  }

  console.log("saving manual quote:", { bookId, text });

  try {
    await addQuote({
      bookId: parseInt(bookId),
      text: text,
      photoUrl: null,
      rawOcrText: null,
    });

    alert("quote added!");
    closeQuoteModal();
    renderQuotes();
  } catch (error) {
    console.error("error saving quote:", error);
    alert("failed to save quote");
  }
}

// quotes - ocr camera

async function startOcrCamera() {
  console.log("starting ocr camera...");

  try {
    const preview = document.getElementById("ocr-preview");
    const result = document.getElementById("ocr-result");

    preview.style.display = "none";
    result.style.display = "none";
    currentQuotePhoto = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("your browser does not support camera access");
      return;
    }

    ocrCameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    const video = document.getElementById("ocr-video");
    const container = document.getElementById("ocr-camera-container");
    const btn = document.getElementById("start-ocr-camera-btn");

    video.srcObject = ocrCameraStream;
    container.style.display = "block";
    btn.style.display = "none";

    console.log("ocr camera started");
  } catch (error) {
    console.error("ocr camera error:", error);
    alert("cant access camera: " + error.message);
  }
}

function stopOcrCamera() {
  if (ocrCameraStream) {
    ocrCameraStream.getTracks().forEach((track) => track.stop());
    ocrCameraStream = null;
    console.log("ocr camera stopped");
  }

  const container = document.getElementById("ocr-camera-container");
  const btn = document.getElementById("start-ocr-camera-btn");

  if (container) container.style.display = "none";
  if (btn) btn.style.display = "block";
}

async function captureOcrPhoto() {
  console.log("capturing ocr photo...");

  const video = document.getElementById("ocr-video");
  const canvas = document.getElementById("ocr-preview");
  const processing = document.getElementById("ocr-processing");
  const result = document.getElementById("ocr-result");

  // capture photo
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  currentQuotePhoto = canvas.toDataURL("image/jpeg", 0.8);

  // show preview
  canvas.style.display = "block";

  // stop camera
  stopOcrCamera();

  // show processing indicator
  processing.style.display = "block";

  try {
    // perform ocr
    const text = await performOcr(canvas);

    console.log("ocr result:", text);

    // hide processing
    processing.style.display = "none";

    // show result
    document.getElementById("ocr-text").value = text;
    result.style.display = "block";
  } catch (error) {
    console.error("ocr error:", error);
    processing.style.display = "none";
    alert("ocr failed: " + error.message);
  }
}

// quotes - ocr with tesseract.js

async function performOcr(canvas) {
  console.log("performing ocr...");

  // check if tesseract is loaded
  if (typeof Tesseract === "undefined") {
    throw new Error(
      "tesseract.js not loaded. please check internet connection."
    );
  }

  try {
    const result = await Tesseract.recognize(canvas, "pol+eng", {
      logger: (m) => console.log("ocr progress:", m),
    });

    return result.data.text.trim();
  } catch (error) {
    console.error("tesseract error:", error);
    throw error;
  }
}

// quotes - save ocr quote

async function saveOcrQuote() {
  const bookId = document.getElementById("quote-book-select").value;
  const text = document.getElementById("ocr-text").value.trim();

  if (!bookId) {
    alert("please select a book");
    return;
  }

  if (!text) {
    alert("please enter quote text");
    return;
  }

  console.log("saving ocr quote:", { bookId, text });

  try {
    await addQuote({
      bookId: parseInt(bookId),
      text: text,
      photoUrl: null,
      rawOcrText: text,
    });

    closeQuoteModal();
    renderQuotes();

    currentQuotePhoto = null;
  } catch (error) {
    console.error("error saving quote:", error);
    alert("failed to save quote");
  }
}

// quotes - share (web share api)

window.shareQuote = async function (quoteId) {
  console.log("sharing quote:", quoteId);

  try {
    const quotes = await getAllQuotes();
    const quote = quotes.find((q) => q.id === quoteId);

    if (!quote) {
      alert("quote not found");
      return;
    }

    const books = await getAllBooks();
    const book = books.find((b) => b.id === quote.bookId);
    const bookTitle = book ? book.title : "unknown book";
    const bookAuthor = book ? book.author : "";

    const shareText = `"${quote.text}"\n\n— ${bookTitle}${
      bookAuthor ? " by " + bookAuthor : ""
    }`;

    // check if web share api is supported
    if (navigator.share) {
      await navigator.share({
        title: "quote from booktracker",
        text: shareText,
      });
      console.log("quote shared successfully");
    } else {
      // fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert("quote copied to clipboard!");
    }
  } catch (error) {
    console.error("share error:", error);
    if (error.name !== "AbortError") {
      alert("failed to share quote");
    }
  }
};

// quotes - delete

window.deleteQuoteWithConfirm = async function (quoteId) {
  if (!confirm("are you sure you want to delete this quote?")) {
    return;
  }

  console.log("deleting quote:", quoteId);

  try {
    await deleteQuote(quoteId);
    renderQuotes();
    alert("quote deleted");
  } catch (error) {
    console.error("error deleting quote:", error);
    alert("failed to delete quote");
  }
};

// quotes - initialization

function initQuotes() {
  const addQuoteBtn = document.getElementById("add-quote-btn");

  addQuoteBtn.addEventListener("click", () => {
    showAddQuoteModal();
  });
}