import React from "react";
import "./DailyEntryForm.css";

const Confirmation = ({ drivenKm, onChooseAnotherTruck, onLogout }) => {
  return (
    <div className="daily-entry-container">
      <h2 className="daily-entry-title">Šodien uzveikti: {drivenKm} km</h2>

      <button className="confirm-button" onClick={onChooseAnotherTruck}>
        Izvēlēties citu auto
      </button>

      <button
        className="confirm-button logout"
        onClick={onLogout}
      >
        Izlogoties
      </button>
    </div>
  );
};

export default Confirmation;
