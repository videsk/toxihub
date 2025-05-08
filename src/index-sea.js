import config from './config';
import main from './server.js';

function printBanner() {
  console.log(`
┌─────────────────────────────────────────────────┐
│                                                 │
│   Toxiproxy API Wrapper v${process.env.npm_package_version || '1.0.0'}                   │
│                                                 │
│   Server: http://${config.toxiproxyHost}:${config.port}       │
│   Toxiproxy: http://${config.toxiproxyHost}:${config.toxiproxyPort}    │
│                                                 │
│   Documentation available at:                   │
│   http://${config.toxiproxyHost}:${config.port}                │
│                                                 │
└─────────────────────────────────────────────────┘
  `);
}

function parseCommandLineArgs() {
  const args = process.argv.slice(2);
  const options = {};

  args.forEach((arg, index) => {
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[index + 1] && !args[index + 1].startsWith('--')
        ? args[index + 1]
        : 'true';

      // Handle specific arguments
      switch (key) {
        case 'port':
          config.port = parseInt(value, 10);
          break;
        case 'toxiproxy-port':
          config.toxiproxyPort = parseInt(value, 10);
          break;
        case 'toxiproxy-host':
          config.toxiproxyHost = value;
          break;
        case 'auto-start':
          config.autoStartServer = value === 'true';
          break;
        case 'help':
          printHelp();
          process.exit(0);
          break;
        default:
          options[key] = value;
      }
    }
  });

  return options;
}

function printHelp() {
  console.log(`
Toxiproxy API Wrapper - Command Line Options

Usage: toxiproxy-api [options]

Options:
  --port <number>            Set the API server port (default: ${config.port})
  --toxiproxy-port <number>  Set the Toxiproxy server port (default: ${config.toxiproxyPort})
  --toxiproxy-host <string>  Set the Toxiproxy host (default: ${config.toxiproxyHost})
  --auto-start <boolean>     Auto-start Toxiproxy server (default: ${config.autoStartServer})
  --help                     Display this help message

Example:
  toxiproxy-api --port 7072 --toxiproxy-port 8474
  `);
}

parseCommandLineArgs();
main()
  .then(() => printBanner());

