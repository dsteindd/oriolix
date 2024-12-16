
export const getFileExtension = (fileName: string): string | undefined => {
    return fileName.split(".").pop()?.toLowerCase();
}