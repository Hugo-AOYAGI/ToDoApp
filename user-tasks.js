
// Contains the information of the day
function Day(name, tasks, card) {
  this.day = name;
  this.month = month;
  this.week = week;
  this.year = year;
  this.tasks = tasks;
  this.card = card;
  this.id = day+month+year;
  
}


// This class contains all the information of a user task
function Task(template, title, description, start, duration, important) {
  this.template = template
  this.title = title;
  this.description = description;
  this.start = start;
  this.duration = duration;
  this.important = important;

  // Creates a new div with the information of the task from a template
  this.getDiv = () => {
    let temp = this.template.clone(true);
    temp.innerHTML = temp.innerHTML.replace("[DURATION]", this.duration);
    temp.innerHTML = temp.innerHTML.replace("[DESC]", this.description);
    temp.innerHTML = temp.innerHTML.replace("[START]", this.start);
    temp.innerHTML = temp.innerHTML.replace("[TITLE]", this.title);
    return temp
    

  }
}

// Manages the main card displayed on the screen
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
      new_tasks_div.appendChild(task.getDiv());
    }

  }

  this.addTask = () => {
    let template = document.querySelector(".template .task-card")
  }
}
