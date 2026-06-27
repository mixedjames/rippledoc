import { app, BrowserWindow } from "electron";
import * as path from "path";

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, "../renderer/index.html"));
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// macOS: re-create a window when the dock icon is clicked with no open windows.
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
