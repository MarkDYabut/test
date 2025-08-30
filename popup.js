document.getElementById('screenshotButton').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' }, (dataUrl) => {
      chrome.downloads.download({
        url: dataUrl,
        filename: 'screenshot.png'
      });
    });
  } catch (error) {
    console.error('Error taking screenshot:', error);
  }
});