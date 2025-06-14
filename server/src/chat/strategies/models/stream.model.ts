export interface AIResponseStreamModel {
  text?: string;
  promptTokenCount?: number;
  completionTokenCount?: number;
  isFinal?: boolean;
}
