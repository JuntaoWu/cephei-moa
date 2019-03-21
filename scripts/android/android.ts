import * as fs from 'fs';
import * as path from 'path';
export class AndroidPlugin implements plugins.Command {

    constructor() {
    }
    async onFile(file: plugins.File) {
        if (file.extname == '.js') {
            const filename = file.origin;

            if (filename == 'libs/modules/photon/photon.js') {
                let content = file.contents.toString();
                content = content.replace(/ev\.(wasClean|code|reason)/g, `ev&&ev.$1`);
                file.contents = new Buffer(content);
            }
            else if(filename == 'libs/modules/photon/photon.min.js') {
                let content = file.contents.toString();
                content = content.replace(/(.)\.(wasClean|code|reason)/g, `$1&&$1.$2`);
                file.contents = new Buffer(content);
            }
        }
        return file;
    }

    async onFinish(commandContext: plugins.CommandContext) {

    }
}