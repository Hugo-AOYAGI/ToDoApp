
//Fonction that adds a leading zero to time and date values for formatting
lz = (n) => {
  return n < 10 ? "0"+n : n;
}
const one_day = 86400000;

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Contains the information of the day
class Day {

  // Creates a day from an existing day, loading its saved tasks
  static fromDate (date) {
    // Defining variables
    let day = new Day();
    day.$task_cards = [];
    day.dateString = date.toString().replace(
        `${lz(date.getHours())}:${lz(date.getMinutes())}:${lz(date.getSeconds())}`,
         "[time]");
    // Get ID of the day from the argument's date
    day.id = `${lz(date.getDate())}${lz(date.getMonth()+1)}${lz(date.getFullYear())}`
    // Get the information to display in the day-card
    day.day_name = days[date.getDay()-1];
    // Load the tasks at the date
    $.ajax({ 
      type: 'GET',
      url: "user-data/user-data.json", 
      dataType: "json",
      success: (data) => { 
        day.tasks = data[day.id];
      },
      error: () => {
        alert("Your tasks could not be retrieved!");
      },
      complete: () => {
        day.loadTasks($(".day-card.template"));
      }
    });

    return day;

  }

  // Displays the tasks from a template card.
  loadTasks = ($card) => {
    // Displaying the day name
    $card.find(".__title-day").html(this.day_name);
    // Load every task in the tasks-box
    let $template_task = $card.find(".task.template");
    let $template_task_card = $card.find(".task-card.template");
    let $tasks_box = $card.find(".__tasks-box");
    // Looping through every task of the day
    if (!this.tasks){
      return 0;
    }
    for(let $task of this.tasks) {
      // Cloning the templates
      let $clone_task = $template_task.clone().removeClass("template");
      let $clone_task_card = $template_task_card.clone().removeClass("template");
      // Replacing the right information in the clones
      $clone_task.find(".__title").html($task["title"]);
      $clone_task.find(".__start-time").html($task["start"]);
      $tasks_box.append($clone_task);
      $clone_task_card.find(".__description").html($task["desc"]);
      $clone_task_card.find(".__start-time").html($task["start"]);
      $clone_task_card.find(".__end-time").html($task["end"]);
      $clone_task_card.find(".__timer").html("N/A");
      $tasks_box.append($clone_task_card);
      // Keeping reference of the task cards to update the timer.
      this.$task_cards.push($clone_task_card);
    }
    
    this.updateTimers();

  }

  // Updates the timers of every task card of the current day
  updateTimers = () => {
    if(!this.tasks) {
      return 0;
    }
    for (let i=0; i<this.tasks.length; i++) {
      let until_time = new Date(this.dateString.replace("[time]", this.tasks[i]["start"]+":00")) - new Date();
      if (until_time < 0) {
        this.$task_cards[i].find(".__timer").html("Done !");
      } else {
        let hours = lz(Math.floor(until_time/3600000));
        let remainder = until_time%3600000;
        let minutes = lz(Math.trunc(remainder/60000));
        let seconds = lz(Math.trunc((remainder%60000)/1000));
        let formatted_time =`${hours}:${minutes}:${seconds}`;
        this.$task_cards[i].find(".__timer").html(formatted_time);
      }
    }
  }

  // Loads the tasks into the schedule
  loadSchedule = (card) => {
    //Loops through every task of that day 

      //Display the task's div

      //Display the info window of the task
  }
  
}

current_day = Day.fromDate(new Date(new Date() - 2*one_day));

// Interval for updating timers
let t = setInterval(current_day.updateTimers(), 1000);