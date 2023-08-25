import * as fs from 'fs';
import * as path from 'path';
import { getConfiguration } from '../sourcemap-copy';
import { exitIfDistDirectoryDoesNotExist } from './exit-if-dist-directory-does-not-exist';
import { isDirectoryExcluded } from './is-directory-excluded';

export function findMapFiles(directoryParm?: string, fileExtensionFilterParm?: string): Array<fs.Dirent> {
    const temp = getConfiguration();
    const directory = directoryParm ? directoryParm : getConfiguration().rootToDist;
    const fileExtensionFilter = fileExtensionFilterParm ? fileExtensionFilterParm : getConfiguration().allowedFileExtension;
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
