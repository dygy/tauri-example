import { invoke as TAURI_INVOKE } from '@tauri-apps/api/core';
import {
    isPermissionGranted, Options,
    requestPermission as requestTauriPermission,
    sendNotification
} from "@tauri-apps/plugin-notification";

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

tauriCall('set_badge', {count: Math.random() * 1000});
