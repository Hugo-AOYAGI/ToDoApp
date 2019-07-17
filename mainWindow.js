
// Importing of all the modules
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

let newTaskWindowOpen = false;

// Wait for window to load
$(document).ready(() => { 

  const $body = $("body");

  //Fonction that adds a leading zero to time and date values for formatting
  lz = (n) => {
    return n < 10 ? "0"+n : n;
  } 

  /* ===Managing the next-task element=== */

  // Display the time left until the next task/event


  // Add event listener to the next-task element thats redirects to the corresponding task card

  /* ===Managing the task card=== */

  // Add event listeners to go to task card with the more-info button

  // Displays the task card and modify the task's styling
  displayPage = (task) => {
    // Getting the element that caused the click event
    let $task_card = task.$task_card;
    let $task_page = task.$task_page;
    // Modifies the styling of the task
    $task_card.addClass("small-task-card");
    $task_page.css("display", "unset");
    for(task of current_day.tasks){
      if(!task.$task_card.is($task_card))
        task.$task_card.css("display", "none");
    }
  }

  // Resets the task and task card styling back to default
  hidePage = (task) => {
    // Getting the element that caused the click event
    let $task_card = task.$task_card;
    let $task_page = task.$task_page;
    // Modifies the styling of the task
    $task_card.removeClass("small-task-card");
    $task_page.css("display", "none");
    for(task of current_day.tasks) {
      if (!task.$task_card.is(".template"))
        task.$task_card.css("display", "flex");
    }
  }

   // Displays the taskcard
  toggleTaskPage = (task) => {
    // Checking if the sidebar of the tab is already toggled
    if (task.$task_card.find(".__start-time").css("opacity") == "1") {
      displayPage(task);
    } else {
      hidePage(task);
    }
  }

  // Hides all current task cards reseting the styling to default
  resetAllCards = () => {
    for (task of current_day.tasks) {
      hidePage(task);
    }
  }

  // Remove option for the task

  // Sending event to main.js
  removeTask = (task) => {
    resetAllCards();
    ipcRenderer.send("remove-task", task);
  }

  // Edit option for the task

  /* LOAD THE FIRST DAY */
  let day_counter = 0;
  let current_day;
  refreshCurrDay = () => {
    current_day = new Day(new Date(Date.now() + day_counter*one_day));
  }
  refreshCurrDay();
  
  // Interval for updating timers
  let t1 = setInterval(() => {
    current_day.updateTimers();
  }, 1000);



  /* ===Adding footer events listeners=== */

  $(".__next-day").on("click", () => {
    day_counter += 1;
    refreshCurrDay();
  });
  $(".__prev-day").on("click", () => {
    day_counter -= 1;
    refreshCurrDay();
  });
  $(".__next-week").on("click", () => {
    day_counter += 7 - current_day.date.getDay() + 1;
    refreshCurrDay();
  });
  $(".__prev-week").on("click", () => {
    day_counter -= 7 + current_day.date.getDay() - 1;
    refreshCurrDay();
  });

  // Adding event listener to the new-task button

  newTask = () => {
    ipcRenderer.send("create-new-task-window", ["Add a new task", "new_task", current_day.id]);
    newTaskWindowOpen = true;
  }

  editTask = (task) => {
    ipcRenderer.send("create-new-task-window", ["Edit the Task", "edit", current_day.id, task]);
    newTaskWindowOpen = true;
  }

  $(".__add-task-btn").on("click", newTask);

  ipcRenderer.on("create-new-task", (event, data) => {
    createNewTask(data);
  });

  ipcRenderer.on("edit-task", (event, data) => {
    createNewTask(data[0]);
    // Deleting the html elements of the previous task
    data[1].day.tasks = data[1].day.tasks.filter(item => item !== this);
    refreshCurrDay();
    current_day.loadSchedule();
  });

  createNewTask = (data) => {
    let task = new Task(current_day, data);
    // Cloning the templates
    let $clone_task_card = $(".task-card.template").clone().removeClass("template");
    let $clone_task_page = $(".task-page.template").clone().removeClass("template");

    // Appending the clones to the html page
    $(".tasks-box").append($clone_task_card);
    $(".tasks-box").append($clone_task_page);

    // Loading the task data
    task.addCardAndPage($clone_task_card, $clone_task_page);
    task.loadData();
    $(".__tasks-spans-box").append(task.createScheduleSpan());
    current_day.tasks.push(task);
  }

}); 
