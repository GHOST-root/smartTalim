import { Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom";

function Settings() {
	return (
		<>
			<div className='app d-flex bg-light'>
				<div className='content flex-grow-1'>
						
				</div>
			</div>
            <Outlet />
		</>
	);
}

export default Settings;