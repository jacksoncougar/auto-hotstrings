'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "auto-replace-text" is now active!');

    let hotString = new HotString();
    let controller = new ReplacementController(hotString);
    context.subscriptions.push(controller);

}

// this method is called when your extension is deactivated
export function deactivate() {
}

class HotString {
    update() {
        let editor = vscode.window.activeTextEditor

        if (!editor) return;

        let document = editor.document;

        if (document.languageId == "asciidoc") {


            let hotstring: [RegExp, string][] = [];
            hotstring.push([/ (\w)(\d|[nijk]) /g, " $1_$2 "]);
            hotstring.push([/ p(\w) /g, " p($1) "]);
            hotstring.push([/ p(\w)(\d|[nijk]) /g, " p($1_$2) "]);
            hotstring.push([/ log(\d) /g, " log_$1 "]);
            hotstring.push([/ ccM /g, " cc \"M\" "]);


            let text = document.getText() || "";
            let item: [RegExp, string] | undefined;
            var match: RegExpExecArray | null;
            while ((item = hotstring.pop()) != undefined)
                while (match = item["0"].exec(text)) {


                    let start = document.positionAt(match.index);
                    let end = document.positionAt(match.index + match[0].length + 1);
                    let replacement = item["1"];

                    editor.edit(
                        edit => {
                            if (match) {
                                let r = replacement
                                .replace(/\$1/g, match[1])
                                .replace(/\$2/g, match[2])
                                .replace(/\$3/g, match[3])
                                .replace(/\$4/g, match[4]);

                                edit.replace(
                                    new vscode.Range(start, end),
                                    r    
                                );
                            }
                        }).then((success) => {
                            if (success && editor)
                                editor.selection = new vscode.Selection(editor.selection.active, editor.selection.active);
                        })


                }
        }
    }
}


class ReplacementController {

    private disposable: vscode.Disposable;
    private hotString: HotString

    constructor(hotString: HotString) {

        let subscriptions: vscode.Disposable[] = [];
        vscode.window.onDidChangeTextEditorSelection(this.update, this, subscriptions);

        this.disposable = vscode.Disposable.from(...subscriptions);
        this.hotString = hotString;
    }

    dispose() {
        this.disposable.dispose();
    }

    update() {
        this.hotString.update();
        return;
    }
}