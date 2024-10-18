// transcribe.ts

let ws: WebSocket | null = null;
let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let transcriptCallback: ((transcript: string) => void) | null = null;

export async function startTranscription(onTranscript: (transcript: string) => void) {
  transcriptCallback = onTranscript;

  // Establish WebSocket connection to the Deepgram endpoint
  ws = new WebSocket('ws://localhost:4000/deepgram');
  ws.binaryType = 'arraybuffer';

  ws.addEventListener('open', async () => {
    console.log('WebSocket connection established');

    // Access the microphone
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      await startAudioProcessing(mediaStream);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Microphone access is required for transcription.');
    }
  });

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.transcript) {
      // Handle the transcript
      console.log('Transcript:', data.transcript);
      // Use the callback to send transcript back to the component
      if (transcriptCallback) {
        transcriptCallback(data.transcript);
      }
    }
  });

  ws.addEventListener('close', () => {
    console.log('WebSocket connection closed');
  });

  ws.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });
}

async function startAudioProcessing(stream: MediaStream) {
  audioContext = new window.AudioContext();

  // Add the worklet module
  await audioContext.audioWorklet.addModule('src/api/recorderWorkletProcessor.js');

  const source = audioContext.createMediaStreamSource(stream);

  const processor = new AudioWorkletNode(audioContext, 'recorder-worklet-processor');

  source.connect(processor);
  processor.connect(audioContext.destination);

  processor.port.onmessage = (event) => {
    const audioData = event.data;
    // Send audio data over WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(audioData);
    }
  };
}

export function stopTranscription() {
  // Stop audio processing
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  // Close the WebSocket connection
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.close();
    ws = null;
  }
  transcriptCallback = null;
}
