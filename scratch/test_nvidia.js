import OpenAI from 'openai';

const nvidiaApiKey = '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';
const nvClient = new OpenAI({
  apiKey: nvidiaApiKey,
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function testNvidia() {
  try {
    const response = await nvClient.chat.completions.create({
      model: 'nvidia/nemotron-nano-12b-v2-vl',
      messages: [
        { role: 'user', content: 'Hello, are you working?' }
      ],
    });
    console.log('✅ NVIDIA Response:', response.choices[0]?.message?.content);
  } catch (error) {
    console.error('❌ NVIDIA Error:', error.message);
  }
}

testNvidia();
