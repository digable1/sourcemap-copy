import { parentPath } from '../sourcemap-copy';

export function removeParentPaths(source: string): string {
    let currentSource = source;
    let parentPathCount = 0;

    while (currentSource.startsWith(parentPath)) {
        currentSource = currentSource.substring(parentPath.length);
        ++parentPathCount;
    }

    return currentSource;
}
