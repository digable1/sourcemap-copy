import * as fs from 'fs';
import { mkdirSyncImpl, copyFileSyncImpl} from './fs-impl'
import { configuration } from '../sourcemap-copy';
import { removeParentPaths } from './remove-parent-paths';

export function copySources(mapDefinition: any, distLocation = configuration.rootToDist, newSource = configuration.distSource): void {
    const sources = mapDefinition.sources as Array<string>;

    sources.forEach((source) => {
        const sourcePath = `${removeParentPathsAndDistSourceAddParentPath(source)}`;
        const destinationPath = `${newSource}/${removeParentPaths(sourcePath)}`;
        const distDestinationPath = `${distLocation}/${destinationPath}`;
        mkdirSyncImpl(getPath(distDestinationPath), { recursive: true });
        copyFileSyncImpl(sourcePath, distDestinationPath, fs.constants.COPYFILE_FICLONE);
    });

    function removeParentPathsAndDistSourceAddParentPath(sourceParam: string): string {
        const sourceWithoutParents = removeParentPaths(sourceParam);
        const sourceWithoutSourcePrefixIndex = sourceWithoutParents.indexOf('/');
        return sourceWithoutParents.substring(sourceWithoutSourcePrefixIndex + 1);
    }

    function getPath(sourceParam: string): string {
        const lastUnixSeparatorIndex = sourceParam.lastIndexOf('/');
        const lastDosSeparatorIndex = sourceParam.lastIndexOf('\\');
        let lastSeparatorIndex = 0;
        if (lastUnixSeparatorIndex > -1 && lastDosSeparatorIndex > -1) {
            lastSeparatorIndex = lastUnixSeparatorIndex < lastDosSeparatorIndex ? lastUnixSeparatorIndex : lastDosSeparatorIndex;
        } else if (lastUnixSeparatorIndex > -1 || lastDosSeparatorIndex > -1){
            lastSeparatorIndex = lastUnixSeparatorIndex > -1  ? lastUnixSeparatorIndex : lastDosSeparatorIndex;
        }
        const sourcePath = sourceParam.substring(0, lastSeparatorIndex);
        return sourcePath;
    }
}
