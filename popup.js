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

      // Navigate to the authentication page in the current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.tabs.update(tab.id, { url: 'https://www.otpp.com/auth/' });

      // Wait for the tab to finish loading
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);

          // Inject the script to fill in the username and password
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
        }
      });
    }
  });

  document.getElementById('signoutButton').addEventListener('click', () => {
    chrome.tabs.update({ url: 'https://www.otpp.com/members/my/en/pages/signout' });
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

  credentials.forEach((cred, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `Username: ${cred.username}<br>Password: ${cred.password}`;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    // deleteButton.style.marginLeft = '10px';
    deleteButton.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete the credential for username: ${cred.username}?`)) {
        deleteCredential(index);
      }
    });

    listItem.appendChild(deleteButton);
    credentialsList.appendChild(listItem);
  });
}

function deleteCredential(index) {
  const credentials = JSON.parse(localStorage.getItem('credentials')) || [];
  credentials.splice(index, 1);
  localStorage.setItem('credentials', JSON.stringify(credentials));
  displayStoredCredentials();
  populateCredentialsDropdown();
}