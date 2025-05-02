/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { CommandPaletteManager } from "./command-palette-manager";

/**
 * Global component that renders the command palette overlay
 * This component should be rendered once at the app level
 */
export class GlobalCommandPalette extends React.Component {
  private handleSubmit = (value: string) => {
    console.log("[K-MENU] Command submitted:", value);

    // TODO: Add your command handling logic here
    // For example:
    // - Parse the input
    // - Execute commands
    // - Navigate to resources
    // - Search functionality
    // - etc.

    alert(`Command executed: ${value}`);
  };

  render() {
    return <CommandPaletteManager onSubmit={this.handleSubmit} />;
  }
}
