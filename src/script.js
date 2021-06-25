const myLibrary = document.querySelector('.my-library')
const writeYourselfBtn = document.querySelector('#write-yourself')
const loadFromFileBtn = document.querySelector('#load-from-file')
const uploadForm = document.querySelector('.upload-form')

let books = []

const writeYourselfBlock = `    
<section class="write-yourself-block">
    <p class="title">Название</p>
    <input class="title-input"> 
    <textarea class="text-input" placeholder="Текст..."></textarea>
    <button id="btn-upload" class="btn">Загрузить</button>
</section>`
const loadFromFileBlock = `
<section class="load-from-file-block">
    <p class="name">Название</p>
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
                title: response.title
            }
            books.push(book)
            saveBooks()
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
    books = JSON.parse(booksJson)
}

writeYourselfBtn.addEventListener('click', writeYourselfType)
loadFromFileBtn.addEventListener('click', loadFromFileType)
getBooks()







