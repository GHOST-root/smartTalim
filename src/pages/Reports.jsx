import { Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom";
import Lidlarhisob from "../components/reports/Lidlar";
import Jiringhisob from "../components/reports/Qongiroqlar";
import Smshisob from "../components/reports/smslar";
import Tarketganhisob from "../components/reports/tarkEtganlar";
import Worklyhisob from "../components/reports/Workly";
import Darslar from "../components/reports/Darslar";
import Konversiya from "../components/reports/Konversiya";

function Reports() {
  return (
    <>

      <div className="app d-flex bg-light">

        {/* O‘ng taraf - Content */}
        <div className="content flex-grow-1 p-3">
          <Routes>
                <Route path="konversiyahisob/konversiya" element={<Konversiya />} />
                <Route path="darshisob/kelish" element={<Darslar />} />
                <Route path="lidlarhisob/lidlar" element={<Lidlarhisob />} />
                <Route path="Tarketganhisob/chiqqanlar" element={<Tarketganhisob />} />
                <Route path="Worklyhisob/workly" element={<Worklyhisob />} />
                <Route path="Smshisob/sms" element={<Smshisob />} />
                <Route path="jiringhisob/qongiroq" element={<Jiringhisob />} />
          </Routes>
        </div>

      </div>
        <Outlet />
      </>

  );
}

export default Reports;