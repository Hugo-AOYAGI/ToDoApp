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
        this.tasks = data[this.id];
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

      // Replacing the right information in the task
      $clone_task_card.find(".__title").html(task["title"]);
      $clone_task_card.find(".__start-time").html(task["start"]);

      $tasks_box.append($clone_task_card);

      // Keeping reference of the task.
      this.$task_cards.push($clone_task_card);

      // Replacing the information in the task card
      $clone_task_page.find(".__description").html(task["desc"]);
      $clone_task_page.find(".__start-time").html(task["start"]);
      $clone_task_page.find(".__end-time").html(task["end"]);
      $clone_task_page.find(".__timer").html("N/A");

      // Displaying the sticker if there is one
      if (task["important"] == "false")
        $clone_task_page.find(".__sticker-important").css("display", "none");

      $tasks_box.append($clone_task_page);

      // Keeping reference of the task cards to update the timer.
      this.$task_pages.push($clone_task_page);
    }
    
    this.updateTimers();

  }

  // Updates the timers of every task card of the current day
  updateTimers = () => {

    // Checking if there are tasks for the day
    if(!this.tasks)
      return 0;

    // Looping through every task of the day
    for (let i=0; i<this.tasks.length; i++) {

      // Calculating the time left until the task in ms
      let until_time = new Date(this.dateString.replace("[time]", this.tasks[i]["start"]+":00")) - new Date();

      // Checking if the task has already passed
      if (until_time < 0) {
        this.$task_pages[i].find(".__timer").html("Done !");
      } else {

        // Converting until_time in ms to a formatted time
        let hours = lz(Math.floor(until_time/3600000));
        let remainder = until_time%3600000;
        let minutes = lz(Math.trunc(remainder/60000));
        let seconds = lz(Math.trunc((remainder%60000)/1000));
        let formatted_time =`${hours}:${minutes}:${seconds}`;

        // Updating the timer in the task card with the formatted time
        this.$task_pages[i].find(".__timer").html(formatted_time);
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

      //Display the task's div
      let $task_span = $(document.createElement("span")).addClass("__task-span");

      // Calculating every position and dimensions and color
      let width = 100/this.tasks.length - 1*this.tasks.length;
      let left = width*i + 2*(i+1);
      let height = 100*(subDates(this.tasks[i]["end"], this.tasks[i]["start"], false)/24);
      let top = 100*(subDates(this.tasks[i]["start"], "0:0", false)/24);
      if (!top || !height) {
        height = 100
        $task_span.css("opacity", "0.6");
      }
      let color = `dark${task_colors[i%task_colors.length]}`;

      // Adding the properties to the element
      $task_span.css({"width": `${width}%`,"left": `${left}%`, "height": `${height}%`,"top": `${top}%`, 
                      "background": `linear-gradient(110deg, linen, ${color} 550%)`});
      $tasks_spans_box.append($task_span);

      // Adds event listeners to the schedule spans
      $task_span.on("click", () => {
        resetAllCards();
        toggleTaskPage(this.$task_cards[i]);
      });
    }
  }
  
}

// class Task {
//   constructor ($task_page, $task_page) {
    
//   }
// }