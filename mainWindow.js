
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
  let current_day = new Date();;
  
  // Interval for updating timers
  let t1 = setInterval(() => {
    current_day.updateTimers();
  }, 1000);

  

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

  compareDates = (date1, date2) => {
    return date1 - date2 > 0 ? true : false;
  }

  compareDateIDs = (id1, id2) => {
    date1 = new Date(id1.substring(4,8), id1.substring(2,4), id1.substring(0,2));
    date2 = new Date(id2.substring(4,8), id2.substring(2,4), id2.substring(0,2));
    return date1 - date2 > 0 ? true : false;
  }

  getClosestTask = (day, json_data) => {
    for (task of json_data[day]) { 
      if (compareDates(getTaskDate(day, task['start']), new Date()) && !task['checked']) {
        if (closest_task == 0) {
          closest_task = task;
          closest_task_day = day;
        }else if (timeToInt(task["start"]) < timeToInt(closest_task["start"]) && !compareDateIDs(day, closest_task_day)) {
          closest_task = task;
          closest_task_day = day;
        }
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

  ignoreHours = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  areDatesEqual = (date1, date2) => {
    if (date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear())
      return true;
    else
      return false;
  }

  
  /* ===Managing the calendar=== */

  // Adding event listener to the toggle buttons
  let curr_month;
  let curr_year;

  let $calendar = $('.calendar');

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  loadMonth = () => {
    // Empty the days
    let d = new Date(curr_year, curr_month);
    $('.__day-box').remove();
    $calendar.find('.__month-title').html(months[d.getMonth()] + "<b>" + d.getFullYear() + "</b>");
    // Find number of days in the month
    n = new Date(curr_year, curr_month + 1, 0).getDate();
    // Put placeholders
    for (let j=0; j<days_in_order.indexOf(days[d.getDay()]); j++) {
      console.log('TesT');
      let $span = $(document.createElement("span")).addClass("__day-box hz-align-margins");
      $span.css('opacity', '0');
      $(".__" + days_in_order[j].toLowerCase() + "s").append($span);
    }
    for (let i=1; i<n + 1; i++) {
      let day = new Date(curr_year, curr_month, i);
      // Create the day span
      let $div = $(document.createElement("div")).addClass("__day-box hz-align-margins");
      $div.html(day.getDate());
      // Indicated what the selected day is
      if (areDatesEqual(day, current_day.date)) {
        $div.append($(document.createElement('span')).addClass('__curr-day-mark'));
      }

      if (areDatesEqual(day, new Date())) {
        $div.append($(document.createElement('span')).addClass('__today-mark'));
      }

      // Add event listener to span
      $div.on('click', (event) => {
        hideCalendar();
        let date = current_day.date;
        date = ignoreHours(date);
        day_counter -= Math.floor((date - day)/one_day);
        refreshCurrDay();
      });
      // Append span to container
      $(".__" + days[day.getDay()].toLowerCase() + "s").append($div);
    }
  }

  showCalendar = () => {
    // Changing header
    $(".__next-task").css('display', 'none');
    $(".header").find(".__mainTitle").html("Calendar");
    $(".header").find(".__quit-calendar-btn").css("C");
    // Showing calendar
    $calendar.css('display', 'unset');
    // Loading the days

    curr_month = current_day.date.getMonth();
    curr_year = current_day.date.getFullYear();
    
    loadMonth();
  }

  hideCalendar = () => {
    // Changing header
    $(".__next-task").css('display', 'flex');
    $(".header").find(".__mainTitle").html("Your Week");
    $(".header").find(".__mainTitle").html("Your Week");
    // Showing calendar
    $calendar.css('display', 'none');
  }

  $(".__calendar-btn").on("click", () => {
    showCalendar();
  });

  $(".__quit-calendar-btn").on("click", () => {
    hideCalendar();
  });

  $calendar.find(".__prevbutton").on('click', () => {
    curr_month--;
    loadMonth();
  });

  $calendar.find(".__nextbutton").on('click', () => {
    curr_month++;
    loadMonth();
  });

  // Adding event listeners to next and prev months

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
    manageTasks();
    current_day.getTasks();  
  });

  getDateId = (date) => {
    return `${lz(date.getDate())}${lz(date.getMonth() + 1)}${lz(date.getFullYear())}`;
  }

  repeat_setting = ['Daily', 'Weekly', 'Monthly', 'Yearly']
  repeat_settings_vals = [[0, 0, -1], [0, 0, -7], [0, -1, 0], [-1, 0, 0]];
  
  // Manage the task Repeat
  checkTaskRepeat = (day, json_data) => {
    let id;
    let days = parseInt(day.substring(0,2));
    let months = parseInt(day.substring(2,4)) - 1;
    let years = parseInt(day.substring(4,8));
    // Daily repeat
    for (setting of repeat_settings_vals) {
      id = getDateId(new Date(years + setting[0], months + setting[1], days + setting[2]));
      let day_before = json_data[id];
      if (day_before) {
        for (task of day_before) {
          if (task['repeat_setting'] == repeat_setting[repeat_settings_vals.indexOf(setting)]) {
            // Check if task has already been copied on that day
            let already_exists = false;
            if (json_data[day]) {
              for (day_to_check_task of json_data[day]) {
                if (day_to_check_task['repeat_id'] == task['repeat_id'])
                  already_exists = true;
              }
            }
            if (!already_exists)
              ipcRenderer.send('new-task-window-reply', {'action': 'new_task', 'day_id': day, 'task_info': task, 'repeat_id': task['repeat_id']});
          }
        }
      }
    }
  }

  notifsettings = {"10 minutes before": 600000, "30 minutes before": 1800000, "One hour before": 3600000, "One day before": 86400000};
  notifstrings = {"10 minutes before": ", In 10 minutes.", "30 minutes before": ", In half an hour.", "One hour before": ", In an hour.", "One day before": ", In 24 hours."}

  sendNotifications = (task, day) => {
    // Calculate the time until the task
    task_start_date = getTaskDate(day, task['start']);
    let until_time = task_start_date - new Date();
    // Check if the task has already sent a notif or if it does not require a notif
    if (!task["notif_sent"] && task['notify_setting'] != "None") {
      let notif_setting = notifsettings[task["notify_setting"]];
      let notif_string = notifstrings[task["notify_setting"]];
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
            body: desc + task['start'] + notif_string,
            icon: path.join(__dirname, "assets/notif-icon.png")
          });
        }, until_time - notif_setting);
      }
    }
  }

  let closest_task = 0;
  let closest_task_day = 0;

  manageTasks = () => {
    closest_task = 0;
    closest_task_day = 0;
    $.ajax({ 
      type: 'GET',
      url: "user-data/user-data.json", 
      dataType: "json",
      success: (json_data) => {
        // Check task repeat for the current day
        checkTaskRepeat(current_day.id, json_data);
        // Check task repeat for today and tommorow
        checkTaskRepeat(getDateId(new Date()), json_data);
        checkTaskRepeat(getDateId(new Date(Date.now() + one_day)), json_data);
        for (day of Object.keys(json_data)) {
          // Check task repeat for the first two days
          for (task of json_data[day]) {
            sendNotifications(task, day);
          }
          if (json_data[day].length != 0) {
            getClosestTask(day, json_data);
          }
        }
      },
      complete: () => {
        updateNextTask(closest_task, closest_task_day);
      }
    });
  }

  let t = setInterval(manageTasks, 60000);
  manageTasks();

  refreshCurrDay = () => {
    current_day = new Day(new Date(Date.now() + day_counter*one_day));
    manageTasks();
  }
  refreshCurrDay();

  /* ===Adding footer events listeners=== */

  $(".__next-day").on("click", () => {
    day_counter += 1;
    refreshCurrDay();
  });
  $(".__prev-day").on("click", () => {
    day_counter -= 1;
    refreshCurrDay();
  });

});