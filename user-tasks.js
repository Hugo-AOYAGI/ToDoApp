
// Contains the information of the day
class Day {

  // Creates a day from an existing day, loading its saved tasks
  static fromDate (date) {
    // Get ID of the day from the argument's date

    // Get the information to display in the future in an object

    // Load the tasks at the date

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