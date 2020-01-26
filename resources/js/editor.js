const Editor = require('@editorjs/editorjs');
const Header = require('@editorjs/header');
const List = require('@editorjs/list');
const Paragraph = require('@editorjs/paragraph');
// const Table = require('@editorjs/table');
const Embed = require('@editorjs/embed');
const SimpleImage = require('@editorjs/simple-image');
// const ImageTool = require('@editorjs/image');
// const LinkTool = require('@editorjs/link');
const Checklist = require('@editorjs/checklist');
const Quote = require('@editorjs/quote');
const Marker = require('@editorjs/marker');
// const Warning = require('@editorjs/warning');


IWORDS.editors.editNoteEditor = (function () {

    let editor = null;

    const init = (data = null) => {

        const holderElement = document.querySelector('#editorjs');

        if (holderElement) {

            editor = new Editor({
                holderId: 'editorjs',
                autofocus: true,
                placeholder: 'To jest miejsce, gdzie możesz pisać. Na przykład możesz pisać zdania lub teksty, które pomogą Ci lepiej opanować wyrazenia',
                tools: {
                    header: Header,
                    image: SimpleImage,
                    embed: {
                        class: Embed,
                        inlineToolbar: false,
                        config: {
                            services: {
                                youtube: true,
                                coub: true
                            }
                        }
                    },
                    list: List,
                    // table: Table,
                    // paragraph: Paragraph,
                    paragraph: Paragraph,
                    checklist: Checklist,
                    quote: Quote,
                    Marker,
                    // warning: Warning
                },
                data: parseData(data)
            });

        }

    };


    const getEditor = () => editor;

    const toJSON = () => new Promise((resolve, reject) => {
        editor.save()
            .then(data => {
                try {
                    const result = JSON.stringify(data);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            })
            .catch(reject);
    });

    const parseData = data => {

        try {
            console.log(JSON.parse(data.replace(/&quot;/g,'"')));
            return JSON.parse(data.replace(/&quot;/g,'"'));
        } catch (e) {
            return {};
        }

    };

    return {
        init,
        getEditor,
        toJSON
    }




})();
