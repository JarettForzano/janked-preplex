class RecorderWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs: Float32Array[][]) {
    const input = inputs[0];
    if (input && input[0]) {
      const inputData = input[0];
      const intData = this.convertFloat32ToInt16(inputData);

      // Post the audio data to the main thread
      this.port.postMessage(intData);
    }
    return true;
  }

  convertFloat32ToInt16(buffer: Float32Array) {
    const len = buffer.length;
    const buf = new Int16Array(len);
    for (let i = 0; i < len; i++) {
      let s = Math.max(-1, Math.min(1, buffer[i]));
      buf[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return buf.buffer;
  }
}

registerProcessor('recorder-worklet-processor', RecorderWorkletProcessor);

