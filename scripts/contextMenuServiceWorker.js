const getKey = () => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['openai-key'], (result) => {
        if (result['openai-key']) {
          const decodedKey = atob(result['openai-key']);
          resolve(decodedKey);
        }
      });
    });
  };
  
const generate = async (prompt) => {
    // Get your API key from storage
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';
      
    // Call completions endpoint
    const completionResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 1250,
        temperature: 0.7,
      }),
    });
      
    // Select the top choice and send back
    const completion = await completionResponse.json();
    return completion.choices.pop();
  }

const generateCompletionAction = async (info) => {
    try {
      const { selectionText } = info;
      const basePromptPrefix = `
      Write a detailed dream vacation with a creative introduction paragraph. Exclude the word introduction. The vacation should contain 8 activities that most tourists don't know about to the destination below and describe the activity in detail and offer specifics about the flight months that cost the least along with the average price and cruise months that cost the least along with the average price. Suggest companies that offer all-inclusive packages to the destination. Include a separate list of popular tourist locations and vacation secrets in bullet points.
      
      Destination: 
      Popular tourist locations: Offer the most popular locations that tourists visit
      Vacation secrets: Suggest locations that are well-loved by locals for years and that many people don't know about.\n
      `;
      const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);

      // Let's see what we get!
      console.log(baseCompletion.text)
    } catch (error) {
      console.log(error);
    }
  };

// Add this in scripts/contextMenuServiceWorker.js
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'context-run',
      title: 'Generate dream vacation',
      contexts: ['selection'],
    });
  });
  
  // Add listener
  chrome.contextMenus.onClicked.addListener(generateCompletionAction);