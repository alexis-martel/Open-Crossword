// Compresses a string
export default async function compressAndEncode(inputString) {
  const encoder = new TextEncoder();

  // Create a ReadableStream from the input string
  const inputReadableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(inputString));
      controller.close();
    },
  });

  // Compress the ReadableStream using the gzip algorithm
  const compressedStream = inputReadableStream.pipeThrough(
    new CompressionStream("deflate"),
  );

  // Read the compressed data from the stream
  const reader = compressedStream.getReader();

  let compressedData = new Uint8Array();
  let result;

  while ((result = await reader.read())) {
    if (result.done) {
      // Encode the compressed data as a URI component
      const encodedData = encodeURIComponent(
        btoa(String.fromCharCode(...compressedData)),
      );

      return encodedData;
    } else {
      compressedData = new Uint8Array([...compressedData, ...result.value]);
    }
  }
}
