// Importing of all the modules
const electron = require("electron");
const url = require("url");
const path = require("path");
const ipc = electron.ipcMain;
const fs = require("fs");
// Extracting objects from the electron module
const {app, BrowserWindow} = electron;

let mainWindow;
let newTaskWindow;

// Gets called when the app is set up
app.on("ready", () => {
  // Creating the main window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    show: false
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
  // Open json
  fs.readFile('user-data/user-data.json', 'utf8', (error, data) => {
    // Check if there was an error
    if (error){
        return 0;
    } else {
      // Convert it as an object
      json_object = JSON.parse(data);

      id = task_to_del.day_id;

      // Delete the task to delete
      for (i=0; i<json_object[id].length; i++) {
        if (areJSONEqual(task_to_del.data, json_object[id][i])){
          json_object[id].splice(i, 1);
          break;
        }
      }

      // Check if day is empty
      if (json_object[id].length == 0) {
        delete json_object[id];
      }

      // Convert it back to a json file
      json = JSON.stringify(json_object); 
      //Write the file
      fs.writeFile('user-data/user-data.json', json, 'utf8', () => {return 0});
    }
  });
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

ipc.on("new-task", (event, data) => {
  if (data[1] == "new_task") {
    mainWindow.webContents.send("create-new-task", data[0]);
    // Add the task in the json file as well
    fs.readFile('user-data/user-data.json', 'utf8', (error, json_data) => {
      if (error) 
        return 0;
      // Convert data to object
      id = data[2];
      json_object = JSON.parse(json_data);
      // Create the day in the json if it does not exist
      if (json_object[id] == undefined)
        json_object[id] = []
      // Append the task at the right id
      json_object[id].push(data[0]);
      // Convert it back to a json file
      json = JSON.stringify(json_object); 
      //Write the file
      fs.writeFile('user-data/user-data.json', json, 'utf8', () => {return 0;});
    });
  }
});
