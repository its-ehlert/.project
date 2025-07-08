displayBooks(); //As the browser open it show all the stored books

let libraryForm = document.getElementById("libraryForm");
let name = document.getElementById("bookName");
let author = document.getElementById("author");
let isbn = document.getElementById("isbnno");
let edition = document.getElementById("edition");
let publicationD = document.getElementById("publicationdate");
let read = document.getElementById("read-toggle");
let bookDescription = document.getElementById("bookDescription");
let charCount = document.getElementById("charCount");

let url = document.getElementById("bookurl");
let favorite = document.getElementById("fav-toggle");
let type;
console.log(favorite);

let fiction = document.getElementById("fiction");
let programming = document.getElementById("programming");
let science = document.getElementById("science");
let others = document.getElementById("other");

let editIndex = -1;

// Enhanced form functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

function initializeForm() {
    // Character counter for description
    if (bookDescription && charCount) {
        bookDescription.addEventListener('input', function() {
            const maxLength = 300;
            const currentLength = this.value.length;
            charCount.textContent = currentLength;
            
            if (currentLength > maxLength * 0.8) {
                charCount.style.color = currentLength > maxLength * 0.9 ? '#e74c3c' : '#f39c12';
            } else {
                charCount.style.color = '#667eea';
            }
        });
    }

    // Real-time validation
    if (name) {
        name.addEventListener('input', validateBookName);
    }
    
    if (author) {
        author.addEventListener('input', validateAuthor);
    }
    
    if (isbn) {
        isbn.addEventListener('input', validateISBN);
    }
    
    if (url) {
        url.addEventListener('input', validateURL);
    }

    // Book type selection enhancement
    const typeOptions = document.querySelectorAll('input[name="type"]');
    typeOptions.forEach(option => {
        option.addEventListener('change', function() {
            const newTypeGroup = document.getElementById('newTypeGroup');
            if (this.value === 'Other') {
                newTypeGroup.style.display = 'block';
            } else {
                newTypeGroup.style.display = 'none';
            }
        });
    });
}

// Validation functions
function validateBookName() {
    const value = this.value.trim();
    const isValid = value.length >= 2;
    
    if (isValid) {
        this.style.borderColor = '#667eea';
        this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    } else {
        this.style.borderColor = '#e74c3c';
        this.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    }
    
    return isValid;
}

function validateAuthor() {
    const value = this.value.trim();
    const isValid = value.length >= 2;
    
    if (isValid) {
        this.style.borderColor = '#667eea';
        this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    } else {
        this.style.borderColor = '#e74c3c';
        this.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    }
    
    return isValid;
}

function validateISBN() {
    const value = this.value.trim();
    if (value === '') return true; // ISBN is optional
    
    const isValid = isValidISBN(value);
    
    if (isValid) {
        this.style.borderColor = '#667eea';
        this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    } else {
        this.style.borderColor = '#e74c3c';
        this.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    }
    
    return isValid;
}

function validateURL() {
    const value = this.value.trim();
    if (value === '') return true; // URL is optional
    
    const isValid = isValidURL(value);
    
    if (isValid) {
        this.style.borderColor = '#667eea';
        this.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    } else {
        this.style.borderColor = '#e74c3c';
        this.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    }
    
    return isValid;
}

// Enhanced validation functions
function isValidISBN(subject) {
    if (!subject) return true; // Empty ISBN is valid (optional field)
    
    subject = subject.replaceAll("-", "");
    if (subject.length == 10) {
        let sum = 0;
        for (let i = 9; i >= 0; i--) {
            sum += parseInt(subject[i], 10) * (i + 1);
        }
        return sum % 11 == 0;
    } else if (subject.length == 13) {
        let sum = 0;
        for (let i = 0; i < 13; i++) {
            if (i % 2 == 0) {
                sum += parseInt(subject[i], 10) * 1;
            } else {
                sum += parseInt(subject[i], 10) * 3;
            }
        }
        return sum % 10 == 0;
    }
    return false;
}

function isValidURL(urlString) {
    if (!urlString) return true; // Empty URL is valid (optional field)
    
    var urlPattern = new RegExp(
        "^(https?:\\/\\/)?" + // validate protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
        "(\\#[-a-z\\d_]*)?$",
        "i"
    );
    return !!urlPattern.test(urlString);
}

// Form submission with enhanced validation
libraryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    // Validate all required fields
    const isNameValid = validateBookName.call(name);
    const isAuthorValid = validateAuthor.call(author);
    const isIsbnValid = validateISBN.call(isbn);
    const isUrlValid = validateURL.call(url);
    
    if (!isNameValid || !isAuthorValid || !isIsbnValid || !isUrlValid) {
        showNotification('Please fix the validation errors before submitting.', 'error');
        return;
    }

    // Check if URL is valid
    if (url.value && !isValidURL(url.value)) {
        showNotification('Invalid URL format. Please enter a valid URL.', 'error');
        url.value = "";
        return;
    }

    // Check if ISBN is valid
    if (isbn.value && !isValidISBN(isbn.value)) {
        showNotification('Invalid ISBN format. Please enter a valid 10 or 13 digit ISBN.', 'error');
        return;
    }

    // Get selected book type
    const selectedType = document.querySelector('input[name="type"]:checked');
    if (selectedType) {
        if (selectedType.value === 'Other') {
            const newType = document.getElementById('newType');
            type = newType.value ? newType.value : 'Other';
        } else {
            type = selectedType.value;
        }
    } else {
        type = "Other";
    }

    // Check for duplicate books
    let shelf = localStorage.getItem("shelfOfBooks");
    let objOfBook;
    let alreadyAdded = false;

    if (shelf == null) {
        objOfBook = [];
    } else {
        objOfBook = JSON.parse(shelf);
        
        objOfBook.every((bookObj) => {
            if (author.value === "") author.value = "Unknown";
            let curBook = name.value === bookObj.book;
            let curAuthor = author.value === bookObj.bookauthor;
            let curBookType = type === bookObj.bookType;

            if (curBook && curAuthor && curBookType) {
                console.log("already added!");
                alreadyAdded = true;
                return false;
            }
            return true;
        });
    }

    if (alreadyAdded === true) {
        showNotification('This book is already in your library!', 'warning');
        return;
    }

    // Create book object with enhanced data
    const bookObj = {
        book: name.value,
        bookauthor: author.value || "Unknown",
        bookType: type,
        isbn: isbn.value || "",
        edition: edition.value || "",
        publicationDate: publicationD.value || "",
        bookUrl: url.value || "",
        description: bookDescription ? bookDescription.value : "",
        isFavorite: favorite.checked,
        isRead: read.checked,
        dateAdded: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };

    objOfBook.push(bookObj);
    localStorage.setItem("shelfOfBooks", JSON.stringify(objOfBook));

    showNotification('Book added successfully!', 'success');
    resetForm();
    displayBooks();
});

// Enhanced form reset
function resetForm() {
    libraryForm.reset();
    
    // Reset validation styles
    const inputs = libraryForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.style.borderColor = '#404040';
        input.style.boxShadow = 'none';
    });
    
    // Reset character counter
    if (charCount) {
        charCount.textContent = '0';
        charCount.style.color = '#667eea';
    }
    
    // Hide custom type input
    const newTypeGroup = document.getElementById('newTypeGroup');
    if (newTypeGroup) {
        newTypeGroup.style.display = 'none';
    }
    
    // Reset edit mode
    editIndex = -1;
    
    // Update button text
    const submitBtn = libraryForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Book';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Search functionality
const searchButton = document.getElementById("searchButton");
if (searchButton) {
    searchButton.addEventListener("click", searchBook);
}

// Function to handle the search when the user clicks the "Search" button
function searchBook() {
    let searchInput = document.getElementById("searchText");
    let enteredBookName = searchInput.value.trim();

    if (enteredBookName === "") {
        showNotification("Please enter a book name.", "warning");
        return;
    }

    let shelf = localStorage.getItem("shelfOfBooks");
    let objOfBook = shelf ? JSON.parse(shelf) : [];
    let foundBook = objOfBook.find((bookObj) => bookObj.book === enteredBookName);

    if (foundBook) {
        showNotification(`The book "${enteredBookName}" is already in the library.`, "info");
    } else {
        showNotification(`The book "${enteredBookName}" was not found in the library.`, "info");
    }
}

function editBook(index) {
  let bookDetails = JSON.parse(localStorage.getItem("shelfOfBooks"))[index];

  name.value = bookDetails.book;
  author.value = bookDetails.bookauthor;
  isbn.value = bookDetails.bookisbn;
  edition.value = bookDetails.bookedition;
  publicationD.value = bookDetails.bookpublication;
  url.value = bookDetails.bookurl;
  bookDescription.value = bookDetails.bookDescription || '';
  favorite.checked = !!bookDetails.favorite;
  read.checked = !!bookDetails.readStatus;

  // Set the correct radio button for bookType
  const typeOptions = document.querySelectorAll('input[name="type"]');
  typeOptions.forEach(option => {
    option.checked = (option.value === bookDetails.bookType);
  });

  // Show custom type input if 'Other' is selected
  const newTypeGroup = document.getElementById('newTypeGroup');
  if (bookDetails.bookType === 'Other') {
    newTypeGroup.style.display = 'block';
    document.getElementById('newType').value = bookDetails.bookType;
  } else {
    newTypeGroup.style.display = 'none';
    document.getElementById('newType').value = '';
  }

  editIndex = index;
  name.focus();
}

//Function to show elements(books) from LocalStorage
function displayBooks() {
  let books = localStorage.getItem("shelfOfBooks");
  let clearBtn = document.getElementById("clear");
  let objOfBook;

  if (books == null) {
    objOfBook = [];
  } else {
    objOfBook = JSON.parse(books);
  }
  let html = "";
  let index = 0;

  objOfBook.forEach((books) => {
    //index is the length of the array
    if (index == 0) {
      html += `
           <tr class="rows">
           <th scope="row">1</th>
           <td class="name"><a class="bookurl" href=${books.bookurl}> ${books.book
        } </a></td>
           <td class="author">${books.bookauthor}</td>
           <td class="type">${books.bookType}</td>
           <td class="isbn">${books.bookisbn}</td>
           <td class="edition">${books.bookedition}</td>
           <td class="publicationdate">${books.bookpublication}</td>
           <td class="type">${books.readStatus
          ? `<label class="switch">
                  <input type="checkbox" checked disabled>
                  <span class="slider round"></span>
            </label>`
          : `<label class="switch">
                  <input type="checkbox" disabled>
                  <span class="slider round"></span>
            </label>`
        }</td>
           <td class="fav">${books.favorite
          ? `<label class="switch">
                        <input type="checkbox" checked disabled>
                        <span class="slider round"></span>
                  </label>`
          : `<label class="switch">
                        <input type="checkbox" disabled>
                        <span class="slider round"></span>
                  </label>`
        }</td>
           <td class="icon"><i class="fa fa-times" aria-hidden="true" onclick="removeBook(${index})"></i></td>
           <td class="icon"><i class="fa fa-edit" aria-hidden="true" onclick="editBook(${index})"></i></td>
           </tr>
        `;
    } else {
      html += `
           <tr class="rows">
           <th scope="row">${index + 1}</th>
           <td class="name"><a class="bookurl" href=${books.bookurl}> ${books.book
        } </a></td>
           <td class="author">${books.bookauthor}</td>
           <td class="type">${books.bookType}</td>
           <td class="isbn">${books.bookisbn}</td>
           <td class="edition">${books.bookedition}</td>
           <td class="publicationdate">${books.bookpublication}</td>
           <td class="type">${books.readStatus
          ? `<label class="switch">
                      <input type="checkbox" checked disabled>
                      <span class="slider round"></span>
                </label>`
          : `<label class="switch">
                      <input type="checkbox" disabled>
                      <span class="slider round"></span>
                </label>`
        }</td>
           <td class="fav">${books.favorite
          ? `<label class="switch">
                        <input type="checkbox" checked disabled>
                        <span class="slider round"></span>
                  </label>`
          : `<label class="switch">
                        <input type="checkbox" disabled>
                        <span class="slider round"></span>
                  </label>`
        }</td>
            <td class="icon"><i class="fa fa-times" aria-hidden="true" onclick="removeBook(${index})"></i></td>
           <td class="icon"><i class="fa fa-edit" aria-hidden="true" onclick="editBook(${index})"></i></td>
           </tr>
        `;
    }

    index++;

    console.log("count " + index);
  });

  let table = document.getElementById("tableBody");
  let noDisplayMsg = document.getElementById("emptyMsg");

  if (objOfBook.length != 0) {
    table.innerHTML = html;
    clearBtn.style.display = "block";
    noDisplayMsg.innerHTML = "";
  } else {
    noDisplayMsg.innerHTML = `Nothing to display! Use "Add book" above to add books`;
  }

  let libraryForm = document.getElementById("libraryForm");
  libraryForm.reset();
}

//Show adding message

function addMessage(edited = false) {
  let message = document.getElementById("message");
  let navbar = document.getElementById("navbar");

  navbar.style.display = "none";

  message.innerHTML = !edited
    ? `<div class="alert alert-success alert-dismissible fade show" role="alert">
    <strong>Message:</strong> Your book has been successfully added.
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>`
    : `<div class="alert alert-success alert-dismissible fade show" role="alert">
    <strong>Message:</strong> Your book has been successfully edited.
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>`;

  setTimeout(() => {
    navbar.style.display = "flex";
    message.innerHTML = ``;
  }, 2000);
}

//Show error message
function errorMessage() {
  let message = document.getElementById("message");
  let navbar = document.getElementById("navbar");

  navbar.style.display = "none";
  message.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
    <strong>Error:</strong> To add book, add name of book.
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>`;

  setTimeout(() => {
    navbar.style.display = "flex";
    message.innerHTML = ``;
  }, 2000);
}

//Show alreadyAdded message
function alreadyAddedMessage() {
  let message = document.getElementById("message");
  let navbar = document.getElementById("navbar");

  navbar.style.display = "none";
  message.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
    <strong>Error:</strong> Book already present!
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
    </button>
    </div>`;

  // clear the library form
  let libraryForm = document.getElementById("libraryForm");
  libraryForm.reset();

  setTimeout(() => {
    navbar.style.display = "flex";
    message.innerHTML = ``;
  }, 2000);
}

//Show clear message
function clearMessage() {
  let message = document.getElementById("message");
  let navbar = document.getElementById("navbar");

  navbar.style.display = "none";

  message.innerHTML = `<div class="alert alert-info alert-dismissible fade show" role="alert">
    <strong>Message:</strong> Your book shelf is clear! To add more books refresh the browser.
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>`;

  setTimeout(() => {
    navbar.style.display = "flex";
    message.innerHTML = ``;
  }, 2000);
}

// Refresh the page
function refreshPage() {
  setTimeout(() => {
    window.location.reload();
  }, 2050);
}

// Update the display of books on deletion
function updateDisplayAfterDelete() {
  localStorage.removeItem("shelfOfBooks");
  localStorage.removeItem("getBookNumber");

  document.getElementById("books").innerHTML = "No. of Books: " + 0;
  let table = document.getElementById("tableBody");
  table.style.display = "none";
  clearBtn.style.display = "none";

  let noDisplayMsg = document.getElementById("emptyMsg");
  noDisplayMsg.innerHTML = `Nothing to display! Use "Add book" above to add books`;

  clearMessage();
  refreshPage();
}

// Clearning shelf (Deleting all books)
let clearBtn = document.getElementById("clear");

clearBtn.addEventListener("click", () => {
  updateDisplayAfterDelete();
});

// Remove specific book from shelf
function removeBook(index) {
  console.log("Delete book " + index);

  // Decrementing in total number of books
  let getBookNumber = localStorage.getItem("getBookNumber");
  getBookNumber = parseInt(getBookNumber);

  if (getBookNumber) {
    localStorage.setItem("getBookNumber", getBookNumber - 1);
    document.getElementById("books").innerHTML =
      "No. of Books: " + (getBookNumber - 1);
  } else {
    localStorage.setItem("getBookNumber", 0);
    document.getElementById("books").innerHTML = "No. of Books: 0" + 0;
  }

  // Removing book from shelf
  let notes = localStorage.getItem("shelfOfBooks");
  let objOfBook = [];

  if (notes == null) {
    objOfBook = [];
  } else {
    objOfBook = JSON.parse(notes);
  }

  if (getBookNumber == 1) {
    updateDisplayAfterDelete();
  } else {
    objOfBook.splice(index, 1);
    localStorage.setItem("shelfOfBooks", JSON.stringify(objOfBook));
    displayBooks();
  }
}

//Searching book by bookname, author and type
let searchNote = document.getElementById("searchText");
searchNote.addEventListener("input", function () {
  let search = searchNote.value.toLowerCase();

  let tableRows = document.getElementsByClassName("rows");

  Array.from(tableRows).forEach(function (element) {
    let bookName = element
      .getElementsByClassName("name")[0]
      .innerText.toLowerCase();
    let authorName = element
      .getElementsByClassName("author")[0]
      .innerText.toLowerCase();
    let type = element
      .getElementsByClassName("type")[0]
      .innerText.toLowerCase();
    let isbnNo = element.getElementsByClassName("isbn")[0].innerText;
    if (bookName.includes(search)) {
      element.style.display = "table-row";
    } else if (authorName.includes(search)) {
      element.style.display = "table-row";
    } else if (type.includes(search)) {
      element.style.display = "table-row";
    } else if (isbnNo.includes(search)) {
      element.style.display = "table-row";
    } else {
      element.style.display = "none";
    }
  });
});

// Update Number of books in Shelf section
function UpdateBook() {
  const bookNumber = parseInt(localStorage.getItem("getBookNumber"));
  const booksCount = bookNumber ? bookNumber + 1 : 1;
  const updateBooksCountSentence = `No. of books: ${booksCount ?? 1}`;

  localStorage.setItem("getBookNumber", booksCount);
  document.getElementById("books").innerHTML = updateBooksCountSentence;
}

//Show Number of books in Shelf section

const showNumberOfBooks = () => {
  const getBookNumber = parseInt(localStorage.getItem("getBookNumber"));
  document.getElementById("books").innerHTML = `No. of books: ${getBookNumber || 0
    }`;
};

// Filter books based on selected attributes from dropdown
let filterDropdown = document.getElementById("filter-books");
function filterBooks() {
  let books = JSON.parse(localStorage.getItem("shelfOfBooks"));
  // let numOfBooks = document.getElementById("books");
  let emptyMsg = document.getElementById("emptyMsg");
  // let filterBy = filterDropdown.value;
  let html = "";
  let index = 0;
  let filteredBooks;
  // if (filterBy === "all") {
  //   filteredBooks = books.filter((book) => {
  //     return (
  //       book.book.toLowerCase().includes(searchNote.value.toLowerCase()) ||
  //       book.bookauthor
  //         .toLowerCase()
  //         .includes(searchNote.value.toLowerCase()) ||
  //       book.bookType.toLowerCase().includes(searchNote.value.toLowerCase())
  //     );
  //   });
  // } else {
  //   filteredBooks = books.filter((book) => {
  //     return book[filterBy]
  //       .toLowerCase()
  //       .includes(searchNote.value.toLowerCase());
  //   });
  // }

  if (filteredBooks.length > 0) {
    filteredBooks.forEach((filteredBook) => {
      html += `
            <tr class="rows">
            <th scope="row">${index + 1}</th>
            <td class="name">${filteredBook.book}</td>
            <td class="author">${filteredBook.bookauthor}</td>
            <td class="type">${filteredBook.bookType}</td>
            <td class="icon"><i class="fa fa-times" aria-hidden="true" onclick="removeBook(${index})"></i></td>
            </tr>
        `;
      index++;
    });
    emptyMsg.innerHTML = "";
  } else {
    let bookAttr;
    switch (filterBy) {
      case "all":
        bookAttr = "";
        break;
      case "book":
        bookAttr = "name";
        break;
      case "bookauthor":
        bookAttr = "author";
        break;
      case "bookType":
        bookAttr = "type";
        break;
    }
    emptyMsg.innerHTML = `No book ${bookAttr !== "" ? "with" : ""
      } ${bookAttr} "${searchNote.value}" found`;
  }

  // ? Does the number of books depends on the search results?
  // numOfBooks.innerHTML = "No. of Books: " + filteredBooks.length;

  let table = document.getElementById("tableBody");
  table.innerHTML = html;
}
// filterDropdown.addEventListener("change", filterBooks);
searchNote.addEventListener("input", filterBooks);

showNumberOfBooks();

const radioButtons = document.querySelectorAll("input[type=radio]");
radioButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const newType = document.getElementById("newType");
    if (e.target.id === "other") {
      newType.hidden = false;
    } else {
      newType.hidden = true;
    }
  });
});

// dark mode
var icon = document.querySelector("#icon");
var head1 = document.getElementById("subHead1");
var head2 = document.getElementById("subHead2");
var tables = document.getElementsByTagName("table");

icon.onclick = () => {
  document.body.classList.toggle("dark-theme");
  if (document.body.classList == "dark-theme") {
    icon.innerHTML = `<i class='fas fa-sun'></i>`;
    head1.style.color = "white";
    head2.style.color = "white";
    for (let i = 0; i < tables.length; i++) {
      tables[i].style.color = "white";
    }
  }
  else {
    icon.innerHTML = `<i class='fas fa-moon'></i>`;
    head1.style.color = "black";
    head2.style.color = "black";
    for (let i = 0; i < tables.length; i++) {
      tables[i].style.color = "black";
    }
  }
  console.log(document.body.classList);
}
var acc = document.getElementsByClassName("accordion");
var i;
var len = acc.length;
for (i = 0; i < len; i++) {
  acc[i].addEventListener("click", function () {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.maxHeight) {
      panel.style.maxHeight = null;
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
}