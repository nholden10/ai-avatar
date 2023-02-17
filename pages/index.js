import Head from "next/head";
import Image from "next/image";

import { useState, useEffect } from "react";

const Home = () => {
  const MAX_RETRIES = 20;
  const IMAGES = ['/lotr.jpg', '/alien.png', '/wizard.png']

  const [promptText, setPromptText] = useState("");
  const [img, setImg] = useState("");

  const [retry, setRetry] = useState(0);
  const [retryCount, setRetryCount] = useState(MAX_RETRIES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const [tooManyRequests, setTooManyRequests] = useState(false);
  const [modelLoading, setModelLoading] = useState(false)
  const [generatingTimer, setGeneratingTimer] = useState(0)

  function handleChange(event) {
    setPromptText(event.target.value);
  }

  function clearPrompt() {
    setPromptText("");
  }

  async function generateAction() {
    console.log("Generating image...");

    if (isGenerating && retry == 0) return;

    setIsGenerating(true);

    

    if (retry > 0) {
      setRetryCount((prevState) => {
        if (prevState === 0) {
          return 0;
        } else {
          return prevState - 1;
        }
      });
      setRetry(0);
    }

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "image/jpeg",
        "x-use-cache": "false",
      },
      body: JSON.stringify({ promptText }),
    });

    const data = await response.json();

    if (response.status === 503) {
      setModelLoading(true)
      console.log("Model is still loading...");
      setRetry(data.estimated_time);
      return;
    }

    if (!response.ok) {
      console.log(`Error: ${data.error}`);
      if (response.status === 429) {
        setTooManyRequests(true);
        setIsGenerating(false);
      }
      return;
    }

    setImg(data.image);
    setFinalPrompt(promptText);
    setModelLoading(false)
    setIsGenerating(false);
    setTooManyRequests(false);
  }

  

  const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };
  let fadeInTimer_s = 0;

  const sampleImages = IMAGES.map((image) => {
    fadeInTimer_s += 2
    return (
      <Image
        src={image}
        height={512 / 1.5}
        width={512 / 1.5}
        className={`image sample-images-${fadeInTimer_s}`}
        alt='sampleImages'
      ></Image>
    )
  })

  const generateButton = () => {
    if (isGenerating) {

      let generatingText = `Generating`
      for (let dots = 0; dots < generatingTimer; dots++){
        generatingText = generatingText + '.'
      }
      
      return (<button
        className="button button-generate-generating"
        onClick={generateAction}
      >
        {generatingText}
      </button>)
    } else {
      return (
      <button className="button button-generate-idle" onClick={generateAction}>
        Generate!
      </button>)

    }
  }

  let supplementaryMessage = ""

  if (tooManyRequests) {
    supplementaryMessage = `Easy now... the free AI model hosting service is saying enough
    is enough for now... Come back later and try again.`
  } else if (modelLoading) {
    supplementaryMessage = `Model is loading, hold your horses...`
  }


  useEffect(() => {
    const runRetry = async () => {
      if (retryCount === 0) {
        console.log(
          `Model still loading after ${MAX_RETRIES} retries. Try request again in 5 minutes.`
        );
        setRetryCount(MAX_RETRIES);
        return;
      }
      console.log(`Trying again in ${retry} seconds.`);

      await sleep(retry * 1000);

      await generateAction();
    };

    if (retry === 0) {
      return;
    }

    runRetry();
  }, [retry]);

  useEffect(() => {
    const id =     setInterval(() => setGeneratingTimer((prevState) => {
      const newTime = prevState + 1 > 3 ? 0 : prevState + 1
      return newTime
    }), 1000)

    return () => {
      clearInterval(id)
    }
     }, [])




  return (
    <div className="root">
      <Head>
        <title>Nick AI Avatar Generator</title>
      </Head>
      <div className="main-container">
        <div className="title-container">
          <h1 className="title">Welcome to the Nick avator generator.</h1>
        </div>
        <div className="sampleImages-container">
          {sampleImages}
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
          <div className="button-container">
            {promptText && (
              <button className="button button-clear" onClick={clearPrompt}>
                Clear prompt
              </button>
            )}
            {generateButton()}
          </div>
            <div className="model-status-container">
              <h3 className="model-status-message">{supplementaryMessage}
                
              </h3>
            </div>
          {img !== "" && (
            <div className="output-container">
              <Image
                src={img}
                height={512}
                width={512}
                alt={finalPrompt}
                className="image"
              />
              <h1 className="final-prompt">{finalPrompt}</h1>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
