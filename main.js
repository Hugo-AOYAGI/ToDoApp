// Importing of all the modules
const electron = require("electron");
const url = require("url");
const path = require("path");
const ipc = electron.ipcMain;
const fs = require("fs");
// Extracting objects from the electron module
const {app, BrowserWindow} = electron;

let mainWindow;

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

  //mainWindow.webContents.openDevTools();

});

app.on("close", () => {
  mainWindow = null;
})

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
        if (areJSONEqual(task_to_del.json, json_object[id][i]))
          delete json_object[id][i];
          // Check if day is empty
          if (!json_object[id])
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
  console.log(Object.keys(a));
  Object.keys(a).forEach( (key) => {
    if (a[key] != b[key]) {
      return false;
    }
  });
  return true;
}
