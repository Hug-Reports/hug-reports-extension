import { vscode } from "./utilities/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import "./App.css";

declare global {
  interface Window {
    lineofcode: any; // Use a more specific type instead of any if possible
  }
}

function App() {
  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }

  const lineofcode = window.lineofcode;
  console.log("Line of code:", lineofcode);

  return (
    <main>
      <h1>Hello World!</h1>
      <p>Here's a line of code from the extension:</p>
      <p>{lineofcode.linetext}</p>
      <VSCodeButton onClick={handleHowdyClick}>Howdy!</VSCodeButton>
    </main>
  );
}

export default App;
