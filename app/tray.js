/*!
 * AriaNg GUI
 * 
 * Copyright (c) 2018-2019 Xmader
 * Released under the MIT license
 * 
 * Source Code: https://github.com/Xmader/aria-ng-gui
 * 
*/

const { app, Tray, BrowserWindow, ipcMain } = require("electron")
const { dialog } = require("electron")

let tray = null
let trayMenu = null

const getTrayMenu = () => {
    const locale = app.getLocale().includes("zh") ? "zh-CN" : "en-US"
    const { trayMenu: _trayMenu } = require("./menu.js").buildMenu(locale)
    trayMenu = _trayMenu
    return _trayMenu
}

const displayTray = async (icon) => {
    tray = new Tray(icon)
    tray.setToolTip("AriaNg GUI v" + app.getVersion())
    tray.setContextMenu(trayMenu || getTrayMenu())

    const minimizeNotificationDisabled = await new Promise((resolve) => {
        const mainWindow = BrowserWindow.getAllWindows()[0]

        ipcMain.once("minimizeNotificationDisabled", (e, value) => {
            resolve(value)
        })

        mainWindow.webContents.send("isMinimizeNotificationDisabled")
    })


    if (!minimizeNotificationDisabled) {
        const title = "AriaNg GUI 已最小化到托盘"
        const content = "可以右键单击托盘图标完全退出"
        if (process.platform == "win32") {
            tray.displayBalloon({
                icon,
                title,
                content
            })
        } else {
            dialog.showMessageBox({
                type: "info",
                icon,
                title: "AriaNg GUI",
                message: title,
                detail: content
            })
        }
    }
}

const destroyTray = () => {
    if (!tray) return

    const mainWindow = BrowserWindow.getAllWindows()[0]

    tray.destroy()
    mainWindow.show()
}

const destroyMainWindow = () => {
    const mainWindow = BrowserWindow.getAllWindows()[0]

    mainWindow.destroy()
}

module.exports = {
    displayTray,
    destroyTray,
    destroyMainWindow
}
