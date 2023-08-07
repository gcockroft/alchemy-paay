import * as buffer from "buffer";
import React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter} from "react-router-dom";
import {ToastContainer} from "./constants";
import {configureAxios} from "@alch-fam/shared";
import reportWebVitals from "./reportWebVitals";
import RootScreen from "./screens/RootScreen";
window.Buffer = buffer.Buffer;

configureAxios();

const container = document.getElementById("root");
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <RootScreen />
      <ToastContainer />
    </BrowserRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
