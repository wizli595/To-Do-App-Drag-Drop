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
function checkAuthentication() {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    alert("You are not logged in. Redirecting to login page...");
    window.location.href = "./login.html";
  }
}
function displayUserEmail() {
  const currentUser = localStorage.getItem("currentUser");

  const userEmailElement = document.querySelector(".user-email");
  if (currentUser) {
    userEmailElement.textContent = currentUser;
  } else {
    userEmailElement.textContent = "Guest";
  }
}
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  alert("You have been logged out.");
  window.location.href = "./login.html";
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
    passive: true,
  });
  task.addEventListener("touchmove", touchMove, {
    passive: false,
  });
  task.addEventListener("touchend", touchEnd, {
    passive: true,
  });
}

function touchStart(event) {
  // event.preventDefault();
  const touch = event.touches[0];

  // Store the original column BEFORE appending to the body
  if (!this.dataset.originalColumn) {
    const parentColumn = this.closest(".column"); // Find the closest parent column
    console.log(parentColumn);
    if (parentColumn && parentColumn.id) {
      this.dataset.originalColumn = parentColumn.id;
      console.log(`Original column saved: ${this.dataset.originalColumn}`);
    } else {
      console.warn("Could not find parent column during touchStart");
    }
  }

  // Move the task to the body for free movement
  this.style.position = "absolute";
  this.style.zIndex = 1000;
  this.style.left = `${touch.pageX - this.offsetWidth / 2}px`;
  this.style.top = `${touch.pageY - this.offsetHeight / 2}px`;
  document.body.appendChild(this);
}

function touchMove(event) {
  event.preventDefault();
  const touch = event.touches[0];
  this.style.left = `${touch.pageX - this.offsetWidth / 2}px`;
  this.style.top = `${touch.pageY - this.offsetHeight / 2}px`;
  // this.style.transform = `translate(${touch.pageX - offsetX}px, ${
  //   touch.pageY - offsetY
  // }px)`;
}

function touchEnd(event) {
  this.style.position = "";
  this.style.zIndex = "";

  const touch = event.changedTouches[0];
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

  // Detect valid drop target
  const validDropTarget = dropTarget?.closest(".column");

  if (validDropTarget && validDropTarget.classList.contains("column")) {
    validDropTarget.appendChild(this);
    console.log(`Task moved to column: ${validDropTarget.id}`);

    // Update the original column to the new one
    this.dataset.originalColumn = validDropTarget.id;
  } else {
    // Return to original column if drop target is invalid
    const originalColumnId = this.dataset.originalColumn;
    if (originalColumnId) {
      const originalColumn = document.getElementById(originalColumnId);
      if (originalColumn) {
        originalColumn.appendChild(this);
        console.log(`Task returned to original column: ${originalColumnId}`);
      } else {
        console.error(
          `Original column with ID "${originalColumnId}" not found`
        );
      }
    } else {
      console.error("Original column ID is missing in dataset");
    }
  }
}

document.querySelectorAll(".task").forEach(addTouchListeners);

window.addEventListener("load", () => {
  loadBoardState();
  loadDarkModeState();
  checkAuthentication();
  displayUserEmail();
});
window.addEventListener("beforeunload", saveBoardState);
