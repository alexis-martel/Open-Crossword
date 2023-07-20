// Decompresses a string
export default async function decompressAndDecode(encodedString) {
  const decoder = new TextDecoder();

  // Decode the URI-encoded compressed data
  const decodedData = atob(decodeURIComponent(encodedString));

  // Convert the decoded data to a Uint8Array
  const compressedData = new Uint8Array(
    decodedData.split("").map((c) => c.charCodeAt(0)),
  );

  // Create a ReadableStream from the compressed data
  const compressedStream = new ReadableStream({
    start(controller) {
      controller.enqueue(compressedData);
      controller.close();
    },
  });

  // Decompress the ReadableStream using the gzip algorithm
  const decompressedStream = compressedStream.pipeThrough(
    new DecompressionStream("deflate"),
  );

  // Read the decompressed data from the stream
  const reader = decompressedStream.getReader();

  let decompressedData = "";
  let result;

  while ((result = await reader.read())) {
    if (result.done) {
      return decompressedData;
    } else {
      decompressedData += decoder.decode(result.value);
    }
  }
}
