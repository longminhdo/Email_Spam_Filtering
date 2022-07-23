export enum EmailStatus {
  Ham,
  Spam,
}
export type rawEmail = {
  ID: string
  text: string
  status: EmailStatus
}

export type Email = {
  ID: string
  tokenization: string[]
  status: EmailStatus
}
