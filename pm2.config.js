export default {
  apps: [
    {
      name: 'bun-app',
      script: 'src/index.ts',
      cwd: process.cwd(), // Essential for ES modules
      interpreter: 'bun',
      env: {
        PATH: `${process.env.HOME}/.bun/bin:${process.env.PATH}`
      },
      autorestart: true,
      instances: 1, // Start with single instance
      exec_mode: 'fork'
    }
  ]
};
