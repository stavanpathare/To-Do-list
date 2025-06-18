const inputBox = document.getElementById("input-box");
const dateBox = document.getElementById("date-box");
const listContainer = document.getElementById("list-container");

let tasks = [];

function addTask() {
  const taskText = inputBox.value.trim();
  const taskDate = dateBox.value;

  if (taskText === '' || taskDate === '') {
    alert("Please enter a task and select a date.");
    return;
  }

  tasks.push({
    text: taskText,
    date: taskDate,
    checked: false
  });

  inputBox.value = '';
  saveData();
  showTasks();
}

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadData() {
  const data = localStorage.getItem("tasks");
  if (data) {
    tasks = JSON.parse(data);
  }
  showTasks();
}

function formatDateDisplay(date) {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
}

function showTasks() {
  listContainer.innerHTML = '';

  const grouped = {};
  tasks.forEach((task, index) => {
    if (!grouped[task.date]) grouped[task.date] = [];
    grouped[task.date].push({ ...task, index });
  });

  Object.keys(grouped).sort().forEach(date => {
    const formattedDate = formatDateDisplay(date);

    const dateHeader = document.createElement("li");
    dateHeader.innerHTML = `<strong>${formattedDate}</strong>`;
    dateHeader.style.listStyle = "none";

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("date-actions");

    const checkSpan = document.createElement("span");
    checkSpan.innerHTML = "✅";
    checkSpan.classList.add("date-check");
    checkSpan.dataset.date = date;

    const deleteSpan = document.createElement("span");
    deleteSpan.innerHTML = "🗑️";
    deleteSpan.classList.add("date-delete");
    deleteSpan.dataset.date = date;

    actionsDiv.appendChild(checkSpan);
    actionsDiv.appendChild(deleteSpan);
    dateHeader.appendChild(actionsDiv);

    // Apply checked class to date header if all tasks are checked
    const allChecked = grouped[date].every(t => t.checked);
    if (allChecked) {
      dateHeader.classList.add("checked");
    }

    listContainer.appendChild(dateHeader);

    grouped[date].forEach(task => {
      const li = document.createElement("li");
      li.dataset.index = task.index;
      if (task.checked) li.classList.add("checked");

      const textSpan = document.createElement("span");
      textSpan.textContent = task.text;
      li.appendChild(textSpan);

      const editSpan = document.createElement("span");
      editSpan.innerHTML = "✏️";
      editSpan.classList.add("edit-task");
      li.appendChild(editSpan);

      const delSpan = document.createElement("span");
      delSpan.innerHTML = "🗑️";
      li.appendChild(delSpan);

      listContainer.appendChild(li);
    });
  });
}

listContainer.addEventListener("click", function(e) {
  const li = e.target.closest("li");
  const index = li ? li.dataset.index : null;

  if (e.target.classList.contains("date-check")) {
    const dateToCheck = e.target.dataset.date;
    const allChecked = tasks
      .filter(task => task.date === dateToCheck)
      .every(task => task.checked);
    tasks = tasks.map(task => {
      if (task.date === dateToCheck) {
        return { ...task, checked: !allChecked };
      }
      return task;
    });
    saveData();
    showTasks();
    return;
  }

  if (e.target.classList.contains("date-delete")) {
    const dateToDelete = e.target.dataset.date;
    tasks = tasks.filter(task => task.date !== dateToDelete);
    saveData();
    showTasks();
    return;
  }

  if (e.target.classList.contains("edit-task")) {
    const textSpan = li.querySelector("span:first-child");
    const currentText = textSpan.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.classList.add("edit-input");
    li.insertBefore(input, textSpan);
    textSpan.remove();
    input.focus();

    input.addEventListener("blur", () => saveEdit(input, index, li));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        saveEdit(input, index, li);
      }
    });
    return;
  }

  if (e.target.innerHTML === "🗑️" && li) {
    tasks.splice(index, 1);
    saveData();
    showTasks();
    return;
  }

  if (li && e.target.tagName === "LI") {
    tasks[index].checked = !tasks[index].checked;
    saveData();
    showTasks();
  }
});

function saveEdit(input, index, li) {
  const newText = input.value.trim();
  if (newText) {
    tasks[index].text = newText;
    saveData();
    showTasks();
  } else {
    alert("Task cannot be empty.");
    input.focus();
  }
}

loadData();
