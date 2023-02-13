import Head from "next/head";
import Image from "next/image";

import { useState } from "react";

const Home = () => {
  const [promptText, setPromptText] = useState("");
  const [img, setImg] = useState("");

  function handleChange(event) {
    setPromptText(event.target.value);
  }

  async function onGenerate() {
    console.log("Generating image...");

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
      },
      body: JSON.stringify({ promptText }),
    });
    const data = await response.json();

    if (response.status === 503) {
      console.log("Model is still loading...");
      return;
    }

    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      return;
    }

    setImg(data.image);
  }

  return (
    <div className="root">
      <Head>
        <title>Nick AI Avatar Generator</title>
      </Head>
      <div className="main-container">
        <div className="title-container">
          <h1 className="title">Welcome to the Nick avator generator.</h1>
        </div>
        <div className="content-container">
          <h2 className="description">
            Make a Nick avator in any style using Stable Diffusion! Enter a
            prompt in the textbox and hit generate. Ensure you have the word
            "nickho" in the prompt as that is the text that the model learned to
            associate with photos of Nick.
          </h2>
          <div className="prompt-container">
            <label className="prompt-label">Prompt:</label>
            <input
              placeholder="Ex) nickho, comic animation, Stan Lee, high resolution"
              className="input-prompt"
              type="text"
              id="prompt"
              name="prompt"
              value={promptText}
              onChange={handleChange}
            />
          </div>
          <button className="button" onClick={onGenerate}>
            Generate!
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
