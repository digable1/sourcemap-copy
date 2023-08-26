import * as fs from 'fs';
import { SourcemapCopyConfiguration } from './schemas/sourcemap-copy-configuration';

const configurationFile = './sourcemap-copy.json';

export function readConfiguration(file = configurationFile): SourcemapCopyConfiguration {
    try {
        return JSON.parse(readFileSyncImpl(file, { encoding: 'utf-8' })) as SourcemapCopyConfiguration;
    } catch(e) {
        console.error(`Could not find configuration file '${file}'`);
        console.error(`    Are you in the same directory as this configuration file?`);
        console.error(e);
        process.exit(1);
    }
}

type ReadFileSyncImplType = (path: fs.PathOrFileDescriptor, options: | { encoding: BufferEncoding; flag?: string | undefined; } | BufferEncoding) => string;
let readFileSyncImpl: ReadFileSyncImplType = fs.readFileSync as ReadFileSyncImplType;

export function setReadFileSyncImpl(func: ReadFileSyncImplType) {
    readFileSyncImpl = func;
}
