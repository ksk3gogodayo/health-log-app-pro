import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HealthLogForm from "./HealthLogForm";

test("separate morning/noon/evening checkboxes show their own Japan times and submit", () => {
  const onCustomMedsChange = jest.fn();
  const onSave = jest.fn().mockResolvedValue();
  render(<HealthLogForm memo="" pollenLevel="" masterMeds={["ロキソニン朝", "ロキソニン昼", "ロキソニン晩"]}
    customMedsCheck={{ロキソニン朝:true, ロキソニン昼:true}}
    customMedsCheckedAt={{ロキソニン朝:"2026-10-23T23:00:00Z", ロキソニン昼:"2026-10-24T03:00:00Z"}}
    onMemoChange={()=>{}} onPollenLevelChange={()=>{}} onCustomMedsChange={onCustomMedsChange}
    onSave={onSave} onCancel={()=>{}} />);
  expect(screen.getByText("08:00（日本時間）")).toBeInTheDocument();
  expect(screen.getByText("12:00（日本時間）")).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("ロキソニン晩"));
  expect(onCustomMedsChange).toHaveBeenCalledWith("ロキソニン晩", true);
  fireEvent.click(screen.getByRole("button", {name:"記録する"}));
  expect(onSave).toHaveBeenCalledTimes(1);
});
