import { TextEncoder, TextDecoder } from "util";
import {
  BarcodeFormat,
  QRCodeWriter,
  EncodeHintType,
  ZXingStringEncoding as StringEncoding,
} from "@zxing/library";
import { decodePixels, readQrImage } from "./qrImage";
beforeAll(() => {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
});
test("decodes actual generated QR pixels locally", () => {
  const payload = "JAHISTC08,1\r\n5,20261023,1\r\n";
  const matrix = new QRCodeWriter().encode(
    payload,
    BarcodeFormat.QR_CODE,
    400,
    400,
    new Map(),
  );
  const pixels = new Uint8ClampedArray(400 * 400 * 4);
  for (let y = 0; y < 400; y++)
    for (let x = 0; x < 400; x++) {
      const i = (y * 400 + x) * 4;
      const v = matrix.get(x, y) ? 0 : 255;
      pixels.set([v, v, v, 255], i);
    }
  expect(decodePixels(pixels, 400, 400).text).toBe(payload);
});
test("rejects PDFs and oversized files before creating image URLs", async () => {
  await expect(
    readQrImage(new File(["test"], "file.pdf", { type: "application/pdf" })),
  ).rejects.toThrow("スクリーンショット");
  await expect(
    readQrImage({ type: "image/png", size: 16 * 1024 * 1024 }),
  ).rejects.toThrow("15MB");
});

test("Shift-JIS Japanese QR round-trips without mojibake", () => {
  const iconv = require("iconv-lite");
  const original = StringEncoding.customEncoder;
  StringEncoding.customEncoder = (s, encoding) =>
    Uint8Array.from(iconv.encode(s, encoding));
  try {
    const payload =
      "JAHISTC08,1\r\n201,1,ロキソニン錠６０ｍｇ,3,錠,2,999999999,1\r\n";
    const matrix = new QRCodeWriter().encode(
      payload,
      BarcodeFormat.QR_CODE,
      600,
      600,
      new Map([[EncodeHintType.CHARACTER_SET, "Shift_JIS"]]),
    );
    const pixels = new Uint8ClampedArray(600 * 600 * 4);
    for (let y = 0; y < 600; y++)
      for (let x = 0; x < 600; x++) {
        const i = (y * 600 + x) * 4;
        const v = matrix.get(x, y) ? 0 : 255;
        pixels.set([v, v, v, 255], i);
      }
    expect(decodePixels(pixels, 600, 600).text).toBe(payload);
  } finally {
    StringEncoding.customEncoder = original;
  }
});
