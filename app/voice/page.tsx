import { VoiceAssistant } from "@/components/voice/VoiceAssistant";

export const metadata = {
  title: "Voice Assistant – LegalSathi AI",
  description: "Talk to a Nepali legal assistant using your voice.",
};

export default function VoicePage() {
  return <VoiceAssistant domain="general" />;
}
