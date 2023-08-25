import * as fs from 'fs';

import { configuration, sourcemapCopyParameters, parentPath } from '../sourcemap-copy';
import { removeParentPaths } from './remove-parent-paths';

export function changeMapSourcesPath(mapPath: string, newSource = configuration.distSource): Object {
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
