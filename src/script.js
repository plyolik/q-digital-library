const myLibrary = document.querySelector('.my-library')
const writeYourselfBtn = document.querySelector('#write-yourself')
const loadFromFileBtn = document.querySelector('#load-from-file')
const uploadForm = document.querySelector('.upload-form')
const listBooks = document.querySelector('.list-books')
let bookReader = document.querySelector('.book-reader')


let books = []
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
}

function getBooks() {
    const booksJson = localStorage.getItem('books')
    books = booksJson ? JSON.parse(booksJson) : []
}

function createListBooks() {
    listBooks.innerHTML = ''
    books.forEach(book => {
        const div = document.createElement('div')
        div.className = 'book'
        if (book.finished) {
            div.classList.add('finished-book')
        }
        div.innerHTML = `
        <span class="title-book">${book.title}</span>
        <div class="icons">
            <i class="fas fa-book-open"></i>
            <i class="fas fa-trash-alt"></i>
            <i class="fas fa-edit myBtn"></i>
            <i class="fas fa-check-square"></i>
        </div>
        `
        listBooks.appendChild(div)

        const openBookEl = div.querySelector('.fa-book-open')
        const deleteBookEl = div.querySelector('.fa-trash-alt')
        const editBookEl = div.querySelector('.myBtn')
        const checkBookEl = div.querySelector('.fa-check-square')
        const modalWindow = document.getElementById('myModal')
        const closeModal = document.getElementsByClassName("close")[0];
        const titleBookName = div.querySelector('.title-book')


        editBookEl.addEventListener('click', () => {
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
    
                book.title = editTitleInputValue
                book.text = editTextInputValue
                book.date = new Date()
                saveBooks()
                modalWindow.style.display = "none";
                alert('Книга изменена')
                createListBooks()
            }
        })
        

        closeModal.onclick = function() {
            modalWindow.style.display = "none";
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modalWindow.style.display = "none";
            }
        }

        deleteBookEl.addEventListener('click', ()=> {
            const index = books.indexOf(book)
            books.splice(index, 1)
            listBooks.removeChild(div)
            if (openedBook === book) {
                bookReader.innerHTML = ''
            }
            saveBooks()
        })

        openBookEl.addEventListener('click', () => openBook(book))
        titleBookName.addEventListener('click', () => openBook(book))
        checkBookEl.addEventListener('click', ()=> checkBook(div, book))

    })
}

function openBook(book) {
    openedBook = book
    bookReader.innerHTML = `
        <p>${book.title}</p>
        <span>${book.text}</span>
    `
}

function checkBook(div, book) {
    book.finished = !book.finished
    div.classList.toggle('finished-book')
    sortBookList()
    createListBooks()
    saveBooks()
}

function sortBookList() {
    books.sort((a,b) => new Date(b.date) - new Date(a.date)).sort((a, b) => b.finished - a.finished)
}

writeYourselfBtn.addEventListener('click', writeYourselfType)
loadFromFileBtn.addEventListener('click', loadFromFileType)
getBooks()
createListBooks()











