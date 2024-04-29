This project Makes use of Several Open Source Projects, which are used to create this product.

System Requirements:
This project requires node.js version 21 and above: You can find the latest version of nodejs here: https://nodejs.org/en
Make sure appropriate node setup is done before trying to run this application. The installer provides guidance on how to install node and configure it for your system.

First Time Running Instructions:
1. Clone the Repository
2. Open 2 terminal windows in the root directory. In one of them go to the "Server" directory and in the other go to the "VisualizingMM" directory
3. In each terminal type the command "npm install". This installs all necessary packages for this project

To Run the Project:
1. Open 2 terminal windows in the root directory. In one of them go to the "Server" directory and in the other go to the "VisualizingMM" directory
2. In the Server directory, type "node server.js"  You will see the following message:
(node:16464) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Server running on port 3001

3. In the VisualizingMM directory, type the command "npm run dev", You will see the following message:
  VITE v5.1.1  ready in 352 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
Now click on the url that is shown next to Local. and the application is now live.

To run unit tests:
In the server directory, type "npm test"
For more verbose output: "npm test --verbose"
