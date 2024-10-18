declare abstract class AudioWorkletProcessor {
    readonly port: MessagePort;
    constructor();
  
    process(
      inputs: Float32Array[][],
      outputs: Float32Array[][],
      parameters: Record<string, Float32Array>
    ): boolean;
  }
  
  declare var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor;
    new (): AudioWorkletProcessor;
  };
  
  declare function registerProcessor(
    name: string,
    processorCtor: { new (): AudioWorkletProcessor }
  ): void;