import * as fs from 'fs';
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

type MkdirSyncImplType = (path: fs.PathLike, options: fs.MakeDirectoryOptions & { recursive: true; }) => string | undefined;
type CopyFileImplType = (source: fs.PathLike, dest: fs.PathLike, mode: number) => void;
let mkdirSyncImpl: MkdirSyncImplType = fs.mkdirSync as MkdirSyncImplType;
let copyFileSyncImpl: CopyFileImplType = fs.copyFileSync as CopyFileImplType;

export function setMkdirSyncImpl(func: MkdirSyncImplType) {
    mkdirSyncImpl = func;
}
export function setCopyFileSyncImpl(func: CopyFileImplType) {
    copyFileSyncImpl = func;
}
