
// Importing of all the modules
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const fs = require("fs");
const path = require("path");
const shell = electron.shell;

let seeCheckedTasks = false;
let seeImportantOnly = false;

// Wait for window to load
$(document).ready(() => { 

  //Fonction that adds a leading zero to time and date values for formatting
  lz = (n) => {
    return n < 10 ? "0"+n : n;
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

  // Handle links
  $(document).on('click', 'a', function(event){
    event.preventDefault();
    link = event.target.href;
    shell.openExternal(link);
  });

  /* ===Managing the next-task element=== */

  timeToInt = (string) => {
    string = string.split(":");
    return parseInt(string[0])*60 + parseInt(string[1]);
  }

  compareDates = (day_id1, day_id2) => {
    date1 = new Date(day_id1.substring(4,8), day_id1.substring(2,4) - 1, day_id1.substring(0,2));
    date2 = new Date(day_id2.substring(4,8), day_id2.substring(2,4) - 1, day_id2.substring(0,2));
    return date1 - date2;
  }

  getClosestTask = (day, json_data) => {
    if (json_data[day].length != 0 && compareDates(day, current_day.id) >= 0) {
      closest_task = json_data[day][0];
      closest_task_day = day;
      for (task of json_data[day]) {
        if (timeToInt(task["start"]) < timeToInt(closest_task["start"]))
          closest_task = task;
          closest_task_day = day;
      }
    }
  }

  getTaskDate = (day_id, task_start) => {
    return new Date(day_id.substring(4,8), day_id.substring(2,4) - 1, day_id.substring(0,2), 
                    task_start.substring(0,2), task_start.substring(3,5));
  }

  let next_task_div = $(".__next-task");

  updateNextTask = (closest_task, day_id) => {
     // Display the time left until the next task/event
     if (closest_task) {
       next_task_div.find(".__task-title").html(closest_task["title"]);
       let task_start_date = getTaskDate(day_id, closest_task["start"]);
       let until_time = task_start_date - new Date();
       let formatted_time = formatTime(until_time);
       next_task_div.find(".__timer").html(formatted_time);
     } else {
       next_task_div.find(".__task-title").html("No task yet ! ");
       next_task_div.find(".__timer").html("None");
     }
  }

  
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
    manageTasks();
  });

  /*==MANAGE THE NOTIFICATION OF THE TASKS*/
  // let notif = setInterval( () => {
  //   // Get the tasks through ajax
    
  // }, 60000);

  getNotificationSetting = (string) => {
    switch (string) {
      case "10 minutes before":
        return 600000;
      case "30 minutes before":
        return 1800000;
      case "One hour before":
        return 3600000;
      case "One day before":
        return 86400000;
    }
  }

  sendNotifications = (task, day) => {
    // Calculate the time until the task
    task_start_date = getTaskDate(day, task['start']);
    let until_time = task_start_date - new Date();
    // Check if the task has already sent a notif or if it does not require a notif
    if (!task["notif_sent"] && task['notify_setting'] != "None") {
      let notif_setting = getNotificationSetting(task["notify_setting"]);
      // Get the notification setting of the task
      // Not sending if it's already been 10 minutes since the task started
      if ( until_time < notif_setting + 60000 && until_time > -600000) {
        // Format the description of the task
        desc = task['desc'] == "None" ? "" : task["desc"] + "\n";
        if (task['desc'].length > 30) {
          desc = desc.substring(0, 30) + "...\n";
        } 
        // Modify the json to indicate that the notif was already sent
        ipcRenderer.send("notification-sent", {'task': task, 'id': day});
        // Set a timeout for a precise notification
        setTimeout( () => {
          // Create the notification
          let notification = new Notification(task["title"], {
            body: desc + task['start'],
            icon: path.join(__dirname, "assets/notif-icon.png")
          });
        }, until_time - notif_setting);
      }
    }
  }

  let closest_task = 0;
  let closest_task_day = 0;

  manageTasks = () => {
    console.log("Managing Tasks...");
    closest_task = 0;
    closest_task_day = 0;
    $.ajax({ 
      type: 'GET',
      url: "user-data/user-data.json", 
      dataType: "json",
      success: (json_data) => { 
        for (day of Object.keys(json_data)) {
          for (task of json_data[day]) {
            sendNotifications(task, day);
          }
          getClosestTask(day, json_data);
        }
      },
      complete: () => {
        updateNextTask(closest_task, closest_task_day);
      }
    });
  }

  let t = setInterval(manageTasks, 60000);
  manageTasks();

});