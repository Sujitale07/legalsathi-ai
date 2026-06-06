class PcmProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0]?.[0];
    if (channel) {
      // Transfer a copy so the main thread owns the buffer
      this.port.postMessage(channel.slice());
    }
    return true;
  }
}

registerProcessor("pcm-processor", PcmProcessor);
