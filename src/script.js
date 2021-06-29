const myLibrary = document.querySelector('.my-library')
const writeYourselfBtn = document.querySelector('#write-yourself')
const loadFromFileBtn = document.querySelector('#load-from-file')
const uploadForm = document.querySelector('.upload-form')
const listBooks = document.querySelector('.wraper-list-books > .list-books')
const bookReader = document.querySelector('.book-reader')
const sideBlock = document.querySelector('.side')
const booksFavoriteBlock = document.querySelector('.favorite-books > .list-books')
const modalWindow = document.getElementById('myModal')

let books = []
let booksFavorite = []
let openedBook = null

const writeYourselfBlock = `    
<section class="write-yourself-block">
    <p class="title">Введите название книги</p>
    <input class="title-input"> 
    <textarea class="text-input" placeholder="Текст..."></textarea>
    <button id="btn-upload" class="btn">Загрузить</button>
</section>`
const loadFromFileBlock = `
<section class="load-from-file-block">
    <p class="name">Введите название книги</p>
    <input class="title-input">
    <label for="file-upload" class="custom-file-upload btn">
        Загрузить
    </label>
    <input id="file-upload" type="file" accept="text/plain"/>
</section>`


function writeYourselfType() {
    uploadForm.innerHTML = ''
    if (loadFromFileBtn.classList.contains('active'))  {
        loadFromFileBtn.classList.remove('active')
    }
    uploadForm.innerHTML = writeYourselfBlock
    const uploadBtn = document.querySelector('#btn-upload')
    const titleInput = document.querySelector('.title-input')
    const textInput = document.querySelector('.text-input')

    uploadBtn.onclick = () => {
        const titleInputValue = titleInput.value
        const textInputValue = textInput.value

        if (!titleInputValue || !textInputValue) {
            alert('Поля не должны быть пустыми!')
            return
        }

        let file = new File([textInputValue], titleInputValue, { type: 'text/plain' })
        uploadFile(file, titleInputValue)
        titleInput.value = ''
        textInput.value = ''
    }

    writeYourselfBtn.classList.add('active')
}

function loadFromFileType() {
    uploadForm.innerHTML = ''
    if (writeYourselfBtn.classList.contains('active'))  {
        writeYourselfBtn.classList.remove('active')
    }
    uploadForm.innerHTML = loadFromFileBlock

    const titleInput = document.querySelector('.title-input')
    const input = document.querySelector('#file-upload')
    input.onchange = () => {
        const titleInputValue = titleInput.value
        if (!titleInputValue) {
            alert('Поле не должны быть пустыми!')
            return
        }
        uploadFile(input.files.item(0), titleInputValue)
        titleInput.value = ''
    }

    loadFromFileBtn.classList.add('active')
}

function uploadFile(file, filename) {
    let formData = new FormData()
    formData.append('login','login')
    formData.append('file', file, filename)

    $.ajax({
        type: 'POST',
        url: 'https://apiinterns.osora.ru/',
        data: formData,
        processData: false,
        contentType: false,
        success: (response)=> {
            let book = {
                text: response.text,
                title: response.title,
                date: new Date(),
                finished: false
            }
            books.push(book)
            saveBooks()
            createListBooks()
            alert('Книга добавлена в библиотеку')
        }
    })
}

function saveBooks() {
    let booksJson = JSON.stringify(books)
    localStorage.setItem('books', booksJson)

    let booksFavoriteJson = JSON.stringify(booksFavorite)
    localStorage.setItem('books favorite', booksFavoriteJson)
}

function getBooks() {
    const booksJson = localStorage.getItem('books')
    books = booksJson ? JSON.parse(booksJson) : []

    const booksFavoriteJson = localStorage.getItem('books favorite')
    booksFavorite = booksFavoriteJson ? JSON.parse(booksFavoriteJson) : []
}

function craeteBookElement(book, draggable) {
    const div = document.createElement('div')
    div.className = 'book'
    if (book.finished) {
        div.classList.add('finished-book')
    }
    div.draggable = draggable
    div.innerHTML = `
    <span class="title-book">${book.title}</span>
    <div class="icons">
        <i class="fas fa-book-open"></i>
        <i class="fas fa-trash-alt"></i>
        <i class="fas fa-edit myBtn"></i>
        <i class="fas fa-check-square"></i>
    </div>
    `
    return div
}


function editBookHandler(book) {
    modalWindow.style.display = "block";

    const editTitleInput = document.querySelector('.edit-title-input')
    const editTextInput = document.querySelector('.edit-text-input')
    const editBtnUpload = document.getElementById('edit-btn-upload')

    editTitleInput.value = book.title
    editTextInput.value = book.text

    editBtnUpload.onclick = () => {
        const editTitleInputValue = editTitleInput.value
        const editTextInputValue = editTextInput.value

        if (!editTitleInputValue  || !editTextInputValue) {
            alert('Поля не должны быть пустыми!')
            return
        }

        const bookAll = books.find(b => b.text === book.text && b.title === book.title) 
        const bookFav = booksFavorite.find(b => b.text === book.text && b.title === book.title)
        if (bookAll) {
            bookAll.title = editTitleInputValue
            bookAll.text = editTextInputValue
            bookAll.date = new Date()
        } 
        if (bookFav) {
            bookFav.title = editTitleInputValue
            bookFav.text = editTextInputValue
            bookFav.date = new Date()
            createListBooksFavorite()
        }

        book.title = editTitleInputValue
        book.text = editTextInputValue
        book.date = new Date()
        saveBooks()
        modalWindow.style.display = "none";
        alert('Книга изменена')
        createListBooks()
    }
}

function closeModal() {
    modalWindow.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modalWindow) {
        closeModal()
    }
}

function deleteBookHandler(book, array) {
    const index = array.indexOf(book)
    array.splice(index, 1)
    if (openedBook === book) {
        bookReader.innerHTML = ''
    }
    saveBooks()
}

function initDragAndDrop() {
    booksFavoriteBlock.ondragenter = (event) => {
        event.preventDefault()
    }

    booksFavoriteBlock.ondragover = (event) => {
        event.preventDefault()
    }

    booksFavoriteBlock.ondrop = (event) => {
        let bookFavorite = event.dataTransfer.getData('book')
        if (!bookFavorite) {
            return
        }
        bookFavorite = JSON.parse(bookFavorite)
        booksFavorite.push(bookFavorite)
        sortBookList(booksFavorite)
        saveBooks()
        createListBooksFavorite()
    }
}

function addBookElementListeners(book, div, removeFromAll) {
    const openBookEl = div.querySelector('.fa-book-open')
    const deleteBookEl = div.querySelector('.fa-trash-alt')
    const editBookEl = div.querySelector('.myBtn')
    const checkBookEl = div.querySelector('.fa-check-square')
    const closeModalEl = document.getElementsByClassName("close")[0];
    const titleBookName = div.querySelector('.title-book')

    editBookEl.onclick = () => editBookHandler(book)
    closeModalEl.onclick = () => closeModal()
    deleteBookEl.onclick = () => {
        deleteBookHandler(book, booksFavorite)
        createListBooksFavorite()
        if (removeFromAll) {
            deleteBookHandler(book, books)
            createListBooks()
        }
    }
    openBookEl.onclick = () => openBook(book)
    titleBookName.onclick = () => openBook(book)
    checkBookEl.onclick = () => checkBook(book)
}

function createListBooks() {
    listBooks.innerHTML = ''
    books.forEach(book => {
        
        const div = craeteBookElement(book, true)
        listBooks.appendChild(div)
        addBookElementListeners(book, div, true)

        div.ondragstart = (event) => {
            if (booksFavorite.some(b => b.title === book.title && b.text == book.text)) {
                event.preventDefault()
                return
            }
            booksFavoriteBlock.style.border = '2px dashed black'
            event.dataTransfer.setData('book', JSON.stringify(book))
        }

        div.ondragend = () => booksFavoriteBlock.removeAttribute('style')
    })
}

function createListBooksFavorite() {
    booksFavoriteBlock.innerHTML = ''
    booksFavorite.forEach(book => {
        
        const div = craeteBookElement(book, false)
        booksFavoriteBlock.appendChild(div)
        addBookElementListeners(book, div, false)
    })
}

function openBook(book) {
    openedBook = book
    bookReader.innerHTML = `
        <p>${book.title}</p>
        <span>${book.text}</span>
    `
}

function checkBook(book) {
    const bookAll = books.find(b => b.text === book.text && b.title === book.title) 
    if (bookAll) {
        bookAll.finished = !bookAll.finished
    } 

    const bookFav = booksFavorite.find(b => b.text === book.text && b.title === book.title) 
    if (bookFav) {
        bookFav.finished = !bookFav.finished
        sortBookList(booksFavorite)
        createListBooksFavorite()
    }
    sortBookList(books)
    createListBooks()
    saveBooks()
}

function sortBookList(array) {
    array.sort((a,b) => new Date(b.date) - new Date(a.date)).sort((a, b) => b.finished - a.finished)
}

writeYourselfBtn.addEventListener('click', writeYourselfType)
loadFromFileBtn.addEventListener('click', loadFromFileType)
getBooks()
createListBooks()
createListBooksFavorite()
initDragAndDrop()










