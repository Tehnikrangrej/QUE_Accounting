require ("dotenv").config();

const app = require ("./src/app");

const PORT = process.env.PORT || 3000;

app.get ("/health", (req, res) => {
  res.status (200).send ("OK");
});

app.listen (PORT, () => {
  console.log (`http://localhost:${PORT}`);
}); 