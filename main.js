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
  mainWindow = new BrowserWindow({webPreferences: {
    nodeIntegration: true
  }});
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
      for (i in json_object[id]) {
        if (areJSONEqual(task_to_del.json, json_object[id][i])){
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
      fs.writeFile('user-data/user-data.json', json, 'utf8', () => {console.log("done");});
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

ipc.on("create-new-task-window", (event, title) => {
  createNewTaskWindow(title);
});


createNewTaskWindow = (title) => {

  newTaskWindow = new BrowserWindow({
    webPreferences: {nodeIntegration: true},
    resizable: false,
    height: 480,
    width: 600,
    frame: false,
    alwaysOnTop: true
  });

  //Load html into window
  newTaskWindow.loadURL(url.format({
    pathname: path.join(__dirname, "newTaskWindow.html"),
    protocol: "file",
    slashes: true
  }));

  // Handling window closing
  newTaskWindow.on("close", () => {
    newTaskWindow = null;
  });

  //Waiting for window to load
  newTaskWindow.webContents.once('did-finish-load', () => {
    // Making sure the window is actually ready
    let arr = [];
    for (i=0; i<10000; i++)
      arr.push(i);
    newTaskWindow.webContents.send("change-new-task-window-title", title);
  });
 

}
