# BookTracker - Progressive Web App

> Aplikacja pozwala śledzić swoje postępy w czytaniu, zapisywać ulubione cytaty z książek i analizować statystyki.

[![PWA](https://img.shields.io/badge/PWA-enabled-success)](https://web.dev/progressive-web-apps/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 📖 Spis Treści

- [O Projekcie](#-o-projekcie)
- [Demo](#-demo)
- [Funkcjonalności](#-funkcjonalności)
- [Wykorzystane Technologie](#-wykorzystane-technologie)
- [Struktura Projektu](#-struktura-projektu)
- [Offline Mode](#-offline-mode)
- [Natywne API](#-natywne-api)

---

## 🎯 O Projekcie

**BookTracker** to Progressive Web App (PWA) która pozwala śledzenić postępy w czytaniu książek, umożliwia zarządzanie biblioteką osobistą, i pozwala na zapisywanie ulubionych cytatów oraz analizowanie statystyk czytelniczych.

---

## 🌐 Demo

**🔗 Live Demo:** [https://booktrackerpwa.surge.sh/](https://booktrackerpwa.surge.sh/)

---

## ✨ Funkcjonalności

### 📚 Biblioteka Książek
- Przeglądanie książkek z filtrami (All / Reading / Finished / Wishlist)
- Dodawanie nowych książkek z okładkami
- Śledzenie statusu czytania (To read, Reading, Finished)
- Usuwanie książek z biblioteki
- Sortowanie książek

### 📸 Zarządzanie okładkami
- **Aparat** - możliwość zrobienia zdjęcia okładki książki bezpośrednio z aplikacji
- **Galeria** - możliwość wyboru zdjęć z urządzenia jako okładki książki
- Preview okładki przed zapisaniem

### 💭 Cytaty
- Aplikacja pozwala na zapis ulubionych cytatów z książek
- **OCR** - podczas tworzenia aplikacji wykorzystałam Tesseract.js do rozpoznawania i wyodrębniania tekstu ze zdjęć.
- Cytaty można udostępniać poprzez Web Share API
- Treść cytatów można kopiować do schowka poprzez kliknięcie odpowiedniego przycisku
- Cytaty przypisywane są do konkrentej książki z biblioteki

### 📊 Statystyki
- Aplikacja zawiera ekran który przedstawia wykres z gatunkami książek z biblioteki Chart.js
- Liczba przeczytanych książek
- Aktualnie czytane
- Wishlist - lista książek które chcemy przeczytać
- Liczba zapisanych cytatów
- Wizualizacja postępów

### 🔄 Offline Mode
- **Pełna funkcjonalność offline**
- Service Worker cache dla zasobów
- IndexedDB dla danych użytkownika
- Wskaźnik statusu sieci
- Automatyczna synchronizacja po powrocie online

---

## 🛠 Wykorzystane Technologie

### Core Technologies
- **HTML5** - semantyczna struktura
- **CSS3** - stylowanie z CSS Variables
- **JavaScript** - vanilla JS
  
### Web APIs
| API | Zastosowanie |
|-----|--------------|
| 📷 **getUserMedia API** | Dostęp do kamery urządzenia |
| 📁 **File API** | Wybór plików z galerii |
| 📋 **Clipboard API** | Kopiowanie cytatów |
| 🔗 **Web Share API** | Udostępnianie cytatów |
| 💾 **IndexedDB** | Lokalna baza danych |
| ⚙️ **Service Worker** | Offline cache |
| 🌐 **Fetch API** | Network requests |
| 🎨 **Canvas API** | Przetwarzanie obrazów |

### Libraries
- **Chart.js 4.4.1** - wykresy statystyk
- **Tesseract.js 5.0** - OCR (rozpoznawanie tekstu)

---

## 📋 Funkcjonalności PWA zaimplementowane w aplikacji:

### ✅ 1. Instalowalność
- `manifest.json` z metadanymi aplikacji
- Ikony w 5 rozmiarach (72, 128, 144, 192, 512px)
- `display: standalone` dla trybu fullscreen
- `theme_color` i `background_color`

### ✅ 3. Natywne API
Wykorzystano **4 natywne API:**
1. **Camera API** (getUserMedia) - zdjęcia okładek
2. **File API** - wybór z galerii + canvas processing
3. **Clipboard API** - kopiowanie cytatów
4. **Web Share API** - udostępnianie

### ✅ 4. Tryb Offline
- Service Worker z cache-first strategy
- Precaching krytycznych zasobów
- Offline page dla nawigacji
- Network status indicator
- IndexedDB dla danych offline

### ✅ 6. Hosting
- Aplikacja dostępna online przez HTTPS
- URL: [https://booktrackerpwa.surge.sh/](https://booktrackerpwa.surge.sh/)

### ✅ 7. Responsywność
- Mobile-first design
- Flexbox & Grid layout
- Dolna nawigacja

---

## 📖 Użytkowanie aplikacji

1. **Dodaj pierwszą książkę**
   - Kliknij "Add" w dolnej nawigacji
   - Wypełnij formularz (tytuł, autor, gatunek, status)
   - Opcjonalnie: dodaj okładkę (aparat/galeria)
   - Kliknij "Save book"

2. **Zarządzaj biblioteką**
   - Przejdź do "Library"
   - Filtruj książki (All/Reading/Finished/Wishlist)
   - Kliknij książkę aby zobaczyć szczegóły
   - Zmień status czytania lub usuń

3. **Zapisz cytat**
   - Kliknij "Quotes"
   - "Add quote"
   - Wybierz książkę
   - Wpisz tekst lub użyj OCR (zdjęcie strony)
   - Zapisz

4. **Zobacz statystyki**
   - Kliknij "Statistics"
   - Wykres gatunków
   - Liczby przeczytanych/czytanych książek
   - Liczba cytatów

### Funkcje Zaawansowane

#### Instalacja PWA
```
Chrome (Desktop):
Pasek adresu → ikona instalacji (+) → "Install"

Chrome (Mobile):
Menu (⋮) → "Add to Home Screen"

iOS Safari:
Share → "Add to Home Screen"
```

---

## 📁 Struktura Projektu

```
PWA/
├── 📄 index.html              # Główna strona aplikacji
├── 📄 manifest.json           # PWA manifest
├── 📄 service-worker.js       # Service Worker
│
├── 📁 css/
│   └── style.css              # Style aplikacji
│
├── 📁 js/
│   ├── app.js                 # Główna logika, routing, SW registration
│   ├── books.js               # Zarządzanie książkami, kamera, formularze
│   ├── quotes.js              # Cytaty, OCR, share, clipboard
│   ├── stats.js               # Statystyki, wykresy
│   ├── db.js                  # IndexedDB operacje (CRUD)
│   └── utils.js               # Funkcje pomocnicze (escapeHtml)
│
└── 📁 assets/
    ├── 72.png
    ├── 128.png
    ├── 144.png
    ├── 192.png
    ├── 512.png
    └── cover.jpg              # Placeholder okładki
```

---

### Co Działa Offline?

- Przeglądanie książek
- Dodawanie książek (z okładkami)
- Edycja/usuwanie
- Dodawanie cytatów
- Statystyki
- Całe UI

### Network Status Indicator

Aplikacja pokazuje banner gdy:
- ❌ **Offline:** "You are offline - working in offline mode"
- ✅ **Back online:** "Back online!" (znika po 3s)

---

## 🔧 Natywne API

### 1. Camera API (getUserMedia)

**Zastosowanie:** Zdjęcia okładek książek

### 2. File API

**Zastosowanie:** Wybór okładki z galerii

### 3. Clipboard API

**Zastosowanie:** Kopiowanie cytatów

### 4. Web Share API

**Zastosowanie:** Udostępnianie cytatów

---

## 📸 Zdjęcia

<div align="center">
  <img width="290" height="796" alt="Simulator" src="https://github.com/user-attachments/assets/c3c71a2f-b9b1-4b72-91e3-239aceec2dd4" />
  <img width="290" height="796" alt="Simulator" src="https://github.com/user-attachments/assets/8e324db8-adc2-4cdd-9330-5dbce8d79527" />
  <img width="290" height="796" alt="Simulator" src="https://github.com/user-attachments/assets/0f71f5b4-a0e1-4c79-9f9e-80d6d3432777" />
  <img width="290" height="796" alt="Simulator" src="https://github.com/user-attachments/assets/29d6c6db-608c-4d2b-9dc4-d4025be5a3c2" />
</div>

---

## 👨‍💻 Autor

**Emilia Marchacz**

---

### Wykorzystane źródła
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web App Manifest](https://web.dev/add-manifest/)
- [MDN Web Docs](https://developer.mozilla.org/) - dokumentacja Web APIs
- [Chart.js](https://www.chartjs.org/) - wykresy statystyk
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [web.dev](https://web.dev/progressive-web-apps/) - PWA best practices
- [pwa-asset-generator](https://www.npmjs.com/package/pwa-asset-generator) - Automatycznie generuje ikony i splash screen images, favicons i mstile images


---

[🔝 Wróć do góry](#-booktracker---progressive-web-app)

</div>
