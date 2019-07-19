/* UTILITY FUNCTION */

//Fonction that adds a leading zero to time and date values for formatting
lz = (n) => {
  return n < 10 ? "0"+n : n;
}

// Formats a time in ms to a hours:minutes
formatTime = (n) => {
  // Converting until_time in ms to a formatted time
  let hours = lz(Math.floor(n/3600000));
  let remainder = n%3600000;
  let minutes = lz(Math.trunc(remainder/60000));
  return `${hours}:${minutes}`;
}

// Function that adds dates together with the option to return a formatted string
addDates = (a, b, asStr = true) => {
  let date1 = a.split(":"), date2 = b.split(":");
  let hours = parseInt(date1[0]) + parseInt(date2[0]);
  let minutes = parseInt(date1[1]) + parseInt(date2[1]);
  minutes = minutes%60;
  hours += Math.trunc(minutes/60);
  return asStr ? `${lz(hours)}:${lz(minutes)}` : hours + minutes/60;
}

// Function that substracts dates together with the option to return a formatted string
subDates = (a, b, asStr = true) => {
  let date1 = a.split(":"), date2 = b.split(":");
  let hours = parseInt(date1[0]) - parseInt(date2[0]);
  let minutes = parseInt(date1[1]) - parseInt(date2[1]);
  minutes = minutes%60;
  hours += Math.trunc(minutes/60);
  return asStr ? `${lz(hours)}:${lz(minutes)}` : hours + minutes/60;
}

/* CONSTANTS */

const one_day = 86400000;

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const task_colors = ["blue", "cyan", "goldenrod", "green", "magenta", "orchid", "red", "slategrey", "turquoise"];
const $day_menu_template = $(".day-menu").clone();

// Contains the information of the day
class Day {

  // Creates a day from an existing day, loading its saved tasks
  constructor (date) {
    // Defining the object variables
    this.$task_cards = [];
    this.$task_pages = [];
    this.date = date;
    this.dateString = date.toString().replace(
        `${lz(date.getHours())}:${lz(date.getMinutes())}:${lz(date.getSeconds())}`,
         "[time]");

    // Get ID of the day from the argument's date
    this.id = `${lz(date.getDate())}${lz(date.getMonth()+1)}${lz(date.getFullYear())}`

    // Get the information to display in the day-card
    this.day_name = days[date.getDay()];

    this.getTasks();

  }

  getTasks = () => {
    // Load the tasks at the date with an ajax request
    $.ajax({ 
      type: 'GET',
      url: "user-data/user-data.json", 
      dataType: "json",
      success: (json_data) => { 
        this.tasks = Task.fromArray(this, json_data[this.id]);

      },
      error: () => {
        alert("Your tasks could not be retrieved!");
      },
      complete: () => {
        // Load tasks and schedule once the request is completed
        this.loadTasks($(".day-menu"));
        this.loadSchedule();
      }
    });
  }

  // Displays the tasks from a template card.
  loadTasks = () => {

    // Displaying the day name and date
    $(".__day-name").html(this.day_name);
    $(".__day-date").html(lz(this.date.getDate())+"/"+lz(this.date.getMonth()+1));

    // Get the templates and the box to display the tasks in
    let $tasks_box = $(".tasks-box");
    let $template_task_card = $tasks_box.find(".task-card.template");
    let $template_task_page = $tasks_box.find(".task-page.template");
    

    // Empty the tasks in case it is full
    $tasks_box.children().not(".template").each(function () {
      $(this).remove();
    });

    // Checks if there are tasks on that day
    if (!this.tasks){
      return 0;
    }

    // Looping through every task of the day
    for(let task of this.tasks) {

      // Cloning the templates
      let $clone_task_card = $template_task_card.clone().removeClass("template");
      let $clone_task_page = $template_task_page.clone().removeClass("template");

      // Appending the clones to the html page
      $tasks_box.append($clone_task_card);
      $tasks_box.append($clone_task_page);
    
      // Adding the task card and page to the task object
      task.addCardAndPage($clone_task_card, $clone_task_page);
      
      // Loading the info of the task in the html elements
      task.loadInfo();
    }

  }

  // Updates the timers of every task card of the current day
  updateTimers = () => {

    // Checking if there are tasks for the day
    if(!this.tasks)
      return 0;

    // Looping through every task of the day
    for (let task of this.tasks) {
      
      if (task.start == "N/A"){
        task.$task_page.find(".__timer").html("N/A");
        return 0;
      }
      // Calculating the time left until the task in ms
      let until_time = new Date(this.dateString.replace("[time]", task.info.start+":00")) - new Date();
      // Checking if the task has already passed
      if (until_time < 0) {
        task.$task_page.find(".__timer").html("Done !");
      } else {
        // Updating the timer in the task card with the formatted time
        task.$task_page.find(".__timer").html(formatTime(until_time));
      }
    }
  }

  // Loads the tasks into the schedule
  loadSchedule = () => {

    // Check if there are tasks for the day
    if (!this.tasks)
      return 0;

    let $tasks_spans_box = $(".__tasks-spans-box");
    // Empty the schedule in case it is full
    $tasks_spans_box.children().each(function () {
      $(this).remove();
    });

    //Loops through every task of that day 
    for (let i=0; i<this.tasks.length; i++){
      $tasks_spans_box.append(this.tasks[i].createScheduleSpan());
    }
  }
  
}

class Task {
  constructor (day, json) {

    this.day_id = day.id;
    this.day = day;
    this.info = json;
  }

  addCardAndPage = (card, page) => {

    // html elements linked to the task
    this.$task_card = card;
    this.$task_page = page;

    // Add event listeners

    // For the side bar

    // For the task page
    this.$task_card.find(".__more-button").on("click", () => {
      toggleTaskPage(this);
    });

    // For the remove, check and edit button
    this.$task_card.find(".__remove-btn").on("click", () => {
      sendRemoveTaskMsg(this);
    });

    this.$task_page.find(".__edit-btn").on("click", () => {
      sendEditTaskMsg(this);
    });

    this.$task_card.find(".__complete-btn").on("click", () => {
      sendCheckTaskMsg(this, true);
    });

    this.$task_card.find(".__uncheck-btn").on("click", () => {
      sendCheckTaskMsg(this, false);
    });

  }

  loadInfo = () => {
    // Check if the task should be displayed
    if ( (this.info.checked && !seeCheckedTasks) || (!this.info.important && seeImportantOnly) ) {
      // Delete the task card and page
      this.$task_card.css("display", "none");
      this.$task_page.css("display", "none");
      return 0;
    }

    // Replacing the right information in the task card
    this.$task_card.find(".__title").html(this.info.title);
    this.$task_card.find(".__start-time").html(this.info.start);

    // Replacing the information in the task page
    this.$task_page.find(".__description").html(this.info.desc);
    this.$task_page.find(".__start-time").html(this.info.start);
    this.$task_page.find(".__end-time").html(this.info.end);
    this.$task_page.find(".__timer").html("N/A");
    this.$task_page.find(".__repeat").html(this.info.repeat_setting);
    this.$task_page.find(".__notification").html(this.info.notify_setting);

    // Adding checked styling if the task is checked
    if (this.info.checked) {
      this.$task_card.find(".__main").addClass("completed");
      // Removing the check button
      this.$task_card.find(".__complete-btn").remove();
      // Showing the checked label
      this.$task_card.find(".__uncheck-btn").css("display", "unset");
    } 

    // Displaying sticker if task is listed as important
    if (this.info.important == false) {
      this.$task_page.find(".__sticker-important").css("display", "none");
      this.$task_card.find(".__important-mark").css("opacity", "0");
    }


  }

  createScheduleSpan = () => {
    // Check if the task should be displayed
    if ( (this.info.checked && !seeCheckedTasks) || (!this.info.important && seeImportantOnly) )
      return "";
    // Create the span
    let $span = $(document.createElement("span")).addClass("__task-span");

    if (this.info.checked)
      $span.addClass("completed");

    // Calculating every position and dimensions and color
    let height = 100*(subDates(this.info.end, this.info.start, false)/24);
    let top = 100*(subDates(this.info.start, "0:0", false)/24);

    if (!height || !top)
      $span.css("display", "none");

    // Adding the properties to the element
    $span.css({"height": `${height}%`,"top": `${top}%`});

    // Adds event listeners to the schedule spans
    $span.on("click", () => {
      resetAllCards();
      toggleTaskPage(this);
    });
    
    return $span;
  }

  // Returns an array of tasks from an array of objects from a json file
  static fromArray (day, array) {
    if (!array)
      return [];
    let tasks = [];
    array.forEach( (element) => {
      tasks.push(new Task(day, element));
    });

    return tasks;
  }
}