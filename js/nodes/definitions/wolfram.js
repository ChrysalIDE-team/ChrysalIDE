
class WolframNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        wolframData: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        saved: undefined,
        saveData: undefined
    }
    static SAVE_PROPERTIES = ['wolframData'];
    // constructor(name = '', content = undefined, imageSrc = '', sx = undefined, sy = undefined, x = undefined, y = undefined, isUrl = false){


    constructor(configuration = WolframNode.DEFAULT_CONFIGURATION){
        configuration = {...WolframNode.DEFAULT_CONFIGURATION, ...configuration}
        if (!configuration.saved) {// Create WolframNode
            if(!configuration.name) configuration.name = `${configuration.wolframData.reformulatedQuery} - Wolfram Alpha Result`;
            super({ title: configuration.name, content: WolframNode._getContentElement(configuration.wolframData), ...WindowedNode.getNaturalScaleParameters() });
            this.followingMouse = 1;
        } else {// Restore WolframNode
            configuration.wolframData = configuration.saveData.json.wolframData;
            super({ title: configuration.name, content: WolframNode._getContentElement(configuration.wolframData), scale: true, saved: true, saveData: configuration.saveData })
        }
        this.diagram.addNode(this);
        this._initialize(configuration.wolframData, configuration.saved);
    }


    static _getContentElement(wolframData){
        const { pods, reformulatedQuery } = wolframData;
        const table = document.createElement("table");
        table.style = "width: 100%; border-collapse: collapse;";

        for (const pod of pods) {
            const row = document.createElement("tr");

            const titleCell = document.createElement("td");
            titleCell.textContent = pod.title;
            titleCell.style = "padding: 10px; background-color: #222226;";

            const imageCell = document.createElement("td");
            imageCell.style = "padding: 10px; text-align: center; background-color: white";

            for (let i = 0; i < pod.images.length; i++) {
                const imageUrl = pod.images[i];

                const img = document.createElement("img");
                img.alt = `${reformulatedQuery} - ${pod.title}`;
                img.style = "display: block; margin: auto; border: none;";
                img.src = imageUrl;

                imageCell.appendChild(img);
            }

            row.appendChild(titleCell);
            row.appendChild(imageCell);
            table.appendChild(row);
        }
        return [table];
    }


    _initialize(wolframData, saved){
        this.draw();
        if(!saved){
            this.wolframData = wolframData;
        }
        this.mouseAnchor = background.toDZ(new vec2(0, -this.content.offsetHeight / 2 + 6));
        this.afterInit();
    }

    afterInit() {
        super.afterInit();
    }

}

function createWolframNode(name, wolframData){
    return new WolframNode({ name, wolframData })
}

