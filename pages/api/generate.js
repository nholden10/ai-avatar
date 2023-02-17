const bufferToBase64 = (buffer) => {
  let arr = new Uint8Array(buffer);
  const base64 = btoa(
    arr.reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
  return `data:image/png;base64,${base64}`;
};

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
        'x-use-cache': 'false'
      },
      method: "POST",
      body: JSON.stringify({
        inputs: input,
      }),
    }
  );

  if (response.ok) {
    const buffer = await response.arrayBuffer();

    const base64 = bufferToBase64(buffer)
    
    res.status(200).json({ image: base64 });
  } else if (response.status === 503) {
    const json = await response.json();
    res.status(503).json(json);
  } else {
    const json = await response.json();
    res.status(response.status).json({ error: response.statusText });
  }
};

export default generateAction;
