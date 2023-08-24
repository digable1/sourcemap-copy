import * as fs from 'fs';
import * as path from 'path';
import { exitIfDistDirectoryDoesNotExist, isDirectoryExcluded, configuration } from '../sourcemap-copy';

export function findMapFiles(directory = configuration.rootToDist, fileExtensionFilter = configuration.allowedFileExtension): Array<fs.Dirent> {
    exitIfDistDirectoryDoesNotExist(directory);

    const newDirContents: Array<fs.Dirent> = [];
    if (!isDirectoryExcluded(directory)) {
        const dirContents = fs.readdirSync(`${directory}`, { withFileTypes: true });
        dirContents.forEach((dir) => {
            if (!dir.name.startsWith('.')) {
                if (!isDirectoryExcluded(dir.name)) {
                    if (dir.isDirectory()) {
                        newDirContents.push(...findMapFiles(`${directory}${path.sep}${dir.name}`, fileExtensionFilter));
                    } else {
                        if (dir.name.endsWith(fileExtensionFilter)) {
                            dir.name = `${path.resolve(directory)}/${dir.name}`;
                            newDirContents.push(dir);
                        }
                    }
                }
            }
        })
    }
    return newDirContents;
}
