
class JSONNode extends CodeNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        code: "",
        settings: {
            language: "json",
            libURL: "https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.62.3/mode/javascript/javascript.min.js",
            extension: "json",
            showHint: true,
            versions: ["local node", "global"],
            showHintFunction: `var WORD = /[\\w$]+/, RANGE = 500;
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
            }`
        },
        saved: undefined,
        saveData: undefined,
    }

    static SAVE_PROPERTIES = [];


    constructor(configuration = JSONNode.DEFAULT_CONFIGURATION){
        configuration = {...JSONNode.DEFAULT_CONFIGURATION, ...configuration}
        configuration.settings =  {...JSONNode.DEFAULT_CONFIGURATION.settings, ...configuration.settings}
        super(configuration);
    }


    onClickRun(){
        this.eval(this.code);
    }

    eval(js){
        let object = JSON.parse(js);
        if(this.versionDropdown.value === "global"){
            for(let key in object) {
                globalThis[key] = object[key];
            }
        } else {
            for(let key in object) {
                this[key] = object[key];
            }
        }
    }


}


function createJSONNode(name = '', code = '', settings=undefined) {
    return new JSONNode({
        name,
        code,
        settings
    });
}