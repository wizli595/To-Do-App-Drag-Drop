// app.js
document.querySelector(".add-task-btn").addEventListener("click", function () {
  const input = document.querySelector(".add-task-input");
  const taskText = input.value.trim();

  if (taskText) {
    const newTask = createTaskElement(taskText);
    document.querySelector("#todo").appendChild(newTask);
    input.value = "";
  }
});

function createTaskButtons(task) {
  const taskButtons = document.createElement("div");
  taskButtons.className = "task-buttons";
  task.appendChild(taskButtons);
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
  deleteBtn.addEventListener("click", function () {
    task.remove();
  });
  taskButtons.appendChild(deleteBtn);
  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.innerHTML = '<i class="fas fa-edit"></i>';
  editBtn.addEventListener("click", function () {
    const newText = prompt("Enter new task text", task.firstChild.textContent);
    if (newText) {
      task.textContent = newText;
      createTaskButtons(task);
    }
  });
  taskButtons.appendChild(editBtn);
}

let taskIdCounter = 0;

function createTaskElement(text) {
  const task = document.createElement("div");
  task.className = "task";
  task.textContent = text;
  // adding button to delete the task and updating
  createTaskButtons(task);
  task.setAttribute("draggable", "true");
  task.id = `task-${taskIdCounter++}`;
  addDragAndDropListeners(task);
  addTouchListeners(task);
  return task;
}

// drag and drop functions
function addDragAndDropListeners(task) {
  task.addEventListener("dragstart", dragStart);
  task.addEventListener("dragend", dragEnd);
}

document.querySelectorAll(".column").forEach((column) => {
  column.addEventListener("dragover", dragOver);
  column.addEventListener("drop", drop);
});

function dragStart(event) {
  event.dataTransfer.setData("text/plain", event.target.id);
  setTimeout(() => {
    event.target.style.display = "none";
  }, 0);
}

function dragEnd(event) {
  event.target.style.display = "flex";

}

function dragOver(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  const taskId = event.dataTransfer.getData("text/plain");
  const task = document.getElementById(taskId);
  console.log(event.target);
  // add the task to the new column
  event.target.appendChild(task);
}

// store the tasks in the local storage
function saveBoardState() {
  const columns = {};
  document.querySelectorAll(".column").forEach((column) => {
    const columnId = column.id;
    // without saving the delete button 

    const tasks = Array.from(column.querySelectorAll(".task")).map((task) => {
      const taskText = task.firstChild.textContent;
      return taskText;
    });


    // const tasks = Array.from(column.querySelectorAll(".task")).map((task) => task.textContent);
    columns[columnId] = tasks;
  });
  localStorage.setItem("taskBoard", JSON.stringify(columns));
}

function loadBoardState() {
  const savedState = JSON.parse(localStorage.getItem("taskBoard"));
  if (savedState) {
    Object.keys(savedState).forEach((columnId) => {
      const column = document.getElementById(columnId);
      savedState[columnId].forEach((taskText) => {
        const task = createTaskElement(taskText);
        column.appendChild(task);
      });
    });
  }
}

// function to clear if a task is on done column after 1 min
function clearDoneTasks() {
  const doneColumn = document.querySelector("#done");
  doneColumn.querySelectorAll(".task").forEach((task) => {
    setTimeout(() => {
      task.remove();
    }, 60000); // 1 minute
  });
}

// Run clearDoneTasks every minute
setInterval(clearDoneTasks, 60000);

// toggle dark mode
// Toggle dark mode
document.querySelector(".theme-toggle").addEventListener("click", function () {
  document.body.classList.toggle("dark");
  // chznge the icon
  const icon = this.querySelector("i");
  if (icon.classList.contains("fa-moon")) {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  }
  saveDarkModeState();
});

function saveDarkModeState() {
  const isDarkMode = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDarkMode);
}

function loadDarkModeState() {
  const isDarkMode = JSON.parse(localStorage.getItem("darkMode"));
  if (isDarkMode) {
    document.body.classList.add("dark");
  }
}

// for touch devices
function addTouchListeners(task) {
  task.addEventListener("touchstart", touchStart, {
    passive: true
  });
  task.addEventListener("touchmove", touchMove, {
    passive: false
  });
  task.addEventListener("touchend", touchEnd, {
    passive: true
  });
}

function touchStart(event) {
  // event.preventDefault();
  const touch = event.touches[0];
  this.style.position = "absolute";
  this.style.zIndex = 1000;
  this.style.left = `${touch.pageX - this.offsetWidth / 2}px`;
  this.style.top = `${touch.pageY - this.offsetHeight / 2}px`;
  document.body.appendChild(this);
  // Store the original column
  this.dataset.originalColumn = this.parentElement;
  console.log(this.dataset.originalColumn);
}

function touchMove(event) {
  event.preventDefault();
  const touch = event.touches[0];
  this.style.left = `${touch.pageX - this.offsetWidth / 2}px`;
  this.style.top = `${touch.pageY - this.offsetHeight / 2}px`;
}

function touchEnd(event) {
  // event.preventDefault();
  this.style.position = "";
  this.style.zIndex = "";
  const touch = event.changedTouches[0];
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
  if (dropTarget && dropTarget.classList.contains("column")) {
    dropTarget.appendChild(this);

  } else {
    // Return the task to its original position
    const originalColumn = document.getElementById(this.dataset.originalColumn);
    console.log(originalColumn);
    originalColumn.appendChild(this);
  }
}
document.querySelectorAll(".task").forEach(addTouchListeners);


window.addEventListener("load", () => {
  loadBoardState();
  loadDarkModeState();
});
window.addEventListener("beforeunload", saveBoardState);