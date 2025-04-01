export default {
  apps: [
    {
      name: 'bun-app',
      script: 'index.ts', // Directly call bun
      args: 'run', // Explicit path
      cwd: process.cwd(), // Essential for ES modules
      interpreter: 'bun', // Disable PM2's interpreter
      env: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`,
        NODE_ENV: 'production'
      },
      autorestart: true,
      instances: 1, // Start with single instance
      exec_mode: 'fork'
    }
  ]
};
