export interface SourcemapCopyConfiguration {
    rootToDist: string;
    distSource: string,
    rootToDistSrc: string;
    allowedFileExtension: string;
    excluded: Array<string>;
    utilsDirectory: string;
    utilsToRoot: string;
};
