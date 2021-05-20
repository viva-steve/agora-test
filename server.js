const express = require("express");
const path = require("path");
const app = express();
app.use("/", express.static(path.join(__dirname, "build")));
app.get("/*", function(req, res) {
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Date: new Date(),
  });
  res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(80, () => {
  console.log("listening: 80");
});
