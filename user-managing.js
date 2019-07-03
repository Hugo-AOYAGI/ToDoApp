

//Fonction that adds a leading zero to time and date values for formatting
lz = (n) => {
  return n < 10 ? "0"+n : n;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


// Contains the information of the day
class Day {

  // Creates a day from an existing day, loading its saved tasks
  static fromDate (date) {
    // Get ID of the day from the argument's date
    this.id = `${lz(date.getDate())}${lz(date.getMonth())}${lz(date.getFullYear())}`
    // Get the information to display in the day-card
    this.day_name = days[date.getDay()-1];
    // Load the tasks at the date
    $.ajax({ 
      type: 'GET', 
      url: 'user-data/user-data.json', 
      data: { get_param: 'value' }, 
      dataType: 'json',
      success: function (data) { 
        console.log(data);
      }
    });

  }

  // Loads from a JSON the tasks of the day
  loadTasks = () => {
    // Open the JSON file where the tasks are located

    // Check for tasks at the day's ID

  }

  // Displays the information of a the day into a template card.
  loadInfo = (card) => {
    // Load schedule into the card

    // Load every task in the tasks-box

  }

  // Loads the tasks into the schedule
  loadSchedule = (card) => {
    //Loops through every task of that day 

      //Display the task's div

      //Display the info window of the task
  }
  
}

Day.fromDate(new Date());