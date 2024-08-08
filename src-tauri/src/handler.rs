use env_logger::Builder;
use log::{debug, error, info, trace, warn};
use objc::{msg_send, sel, sel_impl};
use std::env;
use tauri::command;

#[command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn log(count: i32) -> String {
    format!("counter: {}.", count)
}

#[command]
pub fn set_badge(count: i32) -> Result<(), String> {
    info!("{}", log(count));
    #[cfg(target_os = "macos")]
    unsafe {
        use cocoa::{appkit::NSApp, base::nil, foundation::NSString};
        use objc::msg_send;

        let label = if count == 0 {
            nil
        } else {
            NSString::alloc(nil).init_str(&format!("{}", count))
        };
        let dock_tile: cocoa::base::id = msg_send![NSApp(), dockTile];
        let _: cocoa::base::id = msg_send![dock_tile, setBadgeLabel: label];
    }

    #[cfg(target_os = "windows")]
    {
        use windows::{
            Data::Xml::Dom::XmlDocument,
            UI::Notifications::{BadgeNotification, BadgeUpdateManager},
        };

        let xml = XmlDocument::new().unwrap();
        xml.LoadXml(format!(r#"<badge value="{}"/>"#, count))
            .unwrap();

        let badge = BadgeNotification::CreateBadgeNotification(xml).unwrap();

        BadgeUpdateManager::CreateBadgeUpdaterForApplication()
            .map(|badge_updater| badge_updater.Update(badge).unwrap())
            .map_err(|err| err.message().to_string())?;
    }
    Ok(())
}
