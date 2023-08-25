import { configuration } from "../sourcemap-copy";

export function isDirectoryExcluded(directoryParm: string): boolean {
    configuration.excluded.forEach((excludedEntry) => {
        if (excludedEntry.startsWith(directoryParm)) {
            return true;
        }
    });
    return false;
}
