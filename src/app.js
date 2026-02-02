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

app.use("/uploads", express.static("uploads"));
app.use("/api/settings", require("./routes/tenantConfiguration.routes"));

app.use("/api/superadmin", require("./routes/superAdmin.routes"));
app.use("/api/tenants", require("./routes/tenant.routes"));

app.use("/api/users", require("./routes/user.routes"));
app.use("/api/customers", require("./routes/customer.routes"));
app.use("/api/invoices", require("./routes/invoice.routes"));
app.use("/api/permissions", require("./routes/permission.routes"));

module.exports = app;