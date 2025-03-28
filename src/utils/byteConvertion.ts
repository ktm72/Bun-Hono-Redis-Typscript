function formatSize(bytes: number): string {
  const KB = bytes / 1024;
  const MB = KB / 1024;
  const GB = MB / 1024;

  return GB >= 1
    ? `${GB.toFixed(2)} GB`
    : MB >= 1
    ? `${MB.toFixed(2)} MB`
    : `${KB.toFixed(2)} KB`;
}

// Convert bytes to KB (1 KB = 1024 bytes)

export default formatSize;
