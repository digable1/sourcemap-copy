import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'ts-command-line-args';

const configurationFile = './sourcemap-copy.json';
const parentPath = '../';

interface SourcemapCopyParameters {
    quiet?: boolean;
    help?: boolean;
}

export const sourcemapCopyParameters = parse<SourcemapCopyParameters>({
    quiet: { type: Boolean, optional: true, alias: 'q', description: 'Suppresses status/log messages' },
    help: { type: Boolean, optional: true, alias: 'h', description: 'Help' }
},
{
    helpArg: 'help',
    headerContentSections: [{ header: 'Sourcemap Copy', content: 'Command to copy source files to \'dest\' location for use cases where original locations get in the way'}],
    footerContentSections: [{ header: '(c) digable1', content: 'Open Source License (TBD - likely Apache 2' }]
});

export interface SourcemapCopyConfiguration {
    rootToDist: string;
    distSource: string,
    rootToDistSrc: string;
    allowedFileExtension: string;
    excluded: Array<string>;
    utilsDirectory: string;
    utilsToRoot: string;
}

let configuration: SourcemapCopyConfiguration;

export function copySourcemap(): void {
    const cwd = process.cwd();
    configuration = readConfiguration();
    if (cwd.indexOf(configuration.utilsDirectory) < 0) {
        console.error(`This must be run in the ${configuration.utilsDirectory} directory`);
        process.exit(1);
    }
    process.chdir(path.resolve(configuration.utilsToRoot));
    const originalDirectory = process.cwd();

    if (!sourcemapCopyParameters.quiet) {
        console.log(`Syncing sourcemaps:`);
        console.log(`    Original directory  : ${originalDirectory}`);
        console.log(`    Desination directory: ${originalDirectory}${configuration.rootToDistSrc}`);
        console.log();
    }

    findMapFiles().forEach((dirEntry) => {
        const mapObject = changeMapSourcesPath(`${dirEntry.name}`);
        copySources(mapObject);
        fs.writeFileSync(`${dirEntry.name}`, JSON.stringify(mapObject), { encoding: 'utf-8' });
    });
    process.chdir(cwd);
    if (!sourcemapCopyParameters.quiet) {
        console.log();
        console.log(`Done`);
        console.log();
    }
}


function changeMapSourcesPath(mapPath: string, newSource = configuration.distSource): Object {
    const encoding = 'utf-8';
    const contents = fs.readFileSync(mapPath, { encoding: encoding });
    const mapDefinition = JSON.parse(contents);
    const sources = mapDefinition.sources as Array<string> | undefined;

    if (sources && mapPath.indexOf(newSource) < 0) {
        if (!sourcemapCopyParameters.quiet) {
            console.log(`    Map file '${mapPath}':`);
        }
        for (let sourceIndex = 0; sourceIndex < sources.length; ++sourceIndex) {
            const originalSource = sources[sourceIndex];
            if (originalSource.indexOf(newSource) < 0) {
                sources[sourceIndex] = changeSourcePath(sources[sourceIndex], newSource);
            }
            if (!sourcemapCopyParameters.quiet) {
                console.log(`       [original] -> [new]: ${originalSource} -> ${sources[sourceIndex]}`);
            }
        }
    }
    return mapDefinition;

    function changeSourcePath(source: string, newSource: string): string {
        const sourceWithoutParents = removeParentPaths(source);
        const parentPathCount = countParentPaths(source);
        const parentPaths = parentPathCount > 0 ? generateParentPaths(parentPathCount - 1) : '';
        const finalContents = source.indexOf(newSource) < 0 ? `${parentPaths}${newSource}/${sourceWithoutParents}` : source

        return finalContents;
    }

    function countParentPaths(source: string): number {
        let currentSource = source;
        let parentPathCount = 0;
    
        while (currentSource.startsWith(parentPath)) {
            currentSource = currentSource.substring(parentPath.length);
            ++parentPathCount;
        }
    
        return parentPathCount;
    }

    function generateParentPaths(count: number): string {
        let parentPaths = "";
        for (let pathIndex = 0; pathIndex < count; ++pathIndex) {
            parentPaths += parentPath;
        }
        return parentPaths;
    }
    
}

function copySources(mapDefinition: any, distLocation = configuration.rootToDist, newSource = configuration.distSource): void {
    const sources = mapDefinition.sources as Array<string>;

    sources.forEach((source) => {
        const sourcePath = `${removeParentPathsAndDistSourceAddParentPath(source)}`;
        const destinationPath = `${newSource}/${removeParentPaths(sourcePath)}`;
        const distDestinationPath = `${distLocation}/${destinationPath}`;
        fs.mkdirSync(getPath(distDestinationPath), { recursive: true });
        fs.copyFileSync(sourcePath, distDestinationPath, fs.constants.COPYFILE_FICLONE);
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

function exitIfDistDirectoryDoesNotExist(directory: string): void {
    if (!fs.existsSync(directory)) {
        console.error(`Package directory '${directory}' does not exist - ensure it's built before running this tool`);
        process.exit(1);
    }
}

function findMapFiles(directory = configuration.rootToDist, fileExtensionFilter = configuration.allowedFileExtension): Array<fs.Dirent> {
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

function isDirectoryExcluded(directoryParm: string): boolean {
    configuration.excluded.forEach((excludedEntry) => {
        if (excludedEntry.startsWith(directoryParm)) {
            return true;
        }
    });
    return false;
}

function readConfiguration(file = configurationFile): SourcemapCopyConfiguration {
    try {
        return JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' })) as SourcemapCopyConfiguration;
    } catch(e) {
        console.error(`Could not find configuration file '${file}'`);
        console.error(`    Are you in the same directory as this configuration file?`);
        process.exit(1);
    }
}

function removeParentPaths(source: string): string {
    let currentSource = source;
    let parentPathCount = 0;

    while (currentSource.startsWith(parentPath)) {
        currentSource = currentSource.substring(parentPath.length);
        ++parentPathCount;
    }

    return currentSource;
}


copySourcemap();
