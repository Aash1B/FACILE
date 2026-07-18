export type LocalVoiceRecording = {
  stop: () => Promise<Blob>;
};

const TARGET_SAMPLE_RATE = 16_000;

function encodeWave(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index++) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeText(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, "WAVE");
  writeText(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }
  return buffer;
}

function downsample(samples: Float32Array, sourceRate: number) {
  if (sourceRate === TARGET_SAMPLE_RATE) return samples;
  const ratio = sourceRate / TARGET_SAMPLE_RATE;
  const output = new Float32Array(Math.round(samples.length / ratio));
  for (let outputIndex = 0; outputIndex < output.length; outputIndex++) {
    const start = Math.round(outputIndex * ratio);
    const end = Math.min(Math.round((outputIndex + 1) * ratio), samples.length);
    let total = 0;
    for (let sourceIndex = start; sourceIndex < end; sourceIndex++) total += samples[sourceIndex];
    output[outputIndex] = total / Math.max(1, end - start);
  }
  return output;
}

export async function startLocalVoiceRecording(): Promise<LocalVoiceRecording> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const context = new AudioContextClass();
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(4096, 1, 1);
  const chunks: Float32Array[] = [];

  processor.onaudioprocess = (event: AudioProcessingEvent) => {
    chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));
  };
  source.connect(processor);
  processor.connect(context.destination);

  return {
    stop: async () => {
      processor.disconnect();
      source.disconnect();
      stream.getTracks().forEach((track) => track.stop());
      await context.close();

      const length = chunks.reduce((total, chunk) => total + chunk.length, 0);
      const merged = new Float32Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      if (merged.length < context.sampleRate * 0.5) {
        throw new Error("The recording was too short. Hold the microphone and speak a complete phrase.");
      }

      // Remove long leading/trailing silence. Silence makes small Whisper models
      // invent words, especially for very short voice-search recordings.
      const silenceThreshold = 0.008;
      let speechStart = 0;
      let speechEnd = merged.length - 1;
      while (speechStart < merged.length && Math.abs(merged[speechStart]) < silenceThreshold) speechStart++;
      while (speechEnd > speechStart && Math.abs(merged[speechEnd]) < silenceThreshold) speechEnd--;
      if (speechStart >= merged.length) {
        throw new Error("No clear speech was detected. Move closer to the microphone and try again.");
      }
      const padding = Math.round(context.sampleRate * 0.2);
      const trimmed = merged.slice(
        Math.max(0, speechStart - padding),
        Math.min(merged.length, speechEnd + padding)
      );
      if (trimmed.length < context.sampleRate * 0.35) {
        throw new Error("Please speak a slightly longer search phrase.");
      }

      const samples = downsample(trimmed, context.sampleRate);
      return new Blob([encodeWave(samples, TARGET_SAMPLE_RATE)], { type: "audio/wav" });
    },
  };
}
