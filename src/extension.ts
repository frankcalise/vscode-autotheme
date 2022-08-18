// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as suncalc from "suncalc";
import fetch from "node-fetch";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "autotheme" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("autotheme.start", () => {
    const checkTimeAndUpdateTheme = function () {
      const workbenchConfig = vscode.workspace.getConfiguration("workbench");
      const currentTheme: string | undefined =
        workbenchConfig.get("colorTheme");

      const autoThemeConfig = vscode.workspace.getConfiguration("autoTheme");
      const sunriseTheme: string | undefined =
        autoThemeConfig.get("sunriseTheme");
      const sunsetTheme: string | undefined =
        autoThemeConfig.get("sunsetTheme");

      const times = suncalc.getTimes(new Date(), findLatitude, findLongitude);

      const now = new Date();
      const isSunset =
        times.sunsetStart.toTimeString().substring(0, 4) ===
        now.toTimeString().substring(0, 4);
      const isSunrise =
        times.sunrise.toTimeString().substring(0, 4) ===
        now.toTimeString().substring(0, 4);

      let switchToTheme = currentTheme;
      if (isSunset && sunsetTheme) {
        switchToTheme = sunsetTheme;
      } else if (isSunrise) {
        switchToTheme = sunriseTheme;
      }

      workbenchConfig.update("colorTheme", switchToTheme);
    };

    type IP_DATA = {
      latitude: number;
      longitude: number;
    };

    // Default to Bluffton, SC
    let findLatitude = 32.26212;
    let findLongitude = -80.89967;
    fetch("https://json.geoiplookup.io/")
      .then((response) => response.json())
      .then((data) => {
        const { latitude, longitude } = data as IP_DATA;
        findLatitude = latitude;
        findLongitude = longitude;
      });

    // TODO: Will need initial condition to set proper theme
    // Run once initially
    checkTimeAndUpdateTheme();

    // Run a check every minute
    setInterval(checkTimeAndUpdateTheme, 60000);
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
