// Importing of all the modules
const electron = require("electron");
const url = require("url");
const path = require("path");

// Extracting objects from the electron module
const {app, BrowserWindow} = electron;

let mainWindow;

// Gets called when the app is set up
app.on("ready", () => {
  // Creating the main window
  mainWindow = new BrowserWindow({});
    //Load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, "mainWindow.html"),
    protocol: "file",
    slashes: true
  }));

  //mainWindow.webContents.openDevTools();

})

app.on("close", () => {
  mainWindow = null;
})
