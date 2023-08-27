import { SourcemapCopyConfiguration } from '../sourcemap-copy_support/schemas/sourcemap-copy-configuration';
import { readConfiguration } from '../sourcemap-copy_support/read-configuration';
import { copySources } from '../sourcemap-copy_support/copy-sources';
import { setMkdirSyncImpl, setCopyFileSyncImpl } from '../sourcemap-copy_support/copy-sources';
import { setReadFileSyncImpl } from '../sourcemap-copy_support/read-configuration';
import * as fs from 'fs';

describe(`Should run tool 'sourcemap-copy.ts correctly`, () => {
    it(`Should read configuration correctly from JSON in mock file`, () => {
        setReadFileSyncImpl(fsMockReadFileSync);

        expect(readConfiguration()).toEqual(SourcemapCopyCopyConfigurationFactory());

        function fsMockReadFileSync(dummySourceFile: fs.PathOrFileDescriptor, options: | { encoding: BufferEncoding; flag?: string | undefined; } | BufferEncoding): string {
            return SourcemapCopyCopyConfigurationFactoryString();
        }
    });

    it(`Should copy from the right sources to the right destinations`, () => {
        const dummyMapDefinition:any = {
            sources: [
                '../dummySource'
            ]
        };
        const dummyDistToRoot = 'dummyDistToRoot';
        const dummyNewSource = 'dummyNewSource';

        setCopyFileSyncImpl(fsMockCopyFileSync);
        setMkdirSyncImpl(fsMockMkdirSyncImpl);

        copySources(dummyMapDefinition, dummyDistToRoot, dummyNewSource);

        function fsMockMkdirSyncImpl(dummyDistDestpath: fs.PathLike, options: fs.MakeDirectoryOptions & { recursive: true; }): string | undefined {
            expect(dummyDistDestpath).toEqual(`${dummyDistToRoot}/${dummyNewSource}`);
            expect(dummyNewSource).toEqual(`${dummyNewSource}`);
            return undefined;
        }
        function fsMockCopyFileSync(dummySourceFile: fs.PathLike, dummyDestFile: fs.PathLike, dummyMode = -1): void {
            const firstSource = dummyMapDefinition.sources[0] as string;
            const dummySource = firstSource.substring(firstSource.lastIndexOf('/') + 1);
            expect(dummySourceFile).withContext('dummySourceFile').toEqual(`${dummySource}`);
            expect(dummyDestFile).withContext('dummyDestFile').toEqual(`${dummyDestFile}`);
        }
    });
});

function SourcemapCopyCopyConfigurationFactoryString(): string {
    return JSON.stringify(SourcemapCopyCopyConfigurationFactory());
}
function SourcemapCopyCopyConfigurationFactory(): SourcemapCopyConfiguration {
    const testSourcemapCopyConfiguration = {
        rootToDist: 'testRootToDist',
        distSource: 'testDistSource',
        rootToDistSrc: 'testRootToDistSrc',
        allowedFileExtension: 'testRootToDistSrc',
        excluded: [ 'testExcluded' ],
        utilsDirectory: 'testUtilsDirectory',
        utilsToRoot: 'testUtilsToRoot'
    };
    return {...testSourcemapCopyConfiguration};
}
