export interface Stream {
  read(): Promise<string|null>;
}
