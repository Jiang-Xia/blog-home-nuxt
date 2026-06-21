// blog-home-nuxt production PM2 config (shipped in deploy tar)
// script: output/server/index.mjs (local build uses .output/, renamed to output/ in tar)

module.exports = {
  apps: [
    {
      name: 'BlogHomeNuxt',
      port: '5050',
      script: 'output/server/index.mjs',
      exec_mode: 'fork',
      instances: '2',
      watch: false,
      autorestart: true,
      max_memory_restart: '500M',
      error_file: './logs/app-err.log',
      out_file: './logs/app-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      min_uptime: '60s',
      max_restarts: 30,
      restart_delay: 60,
      env_production: {
        NODE_ENV: 'production',
        PORT: '5050',
      },
    },
  ],
};
