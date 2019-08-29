const { ipcRenderer } = require('electron');

updatePresence = (args) => {
    ipcRenderer.send('updatePresence', args);
}