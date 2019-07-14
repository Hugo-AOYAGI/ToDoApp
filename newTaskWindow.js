// Importing of all the modules
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;

//Fonction that adds a leading zero to time and date values for formatting
lz = (n) => {
    if (n == "" || n <= 0)
        return "00";
    return n < 10 ? "0"+n : n;
} 

$(document).ready( () => {
    
    // Getting the title of the window (edit or add)
    ipcRenderer.on("change-new-task-window-title", (event, title) => {
        $(".__title-main").html(title);
    });

    // Add event listener to the close button
    $(".__close-btn").on("click", () => {
        electron.remote.getCurrentWindow().close();
    });

    // Manages the height of the time input progress bars

    //Getting the progress bars elements

    let $hours_input = $("#hours-input");
    let $minutes_input = $("#minutes-input");

    inInterval = ($target, min, max) => {
        // Checks if the input val is only 2 characters long
        if ($target.val().length > 2)
            $target.val($target.val().substr(1, 2));
        // Checks if the hours are in the right interval
        if (parseInt($target.val()) > max)
            $target.val(lz(max));
        if (parseInt($target.val()) <= min)
            $target.val(lz(min));
    }

    updateHeight = ($input, $bar, k) => {
        // Changes the height of the progress bar based on the input value
        let height = parseInt($input.val())*k + 2.5 + k;
        if ($input.val() == "")
            height = 2.5;
        $bar.css("height", `${height}rem`)
    }

    incrementInput = ($target, value) => {
        let initial_value = $target.siblings("input").val() == "" ? 0 : parseInt($target.siblings("input").val());
        let k = $target.hasClass("hours") ? 0.25 : 0.1;
        let max = $target.hasClass("hours") ? 23 : 59;
        $target.siblings("input").val(initial_value + value);
        inInterval($target.siblings("input"), 0, max);
        $target.siblings("input").val(lz( $target.siblings("input").val()));
        updateHeight($target.siblings("input"), $target.siblings(".bar"), k);
    }

    $hours_input.on("input", (event) => {
        inInterval($(event.target), 0, 23);
        updateHeight($(event.target), $(event.target).siblings(".bar"), 0.25);
    });

    $hours_input.on("focusout", () => {
        // Formats the input value when the input goes out of focus
        $hours_input.val(lz($hours_input.val()));
    });

    $minutes_input.on("input", (event) => {
        inInterval($(event.target), 0, 59);
        updateHeight($(event.target), $(event.target).siblings(".bar"), 0.1);
    });

    $minutes_input.on("focusout", () => {
        // Formats the input value when the input goes out of focus
        $minutes_input.val(lz($minutes_input.val()));
    });

    // Adding event listeners to the plus (+) and minus (-)
    $(".__plus").on("click", (event) => {
        // Update all the html elements with the new value
        let $target = $(event.target);
        incrementInput($target, 1);
        
    });

    $(".__minus").on("click", (event) => {
        // Update all the html elements with the new value
        let $target = $(event.target);
        
        incrementInput($target, -1);
        
    });

    let click_freq;
    let counter;
    let click_interval;

    document.querySelector(".__minus").oncontextmenu = new Function("return false;");

    stopPress = () => {
        // Stopping the interval
        clearInterval(click_interval);
    }

    holdingPress = (args) => {
        // Incrementing the counter
        counter += (1/args['max_freq'])*1000;
        console.log(click_freq);
        // Checking if the counter has passed the trigger time
        if (counter >= args['time_trigger']) {
            // Limiting the value of the click freq
            if (click_freq >= args['max_freq'])
                click_freq = args['max_freq'];
            if(counter - args['time_trigger'] > (1/click_freq)*1000 || click_freq == 1) {
                // Reseting counter
                counter = args['time_trigger'];
                // Calling the function
                args['callback'](args["object"]); 
                // Adding acceleration to the click freq
                click_freq += args['acceleration'];
            }
        }
        
    }

    startPress = (args) => {
        // Reseting variables
        counter = 0;
        click_freq = 1;
        // Starting interval
        click_interval = setInterval(() => {holdingPress(args);}, (1/args['max_freq'])*1000);
    }

    // Handler for long presses so that they are counted as many clicks
    (function($) {
        $.fn.longPress = function(callback, time_trigger, max_freq, acceleration) {
            return this.each( function () {
                // Storing the arguments in an object
                let _arguments = {'callback': callback, 
                            'time_trigger': time_trigger, 
                            'max_freq': max_freq, 
                            'acceleration': acceleration,
                            'object': $(this)
                        };
                $(this).mousedown(() => {startPress(_arguments)});
                $(this).on("mouseup mouseleave", () => {stopPress()});
            });
        };
    }(jQuery));

    $(".__plus.hours").longPress(function (event) {
        incrementInput(event, 1);
    }, 200, 40, 2);

    $(".__minus.hours").longPress(function (event) {
        incrementInput(event, -1);
    }, 200, 40, 2);

    $(".__plus.mins").longPress(function (event) {
        incrementInput(event, 1);
    }, 200, 80, 4);

    $(".__minus.mins").longPress(function (event) {
        incrementInput(event, -1);
    }, 200, 80, 4);

});