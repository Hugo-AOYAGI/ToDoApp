
// Importing of all the modules
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const fs = require("fs");

let seeCheckedTasks = false;
let seeImportantOnly = false;

// Wait for window to load
$(document).ready(() => { 

  //Fonction that adds a leading zero to time and date values for formatting
  lz = (n) => {
    return n < 10 ? "0"+n : n;
  } 

  /* ===Adding event listeners to the checkboxes=== */

  // Function to change the settings in the save.json
  changeSave = (setting, value) => {
    fs.readFile('user-data/save.json', 'utf8', (error, data) => {
      // Check if there was an error
      if (error)
        return 0;
      json_object = JSON.parse(data);
      json_object[setting] = value;
      json = JSON.stringify(json_object); 
      fs.writeFile('user-data/save.json', json, current_day.getTasks);
    });
  }

  loadSave = () => {
    fs.readFile('user-data/save.json', 'utf8', (error, data) => {
      if (error)
        return 0;
      json_object = JSON.parse(data);
      seeImportantOnly = json_object["important-tasks-only"];
      seeCheckedTasks = json_object["see-completed-tasks"];
      if (seeImportantOnly)
        $(".__important-tasks").find(".__check-box").addClass("checked");
      if (seeCheckedTasks)
        $(".__completed-tasks").find(".__check-box").addClass("checked");
    });
  }

  loadSave();

  $(".__important-tasks").on('click', (event) => {
    seeImportantOnly = seeImportantOnly ? false : true;
    // Checking the box visually
    if (seeImportantOnly) {
      $(".__important-tasks").find(".__check-box").addClass("checked");
    } else {
      $(".__important-tasks").find(".__check-box").removeClass("checked");
    }
    changeSave("important-tasks-only", seeImportantOnly);
  });

  $(".__completed-tasks").on('click', (event) => {
    seeCheckedTasks = seeCheckedTasks ? false : true;
    // Checking the box visually
    if (seeCheckedTasks) {
      $(".__completed-tasks").find(".__check-box").addClass("checked");
    } else {
      $(".__completed-tasks").find(".__check-box").removeClass("checked");
    }
    changeSave("see-completed-tasks", seeCheckedTasks);
  });

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

  // Sending event to main.js
  sendRemoveTaskMsg = (task) => {
    ipcRenderer.send("remove-task", task);
  }

  sendCheckTaskMsg = (task, val) => {
    ipcRenderer.send("check-task", {'task': task, 'val': val});
  }

  // Sends message to the main process to open the new task window
  sendNewTaskMsg = () => {
    ipcRenderer.send("create-new-task-window", 
                    {'action': 'new_task',
                     'day_id': current_day.id});
  }

  // Sends message to the main process to open the new task window
  sendEditTaskMsg = (task) => {
    ipcRenderer.send("create-new-task-window", 
                    {'action': 'edit_task',
                     'day_id': current_day.id,
                    'past_info': task.info});
  }

   // Adding event listener to the new-task button
  $(".__add-task-btn").on("click", sendNewTaskMsg);

  ipcRenderer.on("update-day", (event, data) => {
    current_day.getTasks();
  });

}); 
