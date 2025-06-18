const inputBox = document.getElementById("input-box");
const dateBox = document.getElementById("date-box");
const listContainer = document.getElementById("list-container");

let tasks = [];

function addTask() {
  const taskText = inputBox.value.trim();
  const taskDate = dateBox.value;

  if (!taskText || !taskDate) {
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

    const dateActions = document.createElement("div");
    dateActions.className = "date-actions";

    const checkSpan = document.createElement("span");
    checkSpan.className = "date-check";
    checkSpan.textContent = "✅";
    checkSpan.dataset.date = date;

    const deleteSpan = document.createElement("span");
    deleteSpan.className = "date-delete";
    deleteSpan.textContent = "🗑️";
    deleteSpan.dataset.date = date;

    dateActions.appendChild(checkSpan);
    dateActions.appendChild(deleteSpan);
    dateHeader.appendChild(dateActions);

    if (grouped[date].every(t => t.checked)) {
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

      const actions = document.createElement("div");
      actions.className = "task-actions";

      const editSpan = document.createElement("span");
      editSpan.className = "edit-task";
      editSpan.textContent = "✏️";

      const delSpan = document.createElement("span");
      delSpan.className = "delete-task";
      delSpan.textContent = "🗑️";

      actions.appendChild(editSpan);
      actions.appendChild(delSpan);

      li.appendChild(actions);
      listContainer.appendChild(li);
    });
  });
}

listContainer.addEventListener("click", e => {
  const li = e.target.closest("li");
  const index = li ? li.dataset.index : null;

  if (e.target.classList.contains("date-check")) {
    const date = e.target.dataset.date;
    const allChecked = tasks.filter(t => t.date === date).every(t => t.checked);
    tasks = tasks.map(t => t.date === date ? { ...t, checked: !allChecked } : t);
    saveData();
    showTasks();
    return;
  }

  if (e.target.classList.contains("date-delete")) {
    const date = e.target.dataset.date;
    const items = Array.from(listContainer.querySelectorAll("li"))
      .filter(l => l.querySelector("strong")?.textContent === formatDateDisplay(date) || 
                   (l.dataset.index && tasks[l.dataset.index].date === date));
    items.forEach(l => l.classList.add("hide"));
    setTimeout(() => {
      tasks = tasks.filter(t => t.date !== date);
      saveData();
      showTasks();
    }, 300);
    return;
  }

  if (e.target.classList.contains("edit-task")) {
    const textSpan = li.querySelector("span:first-child");
    const input = document.createElement("input");
    input.type = "text";
    input.value = textSpan.textContent;
    input.className = "edit-input";
    li.insertBefore(input, textSpan);
    textSpan.remove();
    input.focus();

    input.addEventListener("blur", () => finishEdit(input, index));
    input.addEventListener("keydown", ev => {
      if (ev.key === "Enter") finishEdit(input, index);
    });
    return;
  }

  if (e.target.classList.contains("delete-task")) {
    li.classList.add("hide");
    setTimeout(() => {
      tasks.splice(index, 1);
      saveData();
      showTasks();
    }, 300);
    return;
  }

  if (li && e.target.tagName === "LI") {
    tasks[index].checked = !tasks[index].checked;
    saveData();
    showTasks();
  }
});

function finishEdit(input, index) {
  const text = input.value.trim();
  if (text) {
    tasks[index].text = text;
    saveData();
    showTasks();
  } else {
    alert("Task cannot be empty.");
    input.focus();
  }
}

loadData();
