// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
  Command,
  commands,
  ExtensionContext,
  languages,
  StatusBarAlignment,
  StatusBarItem,
  window,
  workspace,
} from "vscode";
import mainMinNode from "min-node";

import PackageJsonCodeLensProvider from "./CodeLensProvider";

const minNode = mainMinNode.minNode;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // Get current workspace path
  const workspacePath: string = !!workspace.workspaceFolders
    ? workspace.workspaceFolders[0].uri.path
    : process.cwd();

  // Public command definition
  let calculateCommand = commands.registerCommand(
    "min-node.calculate",
    async () => {
      // The code you place here will be executed every time your command is executed

      const result = await minNode(workspacePath).catch((err: any) =>
        window.showErrorMessage(err)
      );

      window.showInformationMessage(
        `The minimum workspace node version is: ${result}`
      );
    }
  );

  // Add commands to VSCode
  context.subscriptions.push(calculateCommand);

  /**
   * Internal command to update the status bar item passed as argument.
   */
  const statusBarUpdateCommand = commands.registerCommand(
    "min-node._statusUpdate",
    async (statusBarItem: StatusBarItem) => {
      const result = await minNode(workspacePath).catch((err: any) =>
        window.showErrorMessage(err)
      );
      statusBarItem.text = `Node engine >=${result}`;
    }
  );
  workspace.findFiles("package.json", "node_modules/*", 1).then((e) => {
    // Create status bar item
    const statusBarItem = window.createStatusBarItem(
      StatusBarAlignment.Right,
      100
    );

    // Definition of the command to call
    const commandToCall: Command = {
      title: "Foo",
      arguments: [statusBarItem],
      command: "min-node._statusUpdate",
    };
    statusBarItem.command = commandToCall;

    context.subscriptions.push(statusBarItem);

    statusBarItem.text = `Min-Node version`;
    statusBarItem.tooltip = `Click to get info about the minimum node version necessary in your workspace.`;
    statusBarItem.show();

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
  });

  context.subscriptions.push(statusBarUpdateCommand);

  // CodeLense

  // Get a document selector for the CodeLens provider
  // This one is any file that has the language of javascript
  let docSelector = {
    language: "json",
    scheme: "file",
    glob: "*/package.json",
  };

  // Register our CodeLens provider
  let codeLensProviderDisposable = languages.registerCodeLensProvider(
    docSelector,
    new PackageJsonCodeLensProvider()
  );

  // Push the command and CodeLens provider to the context so it can be disposed of later
  context.subscriptions.push(codeLensProviderDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
