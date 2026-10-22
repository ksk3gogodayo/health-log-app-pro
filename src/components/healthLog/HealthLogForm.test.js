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
    onMedicationTimeChange={jest.fn()} onSave={onSave} onCancel={()=>{}} />);
  expect(screen.getByDisplayValue("08:00")).toBeInTheDocument();
  expect(screen.getByDisplayValue("12:00")).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("ロキソニン晩"));
  expect(onCustomMedsChange).toHaveBeenCalledWith("ロキソニン晩", true);
  fireEvent.click(screen.getByRole("button", {name:"記録する"}));
  expect(onSave).toHaveBeenCalledTimes(1);
});


test("editing an older checked item exposes a time input without toggling its checkbox", () => {
  const changeTime = jest.fn();
  const changeCheck = jest.fn();
  render(<HealthLogForm memo="" pollenLevel="" masterMeds={[]} customMedsCheck={{朝:true}}
    onMemoChange={()=>{}} onPollenLevelChange={()=>{}} onCustomMedsChange={changeCheck}
    onMedicationTimeChange={changeTime} onSave={async()=>{}} onCancel={()=>{}} />);
  fireEvent.change(screen.getByLabelText("朝の時刻（日本時間）"), {target:{value:"07:30"}});
  expect(changeTime).toHaveBeenCalledWith("朝", "07:30");
  expect(changeCheck).not.toHaveBeenCalled();
  expect(screen.getByLabelText("朝")).toBeChecked();
});
