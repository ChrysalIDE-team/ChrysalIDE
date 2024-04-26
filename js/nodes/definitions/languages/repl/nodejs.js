class NodeJSTerminalNode extends TerminalNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        settings: {
            language: "javascript",
            lines: [],
            libURL: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/javascript/javascript.min.js",
            extension: "js",
            showHint: true,
            showHintFunction:  `var WORD = /[\\w$]+/, RANGE = 500;
            CodeMirror.registerHelper("hint", "anyword", function(editor, options) {
                var word = options && options.word || WORD;
                var range = options && options.range || RANGE;
                var cur = editor.getCursor(), curLine = editor.getLine(cur.line);
                var end = cur.ch, start = end;
                while (start && word.test(curLine.charAt(start - 1))) --start;
                var curWord = start !== end && curLine.slice(start, end);

                var list = options && options.list || [], seen = {};
                var re = new RegExp(word.source, "g");
                for (var dir = -1; dir <= 1; dir += 2) {
                    var line = cur.line, endLine = Math.min(Math.max(line + dir * range, editor.firstLine()), editor.lastLine()) + dir;
                    for (; line !== endLine; line += dir) {
                        var text = editor.getLine(line), m;
                        while (m = re.exec(text)) {
                            if (line === cur.line && m[0] === curWord) continue;
                            if ((!curWord || m[0].lastIndexOf(curWord, 0) === 0) && !Object.prototype.hasOwnProperty.call(seen, m[0])) {
                                seen[m[0]] = true;
                                list.push(m[0]);
                            }
                        }
                    }
                }
                return {list: list, from: CodeMirror.Pos(cur.line, start), to: CodeMirror.Pos(cur.line, end)};
            });
            CodeMirror.commands.autocomplete = function(cm) {
                cm.showHint({hint: CodeMirror.hint.anyword});
            }`,
            version: "Node.js"
        },
        saved: undefined,
        saveData: undefined
    }

    constructor(configuration = NodeJSTerminalNode.DEFAULT_CONFIGURATION){
        configuration = {...NodeJSTerminalNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.settings = {...NodeJSTerminalNode.DEFAULT_CONFIGURATION.settings, ...configuration.settings}
        configuration.settings.lines = [...NodeJSTerminalNode.DEFAULT_CONFIGURATION.settings.lines, ...configuration.settings.lines]
        super(configuration)
        nodeREPLWebsocket.createREPLRuntime((createdRuntime) => {
            this.runtimeID = createdRuntime.id;
        });
    }

    onEvaluate(code) {
        nodeREPLWebsocket.evalInRuntime(this.runtimeID, code, (result) => {
            if(typeof result === "function") {
                this.terminalPanel.content.addResultLine(result.toString())
            } else if (typeof result === "object") {
                let resultElement =  this.terminalPanel.content.addResultLine("");
                resultElement.id = "evaluation-" + generateUUID()
                let jsonTreeExplorer = new NodeJSObjectUtils(result);
                jsonTreeExplorer.getTree("", 2).then((defaultTree) => {
                    let jsonTreePanel = new ObjectTreePanel( {
                        container: "#" + resultElement.id,
                        treeObject: jsonTreeExplorer,
                        defaultTree // For not awaiting in constructor
                    })
                })
            } else if (typeof result === "string") {
                this.terminalPanel.content.addResultLine(JSON.stringify(result))
            } else {
                this.terminalPanel.content.addResultLine(result)
            }
        })
    }


}

class NodeJSObjectUtils extends ObjectTreeUtils {
    constructor(object) {
        super(object); // Set the root object (top-level Fields/Attributes)
    }
    async getTree(expressionPath, depth){
        if(expressionPath === "" && depth === -1) {
            return this.root;
        } else {
            // Get the starting point;
            let expressions = expressionPath.split(".");
            let root = this.root;
            if(expressionPath !== "") {
                for(let expression of expressions) {
                    root = root[expression];
                }
            }
            if(typeof root !== "object") return root;
            // Helper function to recursively build the tree
            const buildTree = (obj, currentDepth) => {
                if (typeof obj !== "object") {
                    return obj; // Reached a non-object leaf
                }
                if (currentDepth === depth) {
                    if(Array.isArray(obj)) {
                        if(obj.length === 0) return "[ ]"
                        return "[...]";
                    }
                    if(typeof obj === "function") return obj.toString();
                    if(obj === null) return "null"
                    if(obj === undefined) return "undefined"
                    if(obj instanceof HTMLElement) return "<" + obj.tagName.toLowerCase() + "...>"
                    if(Object.keys(obj).length === 0) return "{ }"
                    return "{...}"; // Reached the specified depth
                }
                if(obj instanceof HTMLElement) return "<" + obj.tagName.toLowerCase() + "...>"
                if(typeof obj === "function") return obj.toString();
                let result = Array.isArray(obj) ? [] : {};
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        // Recursively traverse the object tree
                        result[key] = buildTree(obj[key], currentDepth + 1);
                    }
                }
                return result;
            };
            return buildTree(root, 0);
        }
    }
}

function createNodeJSTerminalNode(name = '', settings=undefined) {
    return new NodeJSTerminalNode({
        name,
        settings
    });
}