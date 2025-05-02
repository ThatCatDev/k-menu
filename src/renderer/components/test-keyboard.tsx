/**
 * Simple test component to verify keyboard events are working
 */
import React from "react";

export class TestKeyboard extends React.Component {
  componentDidMount() {
    console.log("[TEST-KEYBOARD] Component mounted, setting up listener");
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    console.log("[TEST-KEYBOARD] Component unmounting, removing listener");
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent) => {
    console.log("[TEST-KEYBOARD] Key pressed:", {
      key: event.key,
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      code: event.code,
    });

    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      console.log("[TEST-KEYBOARD] Cmd+K detected!");
      event.preventDefault();
      alert("Cmd+K works!");
    }
  };

  render() {
    return (
      <div style={{ position: "fixed", bottom: 10, right: 10, background: "red", padding: "5px", color: "white", fontSize: "10px", zIndex: 99999 }}>
        Keyboard Test Active
      </div>
    );
  }
}
