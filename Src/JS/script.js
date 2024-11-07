// Seleção de elementos
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const editForm = document.querySelector("#edit-form");
const editInput = document.querySelector("#edit-input");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");
const searchInput = document.querySelector("#search-input");
const eraseBtn = document.querySelector("#erase-button");
const filterSelect = document.querySelector("#filter-select");

const startTimerBtn = document.querySelector("#start-timer");
const resetTimerBtn = document.querySelector("#reset-timer");
const timerDisplay = document.querySelector("#timer");
const minutesDisplay = document.querySelector("#minutes");
const secondsDisplay = document.querySelector("#seconds");

let oldInputValue;
let pomodoroInterval;

// Funções
// Função para criar e adicionar uma nova tarefa
const createTodoElement = (text, done = 0, saveToStorage = 1) => {
  const todo = document.createElement("div");
  todo.classList.add("todo");

  const todoTitle = document.createElement("h3");
  todoTitle.innerText = text;
  todo.appendChild(todoTitle);

  const doneBtn = document.createElement("button");
  doneBtn.classList.add("finish-todo");
  doneBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
  todo.appendChild(doneBtn);

  const editBtn = document.createElement("button");
  editBtn.classList.add("edit-todo");
  editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
  todo.appendChild(editBtn);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("remove-todo");
  deleteBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  todo.appendChild(deleteBtn);

  const pomodoroBtn = document.createElement("button");
  pomodoroBtn.classList.add("pomodoro-todo");
  pomodoroBtn.innerHTML = '<i class="fa-solid fa-hourglass-start"></i>';
  todo.appendChild(pomodoroBtn);

  if (done) {
    todo.classList.add("done");
  }

  if (saveToStorage) {
    saveTodoToLocalStorage({ text, done: 0 });
  }

  todoList.appendChild(todo);
  todoInput.value = "";
};

// Função para alternar a visibilidade dos formulários
const toggleForms = () => {
  editForm.classList.toggle("hide");
  todoForm.classList.toggle("hide");
  todoList.classList.toggle("hide");
};

// Função para atualizar uma tarefa existente
const updateTodoElement = (newText) => {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    let todoTitle = todo.querySelector("h3");
    if (todoTitle.innerText === oldInputValue) {
      todoTitle.innerText = newText;
      updateTodoInLocalStorage(oldInputValue, newText);
    }
  });
};

// Função para buscar e exibir tarefas correspondentes à busca
const searchTodos = (searchTerm) => {
  const todos = document.querySelectorAll(".todo");

  todos.forEach((todo) => {
    const todoTitle = todo.querySelector("h3").innerText.toLowerCase();
    todo.style.display = todoTitle.includes(searchTerm.toLowerCase()) ? "flex" : "none";
  });
};

// Função para filtrar tarefas com base na seleção
const filterTodos = (filterValue) => {
  const todos = document.querySelectorAll(".todo");

  switch (filterValue) {
    case "all":
      todos.forEach((todo) => (todo.style.display = "flex"));
      break;
    case "done":
      todos.forEach((todo) => {
        todo.style.display = todo.classList.contains("done") ? "flex" : "none";
      });
      break;
    case "todo":
      todos.forEach((todo) => {
        todo.style.display = !todo.classList.contains("done") ? "flex" : "none";
      });
      break;
    default:
      break;
  }
};

// Função para iniciar o temporizador Pomodoro
const startPomodoroTimer = () => {
  let minutes = 25;
  let seconds = 0;

  pomodoroInterval = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(pomodoroInterval);
        alert("Pomodoro completo!");
      } else {
        minutes--;
        seconds = 59;
      }
    } else {
      seconds--;
    }

    minutesDisplay.innerText = minutes.toString().padStart(2, '0');
    secondsDisplay.innerText = seconds.toString().padStart(2, '0');
  }, 1000);
};

// Função para resetar o temporizador Pomodoro
const resetPomodoroTimer = () => {
  clearInterval(pomodoroInterval);
  minutesDisplay.innerText = "25";
  secondsDisplay.innerText = "00";
};

// Eventos
// Evento para adicionar uma nova tarefa
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const inputValue = todoInput.value;
  if (inputValue) {
    createTodoElement(inputValue);
  }
});

// Evento para ações de clique nos botões de tarefa
document.addEventListener("click", (e) => {
  const targetEl = e.target;
  const parentEl = targetEl.closest("div");
  let todoTitle;

  if (parentEl && parentEl.querySelector("h3")) {
    todoTitle = parentEl.querySelector("h3").innerText || "";
  }

  if (targetEl.classList.contains("finish-todo")) {
    parentEl.classList.toggle("done");
    toggleTodoStatusInLocalStorage(todoTitle);
  }

  if (targetEl.classList.contains("remove-todo")) {
    parentEl.remove();
    removeTodoFromLocalStorage(todoTitle);
  }

  if (targetEl.classList.contains("edit-todo")) {
    toggleForms();
    editInput.value = todoTitle;
    oldInputValue = todoTitle;
  }

  if (targetEl.classList.contains("pomodoro-todo")) {
    startPomodoroTimer();
  }
});

// Evento para cancelar a edição da tarefa
cancelEditBtn.addEventListener("click", (e) => {
  e.preventDefault();
  toggleForms();
});

// Evento para editar uma tarefa existente
editForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const editInputValue = editInput.value;
  if (editInputValue) {
    updateTodoElement(editInputValue);
  }
  toggleForms();
});

// Evento para buscar tarefas enquanto digita
searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value;
  searchTodos(search);
});

// Evento para apagar o texto de busca
eraseBtn.addEventListener("click", (e) => {
  e.preventDefault();
  searchInput.value = "";
  searchTodos("");
});

// Evento para filtrar tarefas com base na seleção
filterSelect.addEventListener("change", (e) => {
  const filterValue = e.target.value;
  filterTodos(filterValue);
});

// Eventos do Pomodoro
startTimerBtn.addEventListener("click", startPomodoroTimer);
resetTimerBtn.addEventListener("click", resetPomodoroTimer);

// Local Storage
// Função para obter tarefas do LocalStorage
const getTodosFromLocalStorage = () => {
  return JSON.parse(localStorage.getItem("todos")) || [];
};

// Função para carregar tarefas do LocalStorage
const loadTodos = () => {
  const todos = getTodosFromLocalStorage();
  todos.forEach((todo) => {
    createTodoElement(todo.text, todo.done, 0);
  });
};

// Função para salvar uma nova tarefa no LocalStorage
const saveTodoToLocalStorage = (todo) => {
  const todos = getTodosFromLocalStorage();
  todos.push(todo);
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Função para remover uma tarefa do LocalStorage
const removeTodoFromLocalStorage = (todoText) => {
  const todos = getTodosFromLocalStorage();
  const filteredTodos = todos.filter((todo) => todo.text !== todoText);
  localStorage.setItem("todos", JSON.stringify(filteredTodos));
};

// Função para alternar o status de uma tarefa no LocalStorage
const toggleTodoStatusInLocalStorage = (todoText) => {
  const todos = getTodosFromLocalStorage();
  todos.forEach((todo) => {
    if (todo.text === todoText) {
      todo.done = !todo.done;
    }
  });
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Função para atualizar o texto de uma tarefa no LocalStorage
const updateTodoInLocalStorage = (oldText, newText) => {
  const todos = getTodosFromLocalStorage();
  todos.forEach((todo) => {
    if (todo.text === oldText) {
      todo.text = newText;
    }
  });
  localStorage.setItem("todos", JSON.stringify(todos));
};

// Carregar tarefas ao inicializar
loadTodos();
