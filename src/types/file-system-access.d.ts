interface FileSystemHandlePermissionDescriptor {
  mode?: "read" | "readwrite";
}

interface FileSystemDirectoryHandle {
  queryPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
  requestPermission(
    descriptor?: FileSystemHandlePermissionDescriptor,
  ): Promise<PermissionState>;
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<FileSystemDirectoryHandle>;
  getFileHandle(
    name: string,
    options?: { create?: boolean },
  ): Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: Blob | string): Promise<void>;
  close(): Promise<void>;
}

interface Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}
