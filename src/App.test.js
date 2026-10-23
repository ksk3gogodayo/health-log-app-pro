import { render, screen } from "@testing-library/react";
import App from "./App";
jest.mock("./firebase", () => ({ auth: {} }));
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (_auth, callback) => {
    callback(null);
    return jest.fn();
  },
  signOut: jest.fn(),
}));
jest.mock("./Login", () => () => <p>ログイン画面</p>);
jest.mock("./components/HealthLogApp", () => () => <p>服薬記録</p>);
jest.mock("./components/Settings", () => () => <p>薬設定</p>);
jest.mock("./features/meds/services/masterMeds", () => ({
  subscribeMasterMeds: jest.fn(),
}));
test("signed-out visitors cannot see health records or import settings", () => {
  window.matchMedia = () => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  });
  render(<App />);
  expect(screen.getByText("ログイン画面")).toBeInTheDocument();
  expect(screen.queryByText("服薬記録")).not.toBeInTheDocument();
  expect(screen.queryByText("薬設定")).not.toBeInTheDocument();
});
