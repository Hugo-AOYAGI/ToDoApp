// Importing of all the modules
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const dialog = electron.dialog;

//Fonction that adds a leading zero to time and date values for formatting
lz = (n) => {
    if (n == "" || n <= 0)
        return "00";
    if (n[0] == "0" && n.length == 2)
        return n;
    return n < 10 ? "0"+n : n;
} 

let message;

$(document).ready( () => {
    
    
    ipcRenderer.on("send-new-task-window-data", (event, _message) => {
        // Getting the title of the window (edit or add)
        message = _message;
        title = message["action"] == "edit_task" ? "Edit the task" : "Create a new task";
        $(".__title-main").html(title);
        if (message["action"] == "edit_task") {
            info = message["past_info"];
            // Changing the value of the input elements
            $(".__title").val(info.title);
            $(".__desc").val(info.desc);
            $(".__start-time").html(info.start);
            $(".__end-time").html(info.end)
            $(".__repeat").val(info.repeat_setting);
            $(".__notification").val(info.notify_setting);
        }
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

    // Getting the time input as values to display on the buttons
    let time_to_update;
    let $time_input_container = $(".time-input-container");
    let $start_time_btn = $(".__start-time");
    let $end_time_btn = $(".__end-time");
    

    resetTimeInput = () => {
        $hours_input.val("");
        $minutes_input.val("");
        let hours, minutes;
        // Checking if a value as already been entered, if so, set that value for the inputs
        if (time_to_update.hasClass("__end-time") && $end_time_btn.html() != "N/A"){
            hours = $end_time_btn.html().split(":")[0];
            minutes =  $end_time_btn.html().split(":")[1];
            $hours_input.val(hours);
            $minutes_input.val(minutes);
        } else if (time_to_update.hasClass("__start-time") && $start_time_btn.html() != "N/A") {
            hours = $start_time_btn.html().split(":")[0];
            minutes =  $start_time_btn.html().split(":")[1];
            $hours_input.val(hours);
            $minutes_input.val(minutes);
        }

        updateHeight($hours_input, $hours_input.siblings(".bar"), 0.25);
        updateHeight($minutes_input, $minutes_input.siblings(".bar"), 0.1);
    }

    changeStartTime = () => {
        time_to_update = $(".__start-time");
        resetTimeInput();
        $time_input_container.css("display", "block");
        
    }

    changeEndTime = () => {
        time_to_update = $(".__end-time");
        resetTimeInput();
        $time_input_container.css("display", "block");
    }

    // Managing the important checkbox
    $(".__important-container").on("click", (event) => {
        ($(".__checkbox").hasClass("checked")) ? $(".__checkbox").removeClass("checked") : $(".__checkbox").addClass("checked");
    });


    // Adding event listeners to the time buttons

    $start_time_btn.on("click", changeStartTime);
    $end_time_btn.on("click", changeEndTime);

    // Adding event listener to time confirm button

    updateTime = () => {
        $time_input_container.css("display", "none");
        time_to_update.html(`${$hours_input.val()}:${$minutes_input.val()}`);
        if ($hours_input.val() == "" || $minutes_input.val() == "")
            time_to_update.html("N/A");
    }

    $(".__time-confirm-button").on("click", updateTime);

    // Format the description to support links

    let youtube_player = '<iframe width="100%" height="250px" src="https://www.youtube.com/embed/[VIDEO_ID]" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    let twitch_player =  '<iframe src="https://player.twitch.tv/?channel=[CHANNEL]" height="250px",  frameborder="0" allowfullscreen="true" scrolling="no" width="100%"></iframe>';
    
    // Check if a string is an URL with a regular expression
    isURL = (str) => {
        if (str.match(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/gm)) {
            return true;
        } else {
            return false;
        }
    }

    formatDesc = (desc) => {
        words = desc.split(" ");
        escape_urls = words[0] == "escape_urls" ? true : false;
        if (escape_urls) desc = desc.replace("escape_urls", "");
        for (word of words) {
            if (isURL(word) && !escape_urls) {
                // Adds url support
                link = word.includes("http") ? word : "http://" + word
                new_word = "<a href='"+ link +"'>" + word.replace("https://", "").replace("http://", "") + "</a>";
                // Add a youtube embed player if it is a youtube video
                if (word.includes("youtube.com") && word.includes("watch")) {
                    video_id = word.split("watch?v=")[1].split("&")[0];  
                    new_word += youtube_player.replace("[VIDEO_ID]", video_id);
                // Add a twitch embed player if it is a twitch channel
                } else if (word.includes("twitch.tv") && word.substring(word.indexOf("tv") + 3) != "") {
                    channel = word.substring(word.indexOf("tv") + 3);
                    ban_words = ["directory", "subscriptions", "payment", "friends", "inventory"];
                    if (!channel.includes["/"] && !ban_words.includes(channel))
                        new_word += twitch_player.replace("[CHANNEL]", channel);
                }
                desc = desc.replace(word, new_word);
            } else if (word.startsWith("IMG[")) {
                let info = word.split("[").pop().replace("]", "");
                info = info.split(",");
                desc = desc.replace(word, `<img src='${info[0]}' alt='Image could not load !' width='${info[1]}px' height='${info[2]}px'>`)
            }
                
                
        }
        desc = desc.replace(/\n/g, "</br>");
        return desc;
    }


    // Add event listener to global confirm button

    confirmTask = () => {
        // Check if the title was entered
        if ($(".__title").val() == "") {
            alert("Please fill in the title.");
            return 0;
        }
        // Format the data into an object
        task_info = {
            'title': $(".__title").val(),
            'desc': $(".__desc").val() ? formatDesc($(".__desc").val()) : "None",
            'start': $(".__start-time").html(),
            'end': $(".__end-time").html(),
            'important': $(".__checkbox").hasClass("checked") ? true : false,
            'checked': false,
            'notify_setting': $(".__notification").val(),
            'notif_sent': false,
            'repeat_setting': $(".__repeat").val(),
            'repeat_id': false
        }
        ipcRenderer.send("new-task-window-reply" , {...{'task_info': task_info, 'repeat_id': false}, ...message});
        electron.remote.getCurrentWindow().close();
    }

    $(".__confirm-btn").on("click", confirmTask);

    


});