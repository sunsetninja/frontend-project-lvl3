import initApp from "./init.js";
import runApp from "./application.js";

const start = async () => {
  await initApp();
  runApp();
};

start();
