export interface MessageCreate {
  context_id?: number;
  tag: string;
  tts_yn?: "Y" | "N";
  ephemeral_yn?: "Y" | "N";
}
