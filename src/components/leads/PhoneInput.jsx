import React, { useState } from "react";

const countries = [
  { code: "UZ", dial: "+998", flag: "🇺🇿" },
  { code: "RU", dial: "+7", flag: "🇷🇺" },
  { code: "US", dial: "+1", flag: "🇺🇸" }
];

function PhoneInput() {
  const [country, setCountry] = useState(countries[0]);
  const [open, setOpen] = useState(false);

  return (
    <div className="position-relative">
      <div className="input-group">
        <button
          type="button"
          className="btn btn-light border d-flex align-items-center gap-1"
          onClick={() => setOpen(!open)}
        >
          <span>{country.flag}</span>
          <small>{country.dial}</small>
        </button>

        <input
          type="tel"
          className="form-control"
          placeholder="99 585 44 33"
        />
      </div>

      {open && (
        <div
          className="position-absolute bg-white border rounded mt-1 w-100"
          style={{ zIndex: 10 }}
        >
          {countries.map((c) => (
            <div
              key={c.code}
              className="px-2 py-1 d-flex gap-2 align-items-center country-item"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setCountry(c);
                setOpen(false);
              }}
            >
              <span>{c.flag}</span>
              <span>{c.dial}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PhoneInput;
