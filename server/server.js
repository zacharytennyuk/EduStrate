require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const app = express();
const port = 5200;

const Origins = ['https://edutoon-xkx7.onrender.com', 'http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || Origins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('CORS error!'))
    }
  }
}));

app.use(express.json());

const placeholderDuck = 'https://cdn.pixabay.com/photo/2017/01/30/10/59/animal-2020580_1280.jpg';

app.post("/create-panel", async (req, res) => {
  try{

    console.log("Generating panel.");

    
    const {abstract} = req.body;
    console.log("Abstract extracted: ", {abstract});

    // summary generation
    const summary = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {"role": "system", "content": "You create a text summaries of research abstract inputs."},
        {"role": "user", "content": abstract}],
    });
    console.log("Generated summary: ", summary.choices[0].message.content);
    console.log("-----");
    const generatedSummary = summary.choices[0].message.content;

    // prompt generation
    const prompt = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {"role": "system", "content":
        `The system will take user input (a research abstract) and output
        a prompt for dalle-3 to create an comic template in a two-dimensional style
        that visually summarizes the abstract. The prompt should describe a realistic scenario that
        will aid the viewer in understanding of the research. This prompt will avoid
        mentioning any text to include in the image. The prompt should instruct "Add empty and blank white boxes for text to be added by a human viewer."`},
        {"role": "user", "content": abstract}],
    });

    console.log("Generated prompt: ", prompt.choices[0].message.content);
    console.log("-----");
    const generatedPrompt = prompt.choices[0].message.content;

    // image generation
    const panel = await openai.images.generate({model: "dall-e-3", prompt: generatedPrompt});
    const generatedImage = panel.data[0].url;

    console.log("server log ---");
    
    // const panelURL = placeholderDuck;
    console.log("Generated image URL: ", generatedImage);
    console.log("-----");
    res.json({ generatedSummary, generatedPrompt, generatedImage });

  } catch (error) {

    console.error("Error from OpenAI:", error);
    res.status(500).send("Could not create panel.");

  }
})

app.listen(port, () => console.log('Server started on port', port))