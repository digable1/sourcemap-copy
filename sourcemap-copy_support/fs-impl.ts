import * as fs from 'fs';

type MkdirSyncImplType = (path: fs.PathLike, options: fs.MakeDirectoryOptions & { recursive: true; }) => string | undefined;
type CopyFileImplType = (source: fs.PathLike, dest: fs.PathLike, mode: number) => void;
type ReadFileSyncImplType = (path: fs.PathOrFileDescriptor, options: | { encoding: BufferEncoding; flag?: string | undefined; } | BufferEncoding) => string;
type WriteFileSyncImplType = (file: fs.PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions | undefined) => void;
type ExistsSyncImplType = (path: fs.PathLike) => boolean;
type ReaddirSyncImplType = (path: fs.PathLike, options: fs.ObjectEncodingOptions & { withFileTypes: true, recursive?: boolean | undefined }) => Array<fs.Dirent>;

export let mkdirSyncImpl: MkdirSyncImplType = fs.mkdirSync as MkdirSyncImplType;
export let copyFileSyncImpl: CopyFileImplType = fs.copyFileSync as CopyFileImplType;
export let readFileSyncImpl: ReadFileSyncImplType = fs.readFileSync as ReadFileSyncImplType;
export let writeFileSyncImpl: WriteFileSyncImplType = fs.writeFileSync as WriteFileSyncImplType;
export let existsSyncImpl: ExistsSyncImplType = fs.existsSync as ExistsSyncImplType;
export let readdirSyncImpl: ReaddirSyncImplType = fs.readdirSync as ReaddirSyncImplType;

export function setMkdirSyncImpl(func: MkdirSyncImplType) {
    mkdirSyncImpl = func;
}
export function setCopyFileSyncImpl(func: CopyFileImplType) {
    copyFileSyncImpl = func;
}
export function setReadFileSyncImpl(func: ReadFileSyncImplType) {
    readFileSyncImpl = func;
}
export function setWriteReadFileSyncImpl(func: WriteFileSyncImplType) {
    writeFileSyncImpl = func;
}
export function setExistsSyncImpl(func: ExistsSyncImplType) {
    existsSyncImpl = func;
}
export function setReaddirSyncImpl(func: ReaddirSyncImplType) {
    readdirSyncImpl = func;
}
