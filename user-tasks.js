

function Day(name, tasks, card) {
  this.name = name;
  this.tasks = tasks;
  this.card = card;
}



function Task(template, title, description, start, duration, important) {
  this.template = template
  this.title = title;
  this.description = description;
  this.start = start;
  this.duration = duration;
  this.important = important;
}

function Card(template, day) {
  this.template = template;
  this.html_card = template.cloneNode(true);
  this.day = day;

  this.reload = () => {
    // Reloads all the values and tasks of the card
    let temp = this.template;
    temp.innerHTML = temp.innerHTML.replace("[DAY]", this.day.name);
    temp.innerHTML = temp.innerHTML.replace("[TASKS]", this.day.tasks.length);
    let tasks_div = document.getElementById(this.day.name + "-tasks-div");
    temp.removeChild(tasks_div);
    let new_tasks_div = document.createElement("div");
    new_tasks_div.setAttribute("id", this.day.name + "-tasks-div");
    for(task of this.day.tasks) {
      new_tasks_div.append(task.getDiv());
    }

  }

  this.addTask = () => {

  }
}
