import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'ts-command-line-args';
import { changeMapSourcesPath } from './sourcemap-copy_support/change-map-sources-path';
import { findMapFiles } from './sourcemap-copy_support/find-map-files';
import { copySources} from './sourcemap-copy_support/copy-sources';
import { readConfiguration } from './sourcemap-copy_support/read-configuration';
import { SourcemapCopyConfiguration } from './sourcemap-copy_support/schemas/sourcemap-copy-configuration';
import { SourcemapCopyParameters } from './sourcemap-copy_support/schemas/sourcemap-copy-parameters';

export const parentPath = '../';

export const sourcemapCopyParameters = parse<SourcemapCopyParameters>({
    quiet: { type: Boolean, optional: true, alias: 'q', description: 'Suppresses status/log messages' },
    help: { type: Boolean, optional: true, alias: 'h', description: 'Help' }
},
{
    helpArg: 'help',
    headerContentSections: [{ header: 'Sourcemap Copy', content: 'Command to copy source files to \'dest\' location for use cases where original locations get in the way'}],
    footerContentSections: [{ header: '(c) digable1', content: 'Open Source License (TBD - likely Apache 2' }]
});


let configuration: SourcemapCopyConfiguration = {} as SourcemapCopyConfiguration;
export function getConfiguration(): SourcemapCopyConfiguration {
    return configuration;
}
export function setConfiguration(newConfiguration: SourcemapCopyConfiguration): void {
    configuration = newConfiguration;
}
export class Configuration {
    private static readonly _configuration: SourcemapCopyConfiguration = {} as SourcemapCopyConfiguration;
    static get configuration(): SourcemapCopyConfiguration {
        return Configuration._configuration;
    }
    static set configuration(newConfiguration: SourcemapCopyConfiguration) {
        (Configuration._configuration as SourcemapCopyConfiguration) = newConfiguration;
    }
}

export function copySourcemap(): void {
    const cwd = process.cwd();
    setConfiguration(readConfiguration());
    const utilsConfiguration = getConfiguration().utilsDirectory === '.' ? '' : getConfiguration().utilsDirectory;
    if (cwd.indexOf(utilsConfiguration) < 0) {
        console.error(`This must be run in the ${getConfiguration().utilsDirectory} directory`);
        process.exit(1);
    }
    process.chdir(path.resolve(getConfiguration().utilsToRoot));
    const originalDirectory = process.cwd();

    if (!sourcemapCopyParameters.quiet) {
        console.log(`Syncing sourcemaps:`);
        console.log(`    Original directory  : ${originalDirectory}`);
        console.log(`    Desination directory: ${originalDirectory}/${getConfiguration().rootToDistSrc}`);
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

copySourcemap();
