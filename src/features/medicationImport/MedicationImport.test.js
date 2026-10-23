import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MedicationImport from "./MedicationImport";
import { readQrImage } from "./qrImage";
import { saveMedicationImport, watchMedicationImports } from "./store";
import { sampleJahis } from "./fixtures";
jest.mock("./qrImage", () => ({ readQrImage: jest.fn() }));
jest.mock("./store", () => ({
  saveMedicationImport: jest.fn(),
  watchMedicationImports: jest.fn(),
  deleteMedicationImport: jest.fn(),
}));
beforeEach(() => {
  jest.clearAllMocks();
  readQrImage.mockResolvedValue({ text: sampleJahis });
  watchMedicationImports.mockImplementation((uid, callback) => {
    callback([]);
    return jest.fn();
  });
});
async function preview() {
  render(<MedicationImport uid="alice" masterMeds={["朝", "昼", "晩"]} />);
  fireEvent.click(screen.getByText("薬をQRから取り込む"));
  fireEvent.change(screen.getByLabelText("QR画像を選ぶ"), {
    target: { files: [new File(["qr"], "qr.png", { type: "image/png" })] },
  });
  await screen.findByText("登録する内容を確認");
}
test("requires review and explicit confirmation; keeps existing check names", async () => {
  saveMedicationImport.mockResolvedValue({ added: 1, skipped: 0 });
  await preview();
  expect(saveMedicationImport).not.toHaveBeenCalled();
  expect(screen.getByText("選んだ薬を登録する")).toBeDisabled();
  fireEvent.change(screen.getByLabelText("1件目の連携方法"), {
    target: { value: "existing" },
  });
  fireEvent.change(screen.getByLabelText("1件目の登録先"), {
    target: { value: "朝" },
  });
  fireEvent.click(
    screen.getByLabelText(
      "自分の薬の情報であることと、選んだ内容を確認しました",
    ),
  );
  fireEvent.click(screen.getByText("選んだ薬を登録する"));
  await waitFor(() => expect(saveMedicationImport).toHaveBeenCalledTimes(1));
  expect(saveMedicationImport.mock.calls[0][2][0]).toMatchObject({
    mode: "existing",
    checkName: "朝",
  });
  expect(JSON.stringify(saveMedicationImport.mock.calls)).not.toContain(
    "テスト利用者",
  );
  await screen.findByText(/1件を登録しました/);
  expect(screen.queryByText(/対象：/)).not.toBeInTheDocument();
});
test("save errors keep review for retry and disable double submission", async () => {
  let reject;
  saveMedicationImport.mockImplementation(
    () =>
      new Promise((_, r) => {
        reject = r;
      }),
  );
  await preview();
  fireEvent.click(
    screen.getByLabelText(
      "自分の薬の情報であることと、選んだ内容を確認しました",
    ),
  );
  fireEvent.click(screen.getByText("選んだ薬を登録する"));
  fireEvent.click(screen.getByText("選んだ薬を登録する"));
  expect(saveMedicationImport).toHaveBeenCalledTimes(1);
  reject(new Error("offline"));
  await screen.findByRole("alert");
  expect(screen.getByText("登録する内容を確認")).toBeInTheDocument();
  expect(screen.getByText("選んだ薬を登録する")).toBeEnabled();
});
test("closing clears scan data and starting again does not retain patient preview", async () => {
  await preview();
  fireEvent.click(screen.getByText("取り込み画面を閉じる"));
  fireEvent.click(screen.getByText("薬をQRから取り込む"));
  expect(screen.queryByText(/対象：/)).not.toBeInTheDocument();
});
