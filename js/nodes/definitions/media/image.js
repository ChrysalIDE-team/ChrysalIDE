
class ImageNode extends WindowedNode {
    static DEFAULT_CONFIGURATION = {
        name: "",
        imageSrc: "",
        sx: undefined,
        sy: undefined,
        x: undefined,
        y: undefined,
        isUrl: false,
        saved: undefined,
        saveData: undefined,
    }
    static SAVE_PROPERTIES = ['imageUrl', 'imageBlob', 'isImageNode'];
    // constructor(name = '', content = undefined, imageSrc = '', sx = undefined, sy = undefined, x = undefined, y = undefined, isUrl = false){


    constructor(configuration = ImageNode.DEFAULT_CONFIGURATION){
        configuration = {...ImageNode.DEFAULT_CONFIGURATION, ...configuration}
        if (!configuration.saved) {// Create ImageNode
            if (configuration.isUrl) {
                super({ title: configuration.name, content: [ImageNode._getContentElement(configuration.imageSrc)], ...WindowedNode.getNaturalScaleParameters() });
            } else {
                if (!(configuration.imageSrc instanceof HTMLImageElement) || !configuration.imageSrc.src) {
                    console.error('createImageNode was called without a valid image element or src');
                    return null;
                }
                super({ title: configuration.name, content: [configuration.imageSrc], ...WindowedNode.getNaturalScaleParameters() });
            }
        } else {// Restore ImageNode
            configuration.imageSrc = configuration.saveData.json.imageUrl;
            super({title: configuration.name, content: [ImageNode._getContentElement(configuration.imageSrc)], scale: true, saved: true, saveData: configuration.saveData})
        }

        this.diagram.addNode(this);
        this._initialize(configuration.name, configuration.imageSrc, configuration.isUrl, configuration.saved);
    }


    static _getContentElement(imageSrc){
        let img = document.createElement('img');
        img.src = imageSrc;
        return img;
    }



    get imageBlob() {
        return this._imageBlob;
    }

    set imageBlob(v) {
        if(v === null || !(v instanceof Blob)) return;
        const setProperty = () => {
            this._imageBlob = v;
            const imageSrc = this.innerContent.querySelector("img[src]");
            let reader = new FileReader();
            reader.onload = function (e) {
                // this.imageUrl = e.target.result;
                this.imageData = e.target.result;
                imageSrc.src = e.target.result;
            }
            reader.readAsDataURL(v);
            // this.imageUrl = URL.createObjectURL(v);
            //
            // imageSrc.src = this.imageUrl
            // convertImageToBase64(imageSrc, base64String => {
            //     this.imageData = base64String;
            //     this.imageUrl =  base64String;
            //     imageSrc.src = base64String;
            //
            //     console.log("Image converted to base64", base64String);
            // });
        }
        if(this.initialized){
            setProperty();
        } else {
            this.addAfterInitCallback(setProperty);
        }
    }

    setMainContentFile(filePath, fileName){
        this.files.push({ key: "imageBlob", path: filePath, name: fileName, autoLoad: false, autoSave: false})
    }

    _initialize(name, imageSrc, isUrl, saved){
        if(!saved){
            const setImageBlob = () => {
                fetch(this.innerContent.querySelector("img[src]").src)
                    .then(response => response.blob()
                        .then((blob) =>  this._imageBlob = blob));
            }
            if(isUrl){
                this.isImageNode = true;
                this.imageUrl = imageSrc;
                this._imageBlob = null;
                console.log("URL Found", this.imageUrl);
                // setImageBlob();
            }else{
                this.isImageNode = true;
                this.imageData = null; // Placeholder for base64 data
                this.imageUrl = null;
                // Determine whether the source is a blob URL or a Data URL (base64)
                if (imageSrc.src.startsWith('blob:')) {
                    // Convert blob URL to base64 because the OpenAI API cannot access blob URLs
                    convertImageToBase64(imageSrc.src, base64String => {
                        this.imageData = base64String;
                        console.log("Image converted to base64", base64String);
                        setImageBlob();
                    });
                } else {
                    // If it's not a blob, we can use the src directly (data URL or external URL)
                    // this.imageUrl = imageSrc.src;
                    this.imageData =  imageSrc.src;
                    console.log("Image URL or Data URL found", imageSrc.src);
                    setImageBlob();
                }
            }
        }
        this.afterInit();
    }

    afterInit() {
        super.afterInit();
    }


}

function createImageNode(imageSrc, title, isUrl = false) {
    return new ImageNode({
        name: title,
        imageSrc: imageSrc,
        isUrl: isUrl
    });
    // return new ImageNode(title, undefined, imageSrc, undefined,undefined,undefined,undefined, isUrl);
}