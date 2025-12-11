import React, { useState } from "react";
// import { X } from "react-feather";
import { toast } from "react-toastify";

interface DateTimePickerProps {
  onSelect: (date: string, time: string, note: string) => void;
  onExit?: () => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  onSelect,
  onExit,
}) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [isProceeding, setIsProceeding] = useState(false);

  // Generate next 3 days
  const days = Array.from({ length: 3 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNumber = date.getDate();
    return {
      id: i,
      label: `${dayName} ${dayNumber}`,
      value: date.toISOString().split("T")[0],
    };
  });

  // Generate hourly time slots from 9AM to 9PM
  const times = Array.from({ length: 12 * 2 + 1 }, (_, i) => {
    const totalHours = 9 + i * 0.5; // Start at 9, increment by 0.5 hours
    const hour = Math.floor(totalHours);
    const minutes = totalHours % 1 === 0 ? "00" : "30";
    const ampm = totalHours >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour;
    const timeLabel = `${displayHour}:${minutes} ${ampm}`;
    return { label: timeLabel, hour, minutes };
  });

  // Check if a time is in the past (for today's date)
  const isPastTime = (hour: number): boolean => {
    if (!selectedDate) return false;
    const today = new Date();
    const selected = new Date(selectedDate);

    // Only disable past hours if selected date is today
    if (
      today.getFullYear() === selected.getFullYear() &&
      today.getMonth() === selected.getMonth() &&
      today.getDate() === selected.getDate()
    ) {
      return today.getHours() >= hour;
    }
    return false;
  };

  const handleProceed = () => {
    if (selectedDate && selectedTime) {
      setIsProceeding(true);
      onSelect(selectedDate, selectedTime, note || "");
      setTimeout(() => {
      onExit && onExit();
    }, 6000); 
    } else {
      toast.error("Please select date and time");
    }
  };

  return (
    <div className="wrappers">
      <div className="popups">
        <div className="d-flex justify-content-between align-items-center">
          <h6>Select Date & Time</h6>
          <button onClick={onExit} className="pclosebtn">
            Close
          </button>
        </div>
        <p className="font-14 color-grey">
          Your service will take approx. 45 mins
        </p>

        {/* Days */}
        <div className="d-flex align-items-center gap-10 flex-wrap">
          {days.map((day) => (
            <React.Fragment key={day.id}>
              <input
                id={`day-${day.id}`}
                type="radio"
                name="day"
                value={day.value}
                checked={selectedDate === day.value}
                onChange={() => {
                  setSelectedDate(day.value);
                  setSelectedTime(null);
                }}
                className="dayys"
              />
              <label htmlFor={`day-${day.id}`} className="day-label">
                <b>{day.label.split(" ")[0]}</b>
                <p>{day.label.split(" ")[1]}</p>
              </label>
            </React.Fragment>
          ))}
        </div>

        {/* Times */}
        {selectedDate && (
          <div className="d-flex flex-wrap pt-3 align-items-center gap-10">
            {times.map((time, index) => {
              const disabled = isPastTime(time.hour - 1);

              return (
                <React.Fragment key={index}>
                  {!disabled && (
                    <>
                      <input
                        id={`time-${index}`}
                        type="radio"
                        name="time"
                        value={time.label}
                        checked={selectedTime === time.label}
                        onChange={() => setSelectedTime(time.label)}
                        disabled={disabled}
                        className="dayys"
                      />
                      <label
                        htmlFor={`time-${index}`}
                        className={`time-label ${disabled ? "disabled" : ""}`}
                      >
                        <b>{time.label}</b>
                      </label>
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <div className="pt-3">
          <textarea
            className="textar"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add any note..."
          ></textarea>
        </div>

        <div className="pt-4">
          <button className="fill" onClick={handleProceed} disabled={isProceeding}>
            {isProceeding ? "Proceeding..." : "Proceed"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimePicker;
