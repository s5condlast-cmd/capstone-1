export interface WhisperResponse {
  text: string;
  language?: string;
}

export async function transcribeWithWhisper(
  audioBlob: Blob,
  apiKey: string,
  language: string = "en"
): Promise<WhisperResponse> {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-large-v3");
  formData.append("language", language);

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Whisper API error");
  }

  const data = await response.json();
  return {
    text: data.text || "",
    language: data.language,
  };
}
