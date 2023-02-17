const generateAction = async function (req, res) {
  console.log("Received request.");
  console.log(req.body)

  const input = JSON.parse(req.body).promptText;

  const response = await fetch(
    `https://api-inference.huggingface.co/models/sd-dreambooth-library/avator-generator-2`,
    {
      headers: {
        Authroization: `Bearer ${process.env.HF_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: input,
      }),
    }
  );

  if (response.ok) {
    const buffer = await response.arrayBuffer();
    console.log(buffer)
    res.status(200).json({ image: buffer });
  } else if (response.status === 503) {
    const json = await response.json();
    res.status(503).json(json);
  } else {
    const json = await response.json();
    res.status(response.status).json({ error: response.statusText });
  }
};

export default generateAction;
