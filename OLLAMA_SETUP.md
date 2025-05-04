# Ollama Setup Guide for MedConnect

This guide will help you set up Ollama to enable AI-powered chat in the MedConnect patient dashboard.

## Prerequisites

- A computer with at least 2GB of RAM (4GB recommended)
- 5GB of free disk space for the LLM model

## Installation Steps

### 1. Install Ollama

Visit [ollama.com](https://ollama.com/) to download and install Ollama for your operating system:

- **macOS**: Download the .dmg file and follow the installation prompts
- **Windows**: Download the installer and follow the installation prompts
- **Linux**: Follow the installation instructions provided on the website

### 2. Run Ollama and Pull the Llama 3.2 Model

Once Ollama is installed, you'll need to pull the Llama 3.2 3B model:

1. Open a terminal or command prompt
2. Run the following command:

```bash
ollama pull llama3.2:3b
```

This will download the model (approximately 4GB). Wait for it to complete.

### 3. Verify the Installation

To make sure Ollama is running correctly with the model:

```bash
ollama list
```

You should see `llama3.2:3b` in the list of available models.

### 4. Run the MedConnect Application

With Ollama running in the background, you can now start the MedConnect application:

```bash
npm run dev
```

## Troubleshooting

- **Ollama not responding**: Make sure the Ollama service is running. On macOS and Windows, check if the Ollama app is open.
- **Model not found**: If you get a model not found error, try running `ollama pull llama3.2:3b` again.
- **Port conflicts**: Ensure no other service is using port 11434, which is what Ollama uses by default.

## Using Different Models

If you want to use a different model:

1. Pull the model with `ollama pull model_name`
2. Update the `modelName` variable in `src/app/api/chat/route.ts`

## Additional Information

- [Ollama Documentation](https://github.com/ollama/ollama/blob/main/README.md)
- [Llama 3 Model Information](https://ollama.com/library/llama3) 