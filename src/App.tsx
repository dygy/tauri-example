import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke as TAURI_INVOKE } from '@tauri-apps/api/core';
import {
    isPermissionGranted, Options,
    requestPermission as requestTauriPermission,
    sendNotification
} from "@tauri-apps/plugin-notification";
import "./App.css";

declare global {
    interface Window {
        __TAURI__?: {
            invoke: typeof TAURI_INVOKE;
        };
    }
}


export const tauriCall = (event: string, params: any) => {
    if (!window.__TAURI__) {
        return;
    }
    try {
        return TAURI_INVOKE(event, params);
    } catch (e) {
        console.warn('tauri warn', e);
        return Promise.reject(e);
    }
};

export const tauriNotification = async(options: Options) => {
    if (!window.__TAURI__) {
        return;
    }

    let permissionGranted = await isPermissionGranted();

    if (!permissionGranted) {
        const permission = await requestTauriPermission();
        permissionGranted = permission === 'granted';
    }

    if (permissionGranted) {
        sendNotification(
            options
        );
    }
}

function App() {
  TAURI_INVOKE('set_badge', {count: Math.floor(Math.random() * 1000)});
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await TAURI_INVOKE("greet", { name }));
  }

  return (
    <div className="container">
      <h1>Welcome to Tauri!</h1>

      <div className="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and React logos to learn more.</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>

      <p>{greetMsg}</p>
    </div>
  );
}

export default App;
