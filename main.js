// Importing of all the modules
const electron = require("electron");
const url = require("url");
const path = require("path");
const ipc = electron.ipcMain;
const fs = require("fs");
// Extracting objects from the electron module
const {app, BrowserWindow, Tray, Menu} = electron;

let mainWindow;
let newTaskWindow;
let tray;

let forceClose = false;

// Gets called when the app is set up
app.on("ready", () => {
  app.setAppUserModelId(process.execPath);
  // Creating the main window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    title: "Insert Title Here",
    icon: path.join(__dirname, "assets/app-icon-dark.png"),
    show: false,
    autoHideMenuBar: true
  });

  // Waiting for the window to be ready to be shown
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  //Load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, "mainWindow.html"),
    protocol: "file",
    slashes: true
  }));

  mainWindow.setOverlayIcon(path.join(__dirname, "assets/app-icon-dark.png"), 'To Do App');

  mainWindow.maximize();

  // Adding window tray
  tray = new Tray('assets/app-icon-light.png');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open', click() {
      mainWindow.setSkipTaskbar(false);
      mainWindow.maximize();
    }},
    { label: 'Exit', click() {
      forceCloseMainWindow();
    }}
  ]);
  tray.setToolTip('To Do App');
  tray.setContextMenu(contextMenu);

  // Handling the window closing
  mainWindow.on("close", (event) => {
    event.preventDefault();
    if (newTaskWindow) {
      newTaskWindow.close();
      newTaskWindow = null;
    }
    // Get the setting
    fs.readFile('user-data/save.json', 'utf8', (error, data) => {
      json_object = JSON.parse(data);
      if (json_object['minimizeWhenClosed'] && !forceClose) {
        mainWindow.minimize();
        mainWindow.blur();
        mainWindow.setSkipTaskbar(true);
      } else {
        mainWindow.destroy();
        mainWindow = null;
      }
    });
  });

});

forceCloseMainWindow = () => {
  forceClose = true;
  mainWindow.close();
}


ipc.on("remove-task", (event, task_to_del) => {
  removeTaskJSON(task_to_del);
});

ipc.on("check-task", (event, message) => {
  changeTaskPropertyJSON(message['task'].info, message['task'].day_id, "checked", message['val']);
});

ipc.on('notification-sent', (event, message) => {
  changeTaskPropertyJSON(message['task'], message["id"], "notif_sent", true);
});

// Function to check if 2 json objects are equal even thought they don't have the same child order
areJSONEqual = (a, b) => {
  let difference = false;
  Object.keys(a).forEach( (key) => {
    if (a[key] !== b[key]) { 
      difference = true;
    }
  });
  if (difference) {
    return false;
  } else {
    return true;
  }
}

ipc.on("create-new-task-window", (event, data) => {
  createNewTaskWindow(data);
});


createNewTaskWindow = (data) => {

  newTaskWindow = new BrowserWindow({
    webPreferences: {nodeIntegration: true},
    resizable: false,
    height: 480,
    width: 600,
    frame: false,
    show: false
  });

  //Load html into window
  newTaskWindow.loadURL(url.format({
    pathname: path.join(__dirname, "newTaskWindow.html"),
    protocol: "file",
    slashes: true
  }));

  newTaskWindow.webContents.on('dom-ready', () => {
    // Making sure the window is actually ready
    setTimeout( () => {
      newTaskWindow.webContents.send("send-new-task-window-data", data);
      newTaskWindow.show();
    }, 100);
  });

  // Handling window closing
  newTaskWindow.on("close", () => {
    newTaskWindow = null;
  });

}

ipc.on("new-task-window-reply", (event, message) => {
  if (message['action'] == "new_task") {
    // Add the task in the json file
    addTaskJSON(message['day_id'], message['task_info'], message['repeat_id']);
  } else {
    // Edit the task in the json file as well
    editTaskJSON(message['day_id'], message['task_info'], message['past_info']);
  }
});

// Find the index of a task in the json file
findTaskIndex = (task_info, json) => {
  for (i=0; i<json.length; i++) {
    if (areJSONEqual(task_info, json[i])){
      return i;
    }
  }
  return false;
}

// Change any property of a task in the json file
changeTaskPropertyJSON = (task, id, prop, new_val) => {
  // Open json
  fs.readFile('user-data/user-data.json', 'utf8', (error, data) => {
    // Check if there was an error
    if (error)
      return 0;
    // Convert it to an object
    json_object = JSON.parse(data);
    // Find the task to delete and delete it
    index = findTaskIndex(task, json_object[id]);
    if (index !== false) {
      json_object[id][i][prop] = new_val;
    }
    // Convert it back to a json file
    json = JSON.stringify(json_object); 
    //Write the file
    fs.writeFile('user-data/user-data.json', json, 'utf8', () => {
      // Send message to update day tasks 
      mainWindow.webContents.send("update-day", null);
    });
  });
}

// Generate a random number for the repeat feature
generateId = (data) => {
  // Create id
  let id = 0;
  for (i=0; i<6; i++) {
    id += 10**i*Math.floor(Math.random()*10);
  }
  // Check if id already exists
  for (day of Object.keys(data)) {
    for (task of data[day]) {
      if (task['repeat_id'] == id) {
        return generateId(tasks);
      }
    }
    return id;
  }
}

// Adds a task in the json file
addTaskJSON = (day_id, task_info, repeat_id = false) => {
  fs.readFile('user-data/user-data.json', 'utf8', (error, json_data) => {
    if (error) 
      return 0;
    // Convert data to object
    json_object = JSON.parse(json_data);
    // Create the day in the json if it does not exist
    if (json_object[day_id] == undefined)
      json_object[day_id] = []
    // Create the repeat id for the task
    if (task_info['repeat_setting'] != 'No Repeat')
      task_info['repeat_id'] = repeat_id ? repeat_id : generateId(json_object);
    // Append the task at the right id
    json_object[day_id].push(task_info);
    // Convert it back to a json file
    json = JSON.stringify(json_object); 
    //Write the file
    fs.writeFile('user-data/user-data.json', json, 'utf8', () => {
      // Send message to update day tasks 
      mainWindow.webContents.send("update-day", null);
    });
  });
}

// Delete a task in the json
removeTaskJSON = (task) => {
  // Open json
  fs.readFile('user-data/user-data.json', 'utf8', (error, data) => {
    // Check if there was an error
    if (error)
      return 0;
    // Convert it to an object
    json_object = JSON.parse(data);
    id = task.day_id;
    // Find the task to delete and delete it
    index = findTaskIndex(task.info, json_object[id]);
    if (index !== false) {
      // Delete all instances of the task if it has a repeat setting
      if (task.info.repeat_setting != 'No Repeat') {
        for (day of Object.keys(json_object)) {
          for (j=0; j<json_object[day].length; j++) {
            if (json_object[day][j]['repeat_id'] == task.info.repeat_id)
              json_object[day].splice(j, 1);
          }
        }
      }
      json_object[id].splice(index, 1);
    }
    // Check if day is empty, if so, delete it
    if (json_object[id].length == 0)
      delete json_object[id];
    // Convert it back to a json file
    json = JSON.stringify(json_object); 
    //Write the file
    fs.writeFile('user-data/user-data.json', json, 'utf8', () => {
      // Send message to update day tasks 
      mainWindow.webContents.send("update-day", null);
    });
  });
}

// Edit a task in the json
editTaskJSON = (day_id, new_info, past_info) => {
  // Open json
  fs.readFile('user-data/user-data.json', 'utf8', (error, data) => {
    // Check if there was an error
    if (error)
      return 0;
    // Convert it to an object
    json_object = JSON.parse(data);
    // Find the task to edit with the info before it was edited
    index = findTaskIndex(past_info, json_object[day_id]);
    if (index !== false) {
      json_object[day_id][i] = new_info;
    }
    // Convert it back to a json file
    json = JSON.stringify(json_object); 
    //Write the file
    fs.writeFile('user-data/user-data.json', json, 'utf8', () => {
      // Send message to update day tasks 
      mainWindow.webContents.send("update-day", null);
    });
  });
}