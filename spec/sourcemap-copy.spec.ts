import { SourcemapCopyConfiguration } from '../utils/sourcemap-copy/schemas/sourcemap-copy-configuration';

describe(`Should run tool 'sourcemap-copy.ts correctly`, () => {
    it(`Should run blank test`, () => {
        const configuration = SourcemapCopyCopyConfigurationFactory();
    });
});

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
