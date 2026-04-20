import React from "react";
import { Route, Routes } from "react-router-dom";

// Asosiy moliya komponentlari
import YechibOlish from "./YechibOlish";
import XarajatToifalari from "./XarajatToifalari";
import Xarajatlar from "./Xarajatlar";
import IshHaqi from "./IshHaqi";
import Qarizdorlar from "./Qarizdorlar";
import Tolovlar from "./Tolovlar";

function AppMoliya() {
  return (
    <div>
      <Routes>
        {/* Asosiy sahifa */}
        <Route index element={<YechibOlish />} />
        
        {/* Moliya bo'limi sahifalari */}
        <Route path="Tolovlar" element={<Tolovlar />} />
        <Route path="Xarajatlar" element={<Xarajatlar />} />
        <Route path="XarajatToifalari" element={<XarajatToifalari />} />
        <Route path="Qarizdorlar" element={<Qarizdorlar />} />
        <Route path="IshHaqi" element={<IshHaqi />} />
      </Routes>
    </div>
  );
}

export default AppMoliya;