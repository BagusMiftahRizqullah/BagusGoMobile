export type OCRResult = { text: string }

export async function recognizeText(uri: string): Promise<OCRResult> {
  try {
    const mod = await import('expo-mlkit-ocr') as any
    const result = await mod.default.recognizeText(uri)
    const text: string = typeof result?.text === 'string' ? result.text : ''
    return { text }
  } catch {
    return { text: '' }
  }
}
