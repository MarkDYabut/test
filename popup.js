document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('screenshotButton')?.addEventListener('click', async () => {
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

  document.getElementById('inputButton')?.addEventListener('click', async () => {
    const inputValue1 = document.getElementById('inputField').value;
    const inputValue2 = document.getElementById('inputField2').value;

    // Save to localStorage
    const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
    credentials.push({ username: inputValue1, password: inputValue2 });
    localStorage.setItem('credentials', JSON.stringify(credentials));

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

  document.getElementById('addCredentialsButton')?.addEventListener('click', () => {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;

    if (username && password) {
      const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
      credentials.push({ username, password });
      localStorage.setItem('credentials', JSON.stringify(credentials));

      // Update dropdown and stored credentials list
      populateCredentialsDropdown();
      displayStoredCredentials();

      // Clear input fields
      document.getElementById('newUsername').value = '';
      document.getElementById('newPassword').value = '';
    }
  });

  document.getElementById('loginButton')?.addEventListener('click', async () => {
    const selectedIndex = document.getElementById('credentialsDropdown').selectedIndex;
    const credentials = JSON.parse(localStorage.getItem('credentials')) || [];

    if (selectedIndex > 0) { // Skip the placeholder option
      const { username, password } = credentials[selectedIndex - 1];

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
          args: [username, password]
        });
      } catch (error) {
        console.error('Error interacting with the page:', error);
      }
    }
  });

  populateCredentialsDropdown();
  displayStoredCredentials();
});

function populateCredentialsDropdown() {
  const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
  const dropdown = document.getElementById('credentialsDropdown');
  dropdown.innerHTML = '<option value="" disabled selected>Select Credentials</option>';

  credentials.forEach((cred, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = cred.username;
    dropdown.appendChild(option);
  });
}

function displayStoredCredentials() {
  const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
  const credentialsList = document.getElementById('credentialsList');
  credentialsList.innerHTML = '';

  credentials.forEach((cred) => {
    const listItem = document.createElement('li');
    listItem.textContent = `Username: ${cred.username}, Password: ${cred.password}`;
    credentialsList.appendChild(listItem);
  });
}