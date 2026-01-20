module.exports = {
  apps: [
    {
      name: 'gruppo-cestari',
      cwd: '/var/www/projects/gruppo-cestari',
      script: 'node_modules/.bin/next',
      args: 'start -p 3016',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: '3016',
      },
      error_file: '/var/www/projects/gruppo-cestari/logs/error.log',
      out_file: '/var/www/projects/gruppo-cestari/logs/out.log',
      log_file: '/var/www/projects/gruppo-cestari/logs/combined.log',
      time: true,
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      kill_timeout: 10000,
      max_memory_restart: '1024M',
    },
  ],
};
