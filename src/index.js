import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./App";
// se instala bootstrap y se importa como abajo para poder usar los estilos.
import "bootstrap/dist/css/bootstrap.css";

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root")
);
