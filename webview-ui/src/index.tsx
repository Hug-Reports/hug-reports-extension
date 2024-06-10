import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { FluentProvider, webLightTheme, webDarkTheme, Theme } from "@fluentui/react-components";

declare global {
  interface Window {
    lineofcode: any; // Use a more specific type instead of any if possible
  }
}

export const customDarkTheme: Theme = {
  ...webDarkTheme,
  colorNeutralBackground1: "#1e1e1e",
};

ReactDOM.render(
  <FluentProvider theme={window.lineofcode.theme === "dark" ? customDarkTheme : webLightTheme}>
    <App />
  </FluentProvider>,
  document.getElementById("root")
);
