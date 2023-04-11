import * as vscode from 'vscode';

let myStatusBarItem: vscode.StatusBarItem;

export function activate({ subscriptions }: vscode.ExtensionContext) {

	// register a command that is invoked when the status bar
	// item is selected
	const myCommandId = 'scroll-percentage.showSelectionCount';
	subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		//const n = vscode.window.activeTextEditor?.visibleRanges[0].start.line;
		//vscode.window.showInformationMessage(`Yeah, ${n} line(s) selected... Keep going!`);
	}));

	// create a new status bar item that we can now manage
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.command = myCommandId;
	subscriptions.push(myStatusBarItem);

	// register some listener that make sure the status bar 
	// item always up-to-date
	subscriptions.push(vscode.window.onDidChangeActiveTextEditor(getPercentage)); // listen for chaged file/tab
    subscriptions.push(vscode.window.onDidChangeTextEditorVisibleRanges(getPercentage)); // listen for scroll action
    subscriptions.push(vscode.window.onDidChangeTextEditorSelection(getPercentage)); // listen for cursor change


	// update status bar item once at start
	getPercentage();
}

function getPercentage(): void {
    // get config
    const config = vscode.workspace.getConfiguration();
    const cursorType = config.get<"cursor" | "scrollbar">('scroll-percentage.cursor', 'scrollbar');
    if (vscode.window.activeTextEditor === undefined) {
        // should not be possible
        return;
    }
    const editor = vscode.window.activeTextEditor;
    const maxLines = editor.document.lineCount;
    let currentLine: number;

    switch(cursorType) {
        case "cursor":
            currentLine = Math.max(...editor.selections.map((selection) => selection.end.line));
            break;
        case "scrollbar":
            currentLine = editor.visibleRanges[0].end.line;
            break;
    }
    currentLine += 1; // those lines for some resone starts counting from zero instead of 1
    myStatusBarItem.text = `${Math.round(currentLine/maxLines*100)}%`;
    myStatusBarItem.show();
}
