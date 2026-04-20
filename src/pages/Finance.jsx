import React from 'react'
import AppMoliya from '../components/finance/AppMoliya';
import { Outlet } from 'react-router-dom';

function Finance() {

  return (
    <div>
      <div className="p-3">
        <AppMoliya />
      </div>
        <Outlet />
    </div>
  );
}

export default Finance;