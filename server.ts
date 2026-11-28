import inertia from "./app/middlewares/inertia";

import Web from "./routes/web";

import HyperExpress from "hyper-express";

import cors from 'cors';

const webserver = new HyperExpress.Server();
 
require("dotenv").config();

//  rendering html files
import "./app/services/View"; 


webserver.use(cors());

webserver.use(inertia());

if (process.env.SST_DESKTOP === '1') {
   webserver.get('/desktop/health', (_request, response) => response.json({
      application: 'sst-bengkel-desktop', instance: process.env.SST_INSTANCE_ID
   }));
}

webserver.use(Web); 

const PORT = parseInt(process.env.PORT) || 5555;
 
webserver.set_error_handler((req, res, error: any) => {
   console.log(error);

   if (error.code == "SQLITE_ERROR") {
      res.status(500);
   }

   res.json(error);
});

export const serverReady = webserver
   .listen(PORT, process.env.SST_DESKTOP === '1' ? '127.0.0.1' : '0.0.0.0')
   .then(() => {
      console.log(`Server is running at http://localhost:${PORT}`);
   })
   .catch((err: any) => {
      console.error('Server gagal dimulai:', err);
      process.exitCode = 1;
      throw err;
   });

process.on("SIGTERM", () => {
   console.info("SIGTERM signal received.");
   process.exit(0);
});
