import cliSchema from './schemas/cli.js';

function executeCommand(req, res) {
  const { args } = req.body;

  const result = this.proxy.execute(args);
  if (result.success) res.json({ output: result.output });
  else res.status(500).json({ error: result.error });
}

export default [
  {
    callback: executeCommand,
    route: '/cli',
    method: 'post',
    schema: cliSchema,
  }
]