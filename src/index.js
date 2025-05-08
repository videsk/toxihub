import { server } from './server.js';

server()
  .catch(error => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});