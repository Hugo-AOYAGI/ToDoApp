

// Seeting up array of the days
// let days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]; 
const $body = $("body");

// Wait for window to load
$(document).ready(() => { 

  /* LOAD THE FIRST DAY */
  let day_counter = 0;
  let current_day;
  refreshCurrDay = () => {
    current_day = Day.fromDate(new Date(Date.now() + day_counter*one_day));
  }
  refreshCurrDay();
  
  // Interval for updating timers
  let t1 = setInterval(current_day.updateTimers(), 1000);


  /* ===Creating the day Selection bar=== */

  // Getting the template and day selection bar
  let $template = $(".__day-button.template");
  let $nav_bar = $(".day-selection-bar");
  let nav_enabled = false;

  //Creating a button for each day of the week
  for (day of days) {
    // Cloning template
    let clone = $template.clone().css("display", "unset");
    // Changing the text in the template
    clone.html(clone.html().replace("Day Name", day).replace("X", "0"));
    $nav_bar.append(clone);
  }

  // Callback function of click event on nav_btn
  toggleNavBar = () => {
    // Checking if the navigation bar is already enabled
    if (!nav_enabled) {
      // Displaying the navigation bar
      $body.css("grid-template-areas", "'head head timer' 'nav main main' 'nav foot foot'");
      $nav_bar.css("display", "inline-flex");
      $nav_btn.css("transform", "rotate(90deg)");
      nav_enabled = true;
    } else {
      // Hiding the navigation bar
      $body.css("grid-template-areas", "'head head timer' 'main main main' 'foot foot foot'");
      $nav_bar.css("display", "none");
      $nav_btn.css("transform", "rotate(0deg)");
      nav_enabled = false;
    }
  }

  // Adding event listener to the navigation button
  let $nav_btn = $(".nav-btn");
  $nav_btn.on("click", toggleNavBar);

  /* ===Displaying the time onto the header=== */
  let $date_span = $("span.__date");
  let $time_span = $("span.__time");

  //Fonction that adds a leading zero to time and date values for formatting
  lz = (n) => {
    return n < 10 ? "0"+n : n;
  }
  
  // Updates the time and date spans every second
  updateTimeAndDate = () => {
    let d = new Date();
    // Formating the dates and time
    let formatedTime = `${lz(d.getHours())} : ${lz(d.getMinutes())} : ${lz(d.getSeconds())}`;
    let formatedDate = `${lz(d.getDate())} / ${lz(d.getMonth())} / ${lz(d.getFullYear())}`;
    // Changing the html of the time and date spans
    $time_span.html(formatedTime);
    $date_span.html(formatedDate);
  }
  // Calling the updateTimeAndDate every 1000 ms or 1s
  updateTimeAndDate();
  t = setInterval(updateTimeAndDate, 1000);
  

  /* ===Managing the next-task element=== */

  // Display the time left until the next task/event


  // Add event listener to the next-task element thats redirects to the corresponding task card


  /* ===Managing the day card=== */

  // Load the tasks of the day card


  // Load the schedule of the day card


  /* ===Managing the task card=== */

  // Add event listeners to go to task card with the more-info button
  let $tasks = $(".task");

  // Displays the task card and modify the task's styling
  displayCard = ($task, $task_card) => {
    // Modifies the styling of the task
    $task.css("height", "10%");
    $task.find(".__tab-main").css("display", "none");
    $task.find(".__start-time").css("opacity", "0");
    $task.find(".__more-button").css("transform", "rotateZ(0deg)")
    $task_card.css("display", "unset");
    for(task of $tasks){
      if(!task.is($task))
        task.css("display", "none");
    }
  }

  // Resets the task and task card styling back to default
  hideCard = ($task, $task_card) => {
    // Modifies the styling of the task
    $task.css("height", "20%");
    $task.find(".__tab-main").css("display", "flex");
    $task.find(".__start-time").css("opacity", "1");
    $task.find(".__more-button").css("transform", "rotateZ(45deg)")
    $task_card.css("display", "none");
    for(task of $tasks) {
      if (!task.is(".template"))
        task.css("display", "block");
    }
  }

   // Displays the taskcard
  toggleTaskCard = (i) => {
    // Getting the element that caused the click event
    let $task = typeof i == "number" ? $tasks[i] : i;
    let $task_card = $task.next(".task-card");
    // Checking if the sidebar of the tab is already toggled
    if ($task.find(".__start-time").css("opacity") == "1") {
      displayCard($task, $task_card);
    } else {
      hideCard($task, $task_card);
    }
  }

  // Hides all current task cards reseting the styling to default
  resetAllCards = () => {
    for (let $task of $tasks) {
      let $task_card = $task.next(".task-card");
      hideCard($task, $task_card);
    }
  }

  reloadTasks = () => {
    $tasks = $(".task").toArray();
    for (let i=0; i<$tasks.length; i++) {
      $tasks[i] = $($tasks[i]);
      $tasks[i].find(".__more-button").on("click", () => {toggleTaskCard(i);});
    }
  }

  setTimeout(reloadTasks, 1000);

  // Displays the side bars
  toggleSideBar = (event) => {
    // Getting the element that caused the click event
    $tab = $(event.target);
    // Checking if the sidebar of the tab is already toggled
    if ($tab.css("left") == "0px") {
      // Displaying the sidebar
      $tab.siblings(".__side-bar").css("width", "15%");
      $tab.siblings(".__title").css("left", "15%");
      $tab.css("left", "15%");
      $tab.html("〈");
    } else {
      // Hiding the sidebar
      $tab.siblings(".__side-bar").css("width", "0%");
      $tab.siblings(".__title").css("left", "0%");
      $tab.css("left", "0px");
      $tab.html("〉");
    }
  }

  reloadSideBars = () => {
    let $tabs = $(".__tab-main");
    
    $tabs.each( function () {
      $(this).on("click", toggleSideBar);
    });
  }

  setTimeout(reloadSideBars, 1000);
  

  // Remove option for the task


  // Edit option for the task


  // Check option for the task



  /* ===Adding footer events listeners=== */

  $(".__next-d").on("click", () => {
    day_counter += 1;
    refreshCurrDay();
  });
  $(".__prev-d").on("click", () => {
    day_counter -= 1;
    refreshCurrDay();
  });
  $(".__next-w").on("click", () => {
    day_counter += 7;
    refreshCurrDay();
  });
  $(".__prev-w").on("click", () => {
    day_counter -= 7;
    refreshCurrDay();
  });


  /* ===New task feature=== */

  // Create new html window (addTask.html) from the main.js


  // Reload the tasks so that the new task appears


}); 
