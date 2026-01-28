const express = require('express');
const app = express(); 
const cors = require('cors');

app.use(express.json());

app.use(cors({
  origin: ["http://localhost:8080"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/users", require("./routes/user.routes"));
app.use("/api/customers", require("./routes/customer.routes"));
app.use("/api/invoices", require("./routes/invoice.routes"));
app.use("/api/staff", require("./routes/staff.routes"));
app.use("/api/item-groups", require("./routes/itemGroup.routes"));
app.use("/api/taxes", require("./routes/tax.routes"));
app.use("/api/items", require("./routes/item.routes"));
app.use("/api/invoices", require("./routes/invoice.routes"));
app.use("/api/permissions", require("./routes/permission.routes"));

module.exports = app;