import Head from "next/head";
import Image from "next/image";

import { useState, useEffect } from "react";

const Home = () => {
  const MAX_RETRIES = 20;

  const [promptText, setPromptText] = useState("");
  const [img, setImg] = useState("");
  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(MAX_RETRIES)
  const [isGenerating, setIsGenerating] = useState(false)
  const [finalPrompt, setFinalPrompt] = useState("")

  function handleChange(event) {
    setPromptText(event.target.value);
  }

  async function generateAction() {
    console.log("Generating image...");

    if (isGenerating && retry == 0) return

    setIsGenerating(true)

    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0
        } else {
          return prevState-1
        }
      })
      setRetry(0)
    }
    
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
        'x-use-cache': 'false'
      },
      body: JSON.stringify({promptText}),
    });
    console.log(response)
    const data = await response.json();
    console.log(data.image)

    if (response.status === 503) {
      console.log("Model is still loading...");
      setRetry(data.estimated_time)
      return;
    }

    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      return;
    }

    setImg(data.image);
    setFinalPrompt(promptText)
    setPromptText("")
    setIsGenerating(false)
  }

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(`Model still loading after ${MAX_RETRIES} retries. Try request again in 5 minutes.`)
        setRetryCount(MAX_RETRIES);
        return
      }
      console.log(`Trying again in ${retry} seconds.`)

      await sleep(retry * 1000)

      await generateAction();
    }

    if (retry === 0) {
      return
    }

    runRetry()
  }, [retry])

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
              placeholder="Nickho, comic animation, Stan Lee, high resolution"
              className="input-prompt"
              type="text"
              id="prompt"
              name="prompt"
              value={promptText}
              onChange={handleChange}
            />
          </div>
          {
            isGenerating
              ? <button className="button-generating" onClick={generateAction}>Generating Image...</button>
              : <button className="button-idle" onClick={generateAction}>
              Generate!
            </button>
          }

          {
            img && 
            <div className='output-container'>
              <Image
                src={img}
                height={512}
                width={512}
                alt={finalPrompt}
              />
              <h1 className='final-prompt'>{finalPrompt}</h1>
            </div>  
          }


          
        </div>
      </div>
    </div>
  );
};

export default Home;
