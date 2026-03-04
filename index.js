import express from "express";
import fetch from "node-fetch";

const app = express();

const USER = "rafarvd";
const REPO = "docker";
const WORKFLOW = "run.yml";

app.get("/run", async (req, res) => {
  const { pass } = req.query;

  // 🔐 senha simples
  if (pass !== process.env.RUN_PASSWORD) {
    return res.status(401).send("Senha incorreta");
  }

  try {
    await fetch(
      `https://api.github.com/repos/${USER}/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GH_TOKEN}`,
          Accept: "application/vnd.github+json"
        },
        body: JSON.stringify({
          ref: "main"
        })
      }
    );

    res.send("✅ Workflow disparado!");
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro ao disparar");
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Servidor rodando")
);
