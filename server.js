const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// OpenAI-compatible chat completions endpoint
app.post('/v1/chat/completions', async (req, res) => {
  try {
    const { model, messages, temperature, max_tokens, top_p, frequency_penalty, presence_penalty } = req.body;

    // Extract the user message content
    const userMessage = messages.find(message => message.role === 'user');

    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required' });
    }

    // Construct the request for the Chipp API
    const chippRequest = {
      applicationId: 10731,
      apiKey: 'live_3cb92d90-9558-4b5c-b7b7-822a802daf54',
      messageList: [
        {
          senderType: 'USER',
          content: userMessage.content
        }
      ]
    };

    // Send the request to the Chipp API
    const chippResponse = await axios.post('https://api.chipp.ai/chat', chippRequest);

    // Extract the assistant's response from the Chipp API response
    const assistantMessage = chippResponse.data.messageList.find(
      message => message.senderType.toLowerCase() === 'assistant'
    );

    // Translate the Chipp API response to OpenAI format
    const openaiResponse = {
      id: 'chatcmpl-12345',
      object: 'chat.completion',
      created: Date.now(),
      model: model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: assistantMessage ? assistantMessage.content : ''
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 0, // Placeholder, calculate if needed
        completion_tokens: 0, // Placeholder, calculate if needed
        total_tokens: 0 // Placeholder, calculate if needed
      }
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