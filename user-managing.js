/* UTILITY FUNCTION */

//Fonction that adds a leading zero to time and date values for formatting
lz = (n) => {
  return n < 10 ? "0"+n : n;
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

    // Load the tasks at the date with an ajax request
    $.ajax({ 
      type: 'GET',
      url: "user-data/user-data.json", 
      dataType: "json",
      success: (data) => { 
        this.tasks = Task.fromArray(data[this.id]);
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

    // Return the day object 
    return day;

  }

  // Displays the tasks from a template card.
  loadTasks = ($day_menu) => {

    // Displaying the day name and date
    $day_menu.html($day_menu_template.html());
    $day_menu.find(".__title-day-container").find(".__day").html(this.day_name);
    $day_menu.find(".__title-day-container").find(".__date-short").html(lz(this.date.getDate())+"/"+lz(this.date.getMonth()+1));

    // Get the templates and the box to display the tasks in
    let $template_task_card = $day_menu.find(".task-card.template");
    let $template_task_page = $day_menu.find(".task-page.template");
    let $tasks_box = $day_menu.find(".__tasks-box");

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
      
      // Loading the data of the task in the html elements
      task.loadData();
    }
    
    this.updateTimers();

  }

  // Updates the timers of every task card of the current day
  updateTimers = () => {

    // Checking if there are tasks for the day
    if(!this.tasks)
      return 0;

    // Looping through every task of the day
    for (let task of this.tasks) {

      // Calculating the time left until the task in ms
      let until_time = new Date(this.dateString.replace("[time]", task.start+":00")) - new Date();

      // Checking if the task has already passed
      if (until_time < 0) {
        task.$task_page.find(".__timer").html("Done !");
      } else {

        // Converting until_time in ms to a formatted time
        let hours = lz(Math.floor(until_time/3600000));
        let remainder = until_time%3600000;
        let minutes = lz(Math.trunc(remainder/60000));
        let seconds = lz(Math.trunc((remainder%60000)/1000));
        let formatted_time =`${hours}:${minutes}:${seconds}`;

        // Updating the timer in the task card with the formatted time
        task.$task_page.find(".__timer").html(formatted_time);
      }
    }
  }

  // Loads the tasks into the schedule
  loadSchedule = () => {

    // Check if there are tasks for the day
    if (!this.tasks)
      return 0;

    //Loops through every task of that day 
    let $tasks_spans_box = $(".__tasks-spans-box");
    for (let i=0; i<this.tasks.length; i++){
      $tasks_spans_box.append(this.tasks[i].createScheduleSpan(this.tasks.length, i));
    }
  }
  
}

class Task {
  constructor (json) {

    // Task information stored in the json file
    this.desc = json["desc"];
    this.start = json["start"];
    this.end = json["end"];
    this.title = json["title"];
    this.important = json["important"];
  }

  addCardAndPage = (card, page) => {

    // html elements linked to the task
    this.$task_card = card;
    this.$task_page = page;

    // Add event listeners

    // For the side bar
    this.$task_card.find(".__tab-main").on("click", () => {
      toggleSideBar(this);
    })

    // For the task page
    this.$task_card.find(".__more-button").on("click", () => {
      toggleTaskPage(this);
    })

  }

  loadData = () => {
    // Replacing the right information in the task card
    this.$task_card.find(".__title").html(this.title);
    this.$task_card.find(".__start-time").html(this.start);

    // Replacing the information in the task page
    this.$task_page.find(".__description").html(this.desc);
    this.$task_page.find(".__start-time").html(this.start);
    this.$task_page.find(".__end-time").html(this.end);
    this.$task_page.find(".__timer").html("N/A");

    // Displaying sticker if task is listed as important
    if (this.important == "false")
        this.$task_page.find(".__sticker-important").css("display", "none");


  }

  createScheduleSpan = (len, i) => {
    // Create the span
    let $span = $(document.createElement("span")).addClass("__task-span");

    // Calculating every position and dimensions and color
    let width = 100/len - 1*len;
    let left = width*i + 2*(i+1);
    let height = 100*(subDates(this.end, this.start, false)/24);
    let top = 100*(subDates(this.start, "0:0", false)/24);
    if (!top || !height) {
      height = 100
      $span.css("opacity", "0.6");
    }
    let color = `dark${task_colors[i%task_colors.length]}`;

    // Adding the properties to the element
    $span.css({"width": `${width}%`,"left": `${left}%`, "height": `${height}%`,"top": `${top}%`, 
                    "background": `linear-gradient(110deg, linen, ${color} 550%)`});

    // Adds event listeners to the schedule spans
    $span.on("click", () => {
      resetAllCards();
      toggleTaskPage(this);
    });
    
    return $span;
  }

  // Returns an array of tasks from an array of objects from a json file
  static fromArray (array) {
    if (!array)
      return [];
    let tasks = [];
    array.forEach( (element) => {
      tasks.push(new Task(element));
    });

    return tasks;
  }
}