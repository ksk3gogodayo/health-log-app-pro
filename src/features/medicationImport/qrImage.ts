import {
  BinaryBitmap,
  DecodeHintType,
  HybridBinarizer,
  QRCodeReader,
  RGBLuminanceSource,
  ResultMetadataType,
} from "@zxing/library";
import { QrPart } from "./jahis";

export function decodePixels(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
): QrPart {
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < gray.length; i++)
    gray[i] = (rgba[i * 4] + 2 * rgba[i * 4 + 1] + rgba[i * 4 + 2]) / 4;
  const hints = new Map<DecodeHintType, any>([
    [DecodeHintType.CHARACTER_SET, "SJIS"],
    [DecodeHintType.TRY_HARDER, true],
  ]);
  const result = new QRCodeReader().decode(
    new BinaryBitmap(
      new HybridBinarizer(new RGBLuminanceSource(gray, width, height)),
    ),
    hints,
  );
  const meta = result.getResultMetadata();
  const sequence = meta?.get(ResultMetadataType.STRUCTURED_APPEND_SEQUENCE);
  const parity = meta?.get(ResultMetadataType.STRUCTURED_APPEND_PARITY);
  const segments = meta?.get(ResultMetadataType.BYTE_SEGMENTS) as
    | Uint8Array[]
    | undefined;
  const bytes = segments
    ? Uint8Array.from(segments.flatMap((s) => Array.from(s)))
    : undefined;
  // Byte-only structured append may split a Shift-JIS character between symbols.
  const byteOnly =
    bytes && new TextDecoder("shift-jis").decode(bytes) === result.getText();
  return {
    text: result.getText(),
    sequence: typeof sequence === "number" ? sequence : undefined,
    parity: typeof parity === "number" ? parity : undefined,
    bytes: byteOnly ? bytes : undefined,
  };
}
// Native capture keeps camera permission/lifecycle with the browser; no camera stream or upload.
export async function readQrImage(file: File): Promise<QrPart> {
  if (
    !/^image\/(jpeg|png|webp)$/.test(file.type) ||
    file.size > 15 * 1024 * 1024
  )
    throw new Error(
      "15MB以下のJPEG・PNG・WebP画像を選んでください。PDFはQR部分のスクリーンショットで読み込めます。",
    );
  const url = URL.createObjectURL(file);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(
          new Error(
            "画像を開けませんでした。スクリーンショットでお試しください。",
          ),
        );
      image.src = url;
    });
    if (
      !image.naturalWidth ||
      !image.naturalHeight ||
      image.naturalWidth * image.naturalHeight > 40000000
    )
      throw new Error("画像が大きすぎます。QR部分を切り取ってください。");
    const canvas = document.createElement("canvas");
    const ratio = Math.min(
      1,
      2400 / Math.max(image.naturalWidth, image.naturalHeight),
    );
    canvas.width = Math.round(image.naturalWidth * ratio);
    canvas.height = Math.round(image.naturalHeight * ratio);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("このブラウザでは画像を読み込めません。");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    try {
      return decodePixels(
        context.getImageData(0, 0, canvas.width, canvas.height).data,
        canvas.width,
        canvas.height,
      );
    } catch {
      throw new Error(
        "QRを読み取れませんでした。QRを1つずつ、余白を含めて大きく撮影・切り取りしてください。",
      );
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    URL.revokeObjectURL(url);
    image.src = "";
  }
}
