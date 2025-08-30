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

document.getElementById('inputButton').addEventListener('click', async () => {
  const inputValue1 = document.getElementById('inputField').value;
  const inputValue2 = document.getElementById('inputField2').value;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (value1, value2) => {
        const field1 = document.evaluate("//input[@id='username']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const field2 = document.evaluate("//input[@id='password']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        const submitButton = document.evaluate("//button[@type='submit']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

        if (field1) field1.value = value1;
        if (field2) field2.value = value2;
        if (submitButton) submitButton.click(); // Click the submit button
      },
      args: [inputValue1, inputValue2]
    });
  } catch (error) {
    console.error('Error interacting with the page:', error);
  }
});