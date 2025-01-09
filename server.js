const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// OpenAI-compatible completion endpoint
app.post('/v1/engines/davinci-codex/completions', async (req, res) => {
  try {
    const { prompt, max_tokens, temperature } = req.body;

    // Construct the request for the Chipp API
    const chippRequest = {
      applicationId: 10731,
      apiKey: 'live_3cb92d90-9558-4b5c-b7b7-822a802daf54',
      messageList: [
        {
          senderType: 'USER',
          content: prompt
        }
      ]
    };

    // Send the request to the Chipp API
    const chippResponse = await axios.post('https://api.chipp.ai/chat', chippRequest);

    // Extract the assistant's response from the Chipp API response
    const assistantMessage = chippResponse.data.messageList.find(
      message => message.role === 'assistant'
    );

    // Translate the Chipp API response to OpenAI format
    const openaiResponse = {
      id: 'cmpl-12345',
      object: 'text_completion',
      created: Date.now(),
      model: 'davinci-codex',
      choices: [
        {
          text: assistantMessage ? assistantMessage.content : '',
          index: 0,
          logprobs: null,
          finish_reason: 'stop'
        }
      ]
    };

    // Send the OpenAI-compatible response back to the client
    res.json(openaiResponse);
  } catch (error) {
    console.error('Error communicating with Chipp API:', error);
    res.status(500).json({ error: 'Failed to get response from Chipp API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});