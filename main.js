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

// Gets called when the app is set up
app.on("ready", () => {
  é
  app.setAppUserModelId(process.execPath);
  // Creating the main window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    title: "Tasks And Events Manager",
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

  mainWindow.maximize();

  // Handling the window closing
  mainWindow.on("close", () => {
    if (newTaskWindow)
      newTaskWindow.close();
    mainWindow = null;
    newTaskWindow = null;
  });

});

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
    alwaysOnTop: true,
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
    addTaskJSON(message['day_id'], message['task_info']);
  } else {
    // Edit the task in the json file as well
    editTaskJSON(message['day_id'], message['task_info'], message['past_info']);
  }
});

findTaskIndex = (task_info, json) => {
  for (i=0; i<json.length; i++) {
    if (areJSONEqual(task_info, json[i])){
      return i;
    }
  }
  return false;
}

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

addTaskJSON = (day_id, task_info) => {
  fs.readFile('user-data/user-data.json', 'utf8', (error, json_data) => {
    if (error) 
      return 0;
    // Convert data to object
    json_object = JSON.parse(json_data);
    // Create the day in the json if it does not exist
    if (json_object[day_id] == undefined)
      json_object[day_id] = []
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
      json_object[id].splice(i, 1);
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